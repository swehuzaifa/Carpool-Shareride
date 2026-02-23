const router = require('express').Router();
const { verifyToken } = require('../../middleware/verifyToken');
const ctrl = require('./notification.controller');

router.use(verifyToken);

router.get('/', ctrl.getMyNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.post('/:id/read', ctrl.markAsRead);
router.post('/read-all', ctrl.markAllAsRead);

module.exports = router;
