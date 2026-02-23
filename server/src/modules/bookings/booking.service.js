const { supabaseAdmin } = require('../../config/supabase');
const rideService = require('../rides/ride.service');

class BookingService {
    async create(bookingData) {
        // Validate ride exists and has seats
        const ride = await rideService.findById(bookingData.ride_id);

        if (ride.status !== 'active') {
            throw new Error('This ride is no longer accepting bookings');
        }

        if (ride.driver_id === bookingData.rider_id) {
            throw new Error('You cannot book your own ride');
        }

        const seatsWanted = bookingData.seats_booked || 1;
        if (ride.available_seats < seatsWanted) {
            throw new Error(`Not enough seats. Available: ${ride.available_seats}`);
        }

        // Check for duplicate booking
        const { data: existing } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('ride_id', bookingData.ride_id)
            .eq('rider_id', bookingData.rider_id)
            .in('status', ['pending', 'confirmed'])
            .maybeSingle();

        if (existing) {
            throw new Error('You already have an active booking for this ride');
        }

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .insert({
                ride_id: bookingData.ride_id,
                rider_id: bookingData.rider_id,
                seats_booked: seatsWanted,
                agreed_price: bookingData.agreed_price || ride.price_per_seat,
                pickup_address: bookingData.pickup_address || null,
                pickup_lat: bookingData.pickup_lat || null,
                pickup_lng: bookingData.pickup_lng || null,
                dropoff_address: bookingData.dropoff_address || null,
                dropoff_lat: bookingData.dropoff_lat || null,
                dropoff_lng: bookingData.dropoff_lng || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create booking: ${error.message}`);
        return data;
    }

    async findById(bookingId) {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                ride:rides!ride_id (
                    id, origin_address, destination_address, departure_time,
                    price_per_seat, status, driver_id,
                    driver:profiles!driver_id (id, full_name, avatar_url, rating_avg)
                ),
                rider:profiles!rider_id (id, full_name, avatar_url, rating_avg)
            `)
            .eq('id', bookingId)
            .single();

        if (error) throw new Error(`Booking not found: ${error.message}`);
        return data;
    }

    async findByRide(rideId) {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                rider:profiles!rider_id (id, full_name, avatar_url, rating_avg)
            `)
            .eq('ride_id', rideId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);
        return data || [];
    }

    async findByRider(riderId) {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                ride:rides!ride_id (
                    id, origin_address, destination_address, departure_time,
                    price_per_seat, status,
                    driver:profiles!driver_id (id, full_name, avatar_url, rating_avg)
                )
            `)
            .eq('rider_id', riderId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch rider bookings: ${error.message}`);
        return data || [];
    }

    async confirm(bookingId, driverId) {
        const booking = await this.findById(bookingId);

        if (booking.ride.driver_id !== driverId) {
            throw new Error('Only the ride driver can confirm bookings');
        }
        if (booking.status !== 'pending') {
            throw new Error(`Cannot confirm a ${booking.status} booking`);
        }

        // Deduct seats from ride
        await rideService.deductSeats(booking.ride_id, booking.seats_booked);

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw new Error(`Failed to confirm booking: ${error.message}`);
        return data;
    }

    async cancel(bookingId, userId) {
        const booking = await this.findById(bookingId);

        const isRider = booking.rider_id === userId;
        const isDriver = booking.ride.driver_id === userId;

        if (!isRider && !isDriver) {
            throw new Error('You are not authorized to cancel this booking');
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            throw new Error(`Cannot cancel a ${booking.status} booking`);
        }

        // Restore seats if was confirmed
        if (booking.status === 'confirmed') {
            await rideService.restoreSeats(booking.ride_id, booking.seats_booked);
        }

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw new Error(`Failed to cancel booking: ${error.message}`);
        return data;
    }

    async updateConfirmation(bookingId, userId, role) {
        const booking = await this.findById(bookingId);
        const updateField = role === 'driver' ? 'driver_confirmed' : 'rider_confirmed';

        if (role === 'driver' && booking.ride.driver_id !== userId) {
            throw new Error('Not authorized');
        }
        if (role === 'rider' && booking.rider_id !== userId) {
            throw new Error('Not authorized');
        }

        const updates = { [updateField]: true, updated_at: new Date().toISOString() };

        // If both confirmed, mark as completed
        const otherField = role === 'driver' ? 'rider_confirmed' : 'driver_confirmed';
        if (booking[otherField]) {
            updates.status = 'completed';
        }

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update(updates)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update confirmation: ${error.message}`);
        return data;
    }
}

module.exports = new BookingService();
