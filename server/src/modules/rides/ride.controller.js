const rideService = require('./ride.service');
const { calculateRouteMatch } = require('./ride.matching');

const createRide = async (req, res, next) => {
    try {
        const driverId = req.user.id;
        const {
            origin_address, origin_lat, origin_lng,
            destination_address, destination_lat, destination_lng,
            departure_time, total_seats, price_per_seat,
            vehicle_info, notes, waypoints, estimated_duration,
            preferences, tags,
        } = req.body;

        const rideData = {
            driver_id: driverId,
            origin_address,
            origin_lat,
            origin_lng,
            destination_address,
            destination_lat,
            destination_lng,
            departure_time,
            total_seats,
            price_per_seat,
        };

        // vehicle_info is JSONB in DB — wrap string in object
        if (vehicle_info) {
            rideData.vehicle_info = typeof vehicle_info === 'string'
                ? { description: vehicle_info }
                : vehicle_info;
        }

        if (notes) rideData.notes = notes;
        if (preferences) rideData.preferences = typeof preferences === 'object' ? preferences : {};

        if (waypoints) rideData.waypoints = waypoints;
        if (estimated_duration) rideData.estimated_duration = estimated_duration;
        if (tags) rideData.tags = tags;

        const ride = await rideService.create(rideData);

        res.status(201).json({
            success: true,
            data: ride,
            message: 'Ride created successfully',
        });
    } catch (err) {
        next(err);
    }
};

const getRides = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, min_seats, min_price, max_price, date } = req.query;

        const result = await rideService.findAll({
            status: status || 'active',
            page: parseInt(page),
            limit: parseInt(limit),
            filters: { min_seats, min_price, max_price, date },
        });

        res.json({
            success: true,
            data: result.rides,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        });
    } catch (err) {
        next(err);
    }
};

const getRideById = async (req, res, next) => {
    try {
        const ride = await rideService.findById(req.params.id);

        res.json({
            success: true,
            data: ride,
        });
    } catch (err) {
        next(err);
    }
};

const getMyRides = async (req, res, next) => {
    try {
        const rides = await rideService.findByDriver(req.user.id);

        res.json({
            success: true,
            data: rides,
        });
    } catch (err) {
        next(err);
    }
};

const updateRide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id;

        const updated = await rideService.update(id, driverId, req.body);

        res.json({
            success: true,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
};

const updateRideStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await rideService.updateStatus(id, status);

        res.json({
            success: true,
            data: updated,
            message: `Ride status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};

const cancelRide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id;

        const cancelled = await rideService.cancel(id, driverId);

        res.json({
            success: true,
            data: cancelled,
            message: 'Ride cancelled',
        });
    } catch (err) {
        next(err);
    }
};

const matchRide = async (req, res, next) => {
    try {
        const { origin_lat, origin_lng, destination_lat, destination_lng } = req.query;

        if (!origin_lat || !origin_lng || !destination_lat || !destination_lng) {
            return res.status(400).json({
                success: false,
                error: { message: 'Origin and destination coordinates required' },
            });
        }

        const riderOrigin = { lat: parseFloat(origin_lat), lng: parseFloat(origin_lng) };
        const riderDest = { lat: parseFloat(destination_lat), lng: parseFloat(destination_lng) };

        // Get active rides
        const { rides } = await rideService.findAll({ status: 'active', limit: 100 });

        // Calculate match percentage for each ride
        const matched = rides.map((ride) => {
            const matchPercent = calculateRouteMatch(
                riderOrigin,
                riderDest,
                { lat: ride.origin_lat, lng: ride.origin_lng },
                { lat: ride.destination_lat, lng: ride.destination_lng },
                ride.waypoints || []
            );
            return { ...ride, match_percent: matchPercent };
        });

        // Sort by match percentage descending, filter out very low matches
        const results = matched
            .filter((r) => r.match_percent > 10)
            .sort((a, b) => b.match_percent - a.match_percent);

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createRide,
    getRides,
    getRideById,
    getMyRides,
    updateRide,
    updateRideStatus,
    cancelRide,
    matchRide,
};
