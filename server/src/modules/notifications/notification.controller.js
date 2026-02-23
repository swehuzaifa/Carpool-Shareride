const notificationService = require('./notification.service');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const unreadOnly = req.query.unread === 'true';
        const notifications = await notificationService.findByUser(req.user.id, { unreadOnly });
        res.json({ data: notifications });
    } catch (err) {
        next(err);
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        res.json({ data: { count } });
    } catch (err) {
        next(err);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notif = await notificationService.markAsRead(req.params.id, req.user.id);
        res.json({ data: notif });
    } catch (err) {
        next(err);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
};
