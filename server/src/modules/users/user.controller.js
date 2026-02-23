const userService = require('./user.service');

const getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const profile = await userService.findById(id);

        res.json({
            success: true,
            data: profile,
        });
    } catch (err) {
        next(err);
    }
};

const getMyProfile = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: req.user,
        });
    } catch (err) {
        next(err);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, avatar_url } = req.body;

        const updated = await userService.updateProfile(userId, {
            ...(full_name && { full_name }),
            ...(phone && { phone }),
            ...(avatar_url && { avatar_url }),
        });

        res.json({
            success: true,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { role } = req.body;

        const updated = await userService.updateRole(userId, role);

        res.json({
            success: true,
            data: updated,
            message: `Role updated to ${role}`,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProfile, getMyProfile, updateProfile, updateRole };
