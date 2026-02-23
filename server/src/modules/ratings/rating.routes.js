const router = require('express').Router();
const { verifyToken } = require('../../middleware/verifyToken');
const ctrl = require('./rating.controller');

router.post('/', verifyToken, ctrl.createRating);
router.get('/user/:userId', ctrl.getUserRatings);
router.get('/ride/:rideId', ctrl.getRideRatings);

module.exports = router;
