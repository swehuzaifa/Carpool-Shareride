const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/verifyToken');
const userService = require('../users/user.service');

/**
 * POST /api/auth/sync
 * Called after Supabase login to ensure profile exists in our DB
 */
router.post('/sync', verifyToken, async (req, res, next) => {
    try {
        const { id, email } = req.user;
        const { full_name } = req.body;

        const profile = await userService.upsertProfile(id, {
            email,
            full_name: full_name || req.user.full_name || '',
        });

        res.json({
            success: true,
            data: profile,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile
 */
router.get('/me', verifyToken, async (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
});

module.exports = router;
