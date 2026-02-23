/**
 * Route-overlap matching algorithm
 * Calculates how well a rider's route matches a driver's route
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance between two lat/lng points
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

/**
 * Calculate match percentage between rider and driver routes
 *
 * @param {Object} riderOrigin - { lat, lng }
 * @param {Object} riderDestination - { lat, lng }
 * @param {Object} driverOrigin - { lat, lng }
 * @param {Object} driverDestination - { lat, lng }
 * @param {Array} driverWaypoints - [{ lat, lng }, ...]
 * @returns {number} Match percentage 0-100
 */
function calculateRouteMatch(riderOrigin, riderDestination, driverOrigin, driverDestination, driverWaypoints = []) {
    // Max detour threshold in km
    const MAX_DETOUR_KM = 5;

    // Build driver route points
    const routePoints = [
        driverOrigin,
        ...driverWaypoints,
        driverDestination,
    ];

    // Find nearest point on driver route to rider's pickup
    let minPickupDist = Infinity;
    for (const point of routePoints) {
        const dist = haversineDistance(riderOrigin.lat, riderOrigin.lng, point.lat, point.lng);
        minPickupDist = Math.min(minPickupDist, dist);
    }

    // Find nearest point on driver route to rider's dropoff
    let minDropoffDist = Infinity;
    for (const point of routePoints) {
        const dist = haversineDistance(riderDestination.lat, riderDestination.lng, point.lat, point.lng);
        minDropoffDist = Math.min(minDropoffDist, dist);
    }

    // Calculate pickup score (0-50 points)
    const pickupScore = Math.max(0, 50 * (1 - minPickupDist / MAX_DETOUR_KM));

    // Calculate dropoff score (0-50 points)
    const dropoffScore = Math.max(0, 50 * (1 - minDropoffDist / MAX_DETOUR_KM));

    // Direction check: rider's trip should go in same general direction as driver's
    const driverBearing = getBearing(driverOrigin, driverDestination);
    const riderBearing = getBearing(riderOrigin, riderDestination);
    const bearingDiff = Math.abs(driverBearing - riderBearing);
    const normalizedDiff = bearingDiff > 180 ? 360 - bearingDiff : bearingDiff;

    // Penalize if going in very different directions (>90 degrees)
    const directionPenalty = normalizedDiff > 90 ? (normalizedDiff - 90) / 90 * 20 : 0;

    const totalScore = Math.max(0, Math.min(100, pickupScore + dropoffScore - directionPenalty));
    return Math.round(totalScore);
}

/**
 * Get bearing between two points in degrees
 */
function getBearing(from, to) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const dLng = toRad(to.lng - from.lng);
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);

    const x = Math.sin(dLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    return (toDeg(Math.atan2(x, y)) + 360) % 360;
}

module.exports = { calculateRouteMatch, haversineDistance };
