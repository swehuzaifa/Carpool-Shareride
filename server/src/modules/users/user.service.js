const { supabaseAdmin } = require('../../config/supabase');

class UserService {
    async findById(userId) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw new Error(`User not found: ${error.message}`);
        return data;
    }

    async findByEmail(email) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data;
    }

    async upsertProfile(userId, profileData) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .upsert(
                {
                    id: userId,
                    ...profileData,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
            )
            .select()
            .single();

        if (error) throw new Error(`Failed to upsert profile: ${error.message}`);
        return data;
    }

    async updateProfile(userId, updates) {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update profile: ${error.message}`);
        return data;
    }

    async updateRole(userId, role) {
        if (!['rider', 'driver', 'both'].includes(role)) {
            throw new Error('Invalid role. Must be rider, driver, or both');
        }

        return this.updateProfile(userId, { role });
    }

    async updateRating(userId) {
        // Calculate average rating from ratings table
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .select('rating')
            .eq('to_user_id', userId);

        if (error) throw new Error(`Failed to fetch ratings: ${error.message}`);

        if (data && data.length > 0) {
            const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
            await this.updateProfile(userId, {
                rating_avg: parseFloat(avg.toFixed(2)),
                total_rides: data.length,
            });
        }
    }
}

module.exports = new UserService();
