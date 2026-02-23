const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/verifyToken');
const { roleGuard } = require('../../middleware/roleGuard');
const {
    createRide,
    getRides,
    getRideById,
    getMyRides,
    updateRide,
    updateRideStatus,
    cancelRide,
    matchRide,
} = require('./ride.controller');

// Public: browse rides
router.get('/', getRides);
router.get('/match', matchRide);
router.get('/:id', getRideById);

// Protected: driver operations
router.post('/', verifyToken, roleGuard('driver', 'both'), createRide);
router.get('/my/rides', verifyToken, roleGuard('driver', 'both'), getMyRides);
router.put('/:id', verifyToken, roleGuard('driver', 'both'), updateRide);
router.put('/:id/status', verifyToken, roleGuard('driver', 'both'), updateRideStatus);
router.delete('/:id', verifyToken, roleGuard('driver', 'both'), cancelRide);

module.exports = router;
