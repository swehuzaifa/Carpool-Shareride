const router = require('express').Router();
const { verifyToken } = require('../../middleware/verifyToken');
const ctrl = require('./booking.controller');

// All booking routes require authentication
router.use(verifyToken);

router.post('/', ctrl.createBooking);
router.get('/me', ctrl.getMyBookings);
router.get('/ride/:rideId', ctrl.getBookingsByRide);
router.get('/:id', ctrl.getBookingById);
router.post('/:id/confirm', ctrl.confirmBooking);
router.post('/:id/cancel', ctrl.cancelBooking);
router.post('/:id/dual-confirm', ctrl.dualConfirm);

module.exports = router;
