const { supabaseAdmin } = require('../../config/supabase');

class RideService {
    async create(rideData) {
        const { data, error } = await supabaseAdmin
            .from('rides')
            .insert({
                ...rideData,
                available_seats: rideData.total_seats,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create ride: ${error.message}`);
        return data;
    }

    async findById(rideId) {
        const { data, error } = await supabaseAdmin
            .from('rides')
            .select(`
                *,
                driver:profiles!driver_id (
                    id, full_name, email, avatar_url, rating_avg, total_rides
                )
            `)
            .eq('id', rideId)
            .single();

        if (error) throw new Error(`Ride not found: ${error.message}`);
        return data;
    }

    async findAll({ status = 'active', page = 1, limit = 20, filters = {} }) {
        let query = supabaseAdmin
            .from('rides')
            .select(`
                *,
                driver:profiles!driver_id (
                    id, full_name, avatar_url, rating_avg, total_rides
                )
            `, { count: 'exact' })
            .order('departure_time', { ascending: true });

        // Status filter
        if (status) {
            query = query.eq('status', status);
        }

        // Only future rides
        query = query.gte('departure_time', new Date().toISOString());

        // Available seats filter
        if (filters.min_seats) {
            query = query.gte('available_seats', filters.min_seats);
        }

        // Price range
        if (filters.min_price) {
            query = query.gte('price_per_seat', filters.min_price);
        }
        if (filters.max_price) {
            query = query.lte('price_per_seat', filters.max_price);
        }

        // Date filter
        if (filters.date) {
            const dayStart = new Date(filters.date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(filters.date);
            dayEnd.setHours(23, 59, 59, 999);
            query = query
                .gte('departure_time', dayStart.toISOString())
                .lte('departure_time', dayEnd.toISOString());
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw new Error(`Failed to fetch rides: ${error.message}`);

        return {
            rides: data || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        };
    }

    async findByDriver(driverId) {
        const { data, error } = await supabaseAdmin
            .from('rides')
            .select('*')
            .eq('driver_id', driverId)
            .order('departure_time', { ascending: false });

        if (error) throw new Error(`Failed to fetch driver rides: ${error.message}`);
        return data || [];
    }

    async update(rideId, driverId, updates) {
        const { data, error } = await supabaseAdmin
            .from('rides')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', rideId)
            .eq('driver_id', driverId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update ride: ${error.message}`);
        return data;
    }

    async updateStatus(rideId, status) {
        const validTransitions = {
            active: ['arrived', 'cancelled'],
            arrived: ['ongoing', 'cancelled'],
            ongoing: ['completed'],
            completed: [],
            cancelled: [],
        };

        const ride = await this.findById(rideId);
        const currentStatus = ride.status;

        if (!validTransitions[currentStatus]?.includes(status)) {
            throw new Error(`Invalid transition: ${currentStatus} → ${status}`);
        }

        return this.update(rideId, ride.driver_id, { status });
    }

    async cancel(rideId, driverId) {
        return this.update(rideId, driverId, { status: 'cancelled' });
    }

    async deductSeats(rideId, seatsCount) {
        const ride = await this.findById(rideId);

        if (ride.available_seats < seatsCount) {
            throw new Error(`Not enough seats. Available: ${ride.available_seats}`);
        }

        const { data, error } = await supabaseAdmin
            .from('rides')
            .update({
                available_seats: ride.available_seats - seatsCount,
                updated_at: new Date().toISOString(),
            })
            .eq('id', rideId)
            .select()
            .single();

        if (error) throw new Error(`Failed to deduct seats: ${error.message}`);
        return data;
    }

    async restoreSeats(rideId, seatsCount) {
        const ride = await this.findById(rideId);

        const newAvailable = Math.min(ride.available_seats + seatsCount, ride.total_seats);

        const { data, error } = await supabaseAdmin
            .from('rides')
            .update({
                available_seats: newAvailable,
                updated_at: new Date().toISOString(),
            })
            .eq('id', rideId)
            .select()
            .single();

        if (error) throw new Error(`Failed to restore seats: ${error.message}`);
        return data;
    }
}

module.exports = new RideService();
