const ratingService = require('./rating.service');

exports.createRating = async (req, res, next) => {
    try {
        const rating = await ratingService.create({
            ride_id: req.body.ride_id,
            from_user_id: req.user.id,
            to_user_id: req.body.to_user_id,
            rating: req.body.rating,
            review: req.body.review,
        });
        res.status(201).json({ data: rating });
    } catch (err) {
        next(err);
    }
};

exports.getUserRatings = async (req, res, next) => {
    try {
        const ratings = await ratingService.findByUser(req.params.userId);
        res.json({ data: ratings });
    } catch (err) {
        next(err);
    }
};

exports.getRideRatings = async (req, res, next) => {
    try {
        const ratings = await ratingService.findByRide(req.params.rideId);
        res.json({ data: ratings });
    } catch (err) {
        next(err);
    }
};
