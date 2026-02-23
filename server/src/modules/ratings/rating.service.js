const { supabaseAdmin } = require('../../config/supabase');

class RatingService {
    async create(ratingData) {
        // Check if already rated
        const { data: existing } = await supabaseAdmin
            .from('ratings')
            .select('id')
            .eq('ride_id', ratingData.ride_id)
            .eq('from_user_id', ratingData.from_user_id)
            .eq('to_user_id', ratingData.to_user_id)
            .maybeSingle();

        if (existing) {
            throw new Error('You have already rated this user for this ride');
        }

        const { data, error } = await supabaseAdmin
            .from('ratings')
            .insert({
                ride_id: ratingData.ride_id,
                from_user_id: ratingData.from_user_id,
                to_user_id: ratingData.to_user_id,
                rating: ratingData.rating,
                review: ratingData.review || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create rating: ${error.message}`);

        // Update user's average rating
        await this.recalculateAvg(ratingData.to_user_id);

        return data;
    }

    async recalculateAvg(userId) {
        const { data: ratings } = await supabaseAdmin
            .from('ratings')
            .select('rating')
            .eq('to_user_id', userId);

        if (!ratings || ratings.length === 0) return;

        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        await supabaseAdmin
            .from('profiles')
            .update({ rating_avg: avg.toFixed(2), total_rides: ratings.length })
            .eq('id', userId);
    }

    async findByUser(userId) {
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .select(`
                *,
                from_user:profiles!from_user_id (id, full_name, avatar_url),
                to_user:profiles!to_user_id (id, full_name, avatar_url)
            `)
            .eq('to_user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch ratings: ${error.message}`);
        return data || [];
    }

    async findByRide(rideId) {
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .select(`
                *,
                from_user:profiles!from_user_id (id, full_name, avatar_url),
                to_user:profiles!to_user_id (id, full_name, avatar_url)
            `)
            .eq('ride_id', rideId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch ride ratings: ${error.message}`);
        return data || [];
    }
}

module.exports = new RatingService();
