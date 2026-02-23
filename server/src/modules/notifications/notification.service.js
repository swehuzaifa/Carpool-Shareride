const { supabaseAdmin } = require('../../config/supabase');

class NotificationService {
    async create({ user_id, type, title, body, data = {} }) {
        const { data: notif, error } = await supabaseAdmin
            .from('notifications')
            .insert({ user_id, type, title, body, data })
            .select()
            .single();

        if (error) throw new Error(`Failed to create notification: ${error.message}`);
        return notif;
    }

    async findByUser(userId, { limit = 30, unreadOnly = false } = {}) {
        let query = supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
        return data || [];
    }

    async markAsRead(notifId, userId) {
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notifId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
        return data;
    }

    async markAllAsRead(userId) {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw new Error(`Failed to mark all as read: ${error.message}`);
        return { success: true };
    }

    async getUnreadCount(userId) {
        const { count, error } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw new Error(`Failed to count notifications: ${error.message}`);
        return count || 0;
    }
}

module.exports = new NotificationService();
