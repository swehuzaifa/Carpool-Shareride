const { supabaseAdmin } = require('../../config/supabase');

class OfferService {
    async create(offerData) {
        // Check duplicate
        const { data: existing } = await supabaseAdmin
            .from('offers')
            .select('id')
            .eq('ride_id', offerData.ride_id)
            .eq('rider_id', offerData.rider_id)
            .in('status', ['pending', 'countered'])
            .maybeSingle();

        if (existing) {
            throw new Error('You already have an active offer for this ride');
        }

        const { data, error } = await supabaseAdmin
            .from('offers')
            .insert({
                ride_id: offerData.ride_id,
                rider_id: offerData.rider_id,
                offered_price: offerData.offered_price,
                message: offerData.message || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create offer: ${error.message}`);
        return data;
    }

    async findById(offerId) {
        const { data, error } = await supabaseAdmin
            .from('offers')
            .select(`
                *,
                ride:rides!ride_id (
                    id, origin_address, destination_address, departure_time,
                    price_per_seat, driver_id,
                    driver:profiles!driver_id (id, full_name, avatar_url)
                ),
                rider:profiles!rider_id (id, full_name, avatar_url, rating_avg)
            `)
            .eq('id', offerId)
            .single();

        if (error) throw new Error(`Offer not found: ${error.message}`);
        return data;
    }

    async findByRide(rideId) {
        const { data, error } = await supabaseAdmin
            .from('offers')
            .select(`
                *,
                rider:profiles!rider_id (id, full_name, avatar_url, rating_avg)
            `)
            .eq('ride_id', rideId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch offers: ${error.message}`);
        return data || [];
    }

    async findByRider(riderId) {
        const { data, error } = await supabaseAdmin
            .from('offers')
            .select(`
                *,
                ride:rides!ride_id (
                    id, origin_address, destination_address, departure_time,
                    price_per_seat, status,
                    driver:profiles!driver_id (id, full_name, avatar_url)
                )
            `)
            .eq('rider_id', riderId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch rider offers: ${error.message}`);
        return data || [];
    }

    async counter(offerId, driverId, counterPrice) {
        const offer = await this.findById(offerId);

        if (offer.ride.driver_id !== driverId) {
            throw new Error('Only the ride driver can counter offers');
        }
        if (offer.status !== 'pending') {
            throw new Error(`Cannot counter a ${offer.status} offer`);
        }

        const { data, error } = await supabaseAdmin
            .from('offers')
            .update({
                counter_price: counterPrice,
                status: 'countered',
                updated_at: new Date().toISOString(),
            })
            .eq('id', offerId)
            .select()
            .single();

        if (error) throw new Error(`Failed to counter offer: ${error.message}`);
        return data;
    }

    async accept(offerId, driverId) {
        const offer = await this.findById(offerId);

        if (offer.ride.driver_id !== driverId) {
            throw new Error('Only the ride driver can accept offers');
        }
        if (!['pending', 'countered'].includes(offer.status)) {
            throw new Error(`Cannot accept a ${offer.status} offer`);
        }

        const { data, error } = await supabaseAdmin
            .from('offers')
            .update({
                status: 'accepted',
                updated_at: new Date().toISOString(),
            })
            .eq('id', offerId)
            .select()
            .single();

        if (error) throw new Error(`Failed to accept offer: ${error.message}`);
        return data;
    }

    async reject(offerId, driverId) {
        const offer = await this.findById(offerId);

        if (offer.ride.driver_id !== driverId) {
            throw new Error('Only the ride driver can reject offers');
        }

        const { data, error } = await supabaseAdmin
            .from('offers')
            .update({
                status: 'rejected',
                updated_at: new Date().toISOString(),
            })
            .eq('id', offerId)
            .select()
            .single();

        if (error) throw new Error(`Failed to reject offer: ${error.message}`);
        return data;
    }
}

module.exports = new OfferService();
