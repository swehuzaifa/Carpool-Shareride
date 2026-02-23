const offerService = require('./offer.service');

exports.createOffer = async (req, res, next) => {
    try {
        const offer = await offerService.create({
            ride_id: req.body.ride_id,
            rider_id: req.user.id,
            offered_price: req.body.offered_price,
            message: req.body.message,
        });
        res.status(201).json({ data: offer });
    } catch (err) {
        next(err);
    }
};

exports.getMyOffers = async (req, res, next) => {
    try {
        const offers = await offerService.findByRider(req.user.id);
        res.json({ data: offers });
    } catch (err) {
        next(err);
    }
};

exports.getOffersByRide = async (req, res, next) => {
    try {
        const offers = await offerService.findByRide(req.params.rideId);
        res.json({ data: offers });
    } catch (err) {
        next(err);
    }
};

exports.getOfferById = async (req, res, next) => {
    try {
        const offer = await offerService.findById(req.params.id);
        res.json({ data: offer });
    } catch (err) {
        next(err);
    }
};

exports.counterOffer = async (req, res, next) => {
    try {
        const offer = await offerService.counter(req.params.id, req.user.id, req.body.counter_price);
        res.json({ data: offer, message: 'Counter offer sent' });
    } catch (err) {
        next(err);
    }
};

exports.acceptOffer = async (req, res, next) => {
    try {
        const offer = await offerService.accept(req.params.id, req.user.id);
        res.json({ data: offer, message: 'Offer accepted' });
    } catch (err) {
        next(err);
    }
};

exports.rejectOffer = async (req, res, next) => {
    try {
        const offer = await offerService.reject(req.params.id, req.user.id);
        res.json({ data: offer, message: 'Offer rejected' });
    } catch (err) {
        next(err);
    }
};
