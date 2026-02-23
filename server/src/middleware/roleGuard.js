/**
 * Role guard middleware factory
 * Usage: roleGuard('driver') or roleGuard('driver', 'both')
 */
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required' },
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole) && userRole !== 'both') {
            return res.status(403).json({
                success: false,
                error: {
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                },
            });
        }

        next();
    };
};

module.exports = { roleGuard };
