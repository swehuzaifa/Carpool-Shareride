const router = require('express').Router();
const { verifyToken } = require('../../middleware/verifyToken');
const ctrl = require('./offer.controller');

router.use(verifyToken);

router.post('/', ctrl.createOffer);
router.get('/me', ctrl.getMyOffers);
router.get('/ride/:rideId', ctrl.getOffersByRide);
router.get('/:id', ctrl.getOfferById);
router.post('/:id/counter', ctrl.counterOffer);
router.post('/:id/accept', ctrl.acceptOffer);
router.post('/:id/reject', ctrl.rejectOffer);

module.exports = router;
