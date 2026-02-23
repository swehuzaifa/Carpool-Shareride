const bookingService = require('./booking.service');

exports.createBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.create({
            ride_id: req.body.ride_id,
            rider_id: req.user.id,
            seats_booked: req.body.seats_booked,
            agreed_price: req.body.agreed_price,
            pickup_address: req.body.pickup_address,
            pickup_lat: req.body.pickup_lat,
            pickup_lng: req.body.pickup_lng,
            dropoff_address: req.body.dropoff_address,
            dropoff_lat: req.body.dropoff_lat,
            dropoff_lng: req.body.dropoff_lng,
        });
        res.status(201).json({ data: booking });
    } catch (err) {
        next(err);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.findByRider(req.user.id);
        res.json({ data: bookings });
    } catch (err) {
        next(err);
    }
};

exports.getBookingsByRide = async (req, res, next) => {
    try {
        const bookings = await bookingService.findByRide(req.params.rideId);
        res.json({ data: bookings });
    } catch (err) {
        next(err);
    }
};

exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await bookingService.findById(req.params.id);
        res.json({ data: booking });
    } catch (err) {
        next(err);
    }
};

exports.confirmBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.confirm(req.params.id, req.user.id);
        res.json({ data: booking, message: 'Booking confirmed' });
    } catch (err) {
        next(err);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.cancel(req.params.id, req.user.id);
        res.json({ data: booking, message: 'Booking cancelled' });
    } catch (err) {
        next(err);
    }
};

exports.dualConfirm = async (req, res, next) => {
    try {
        const { role } = req.body; // 'driver' or 'rider'
        const booking = await bookingService.updateConfirmation(req.params.id, req.user.id, role);
        res.json({ data: booking, message: `${role} confirmation recorded` });
    } catch (err) {
        next(err);
    }
};
