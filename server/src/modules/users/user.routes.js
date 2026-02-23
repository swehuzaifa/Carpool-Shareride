const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/verifyToken');
const { getProfile, getMyProfile, updateProfile, updateRole } = require('./user.controller');

// Get current user's profile
router.get('/me', verifyToken, getMyProfile);

// Get any user's profile by ID
router.get('/:id', verifyToken, getProfile);

// Update current user's profile
router.put('/me', verifyToken, updateProfile);

// Update current user's role
router.put('/me/role', verifyToken, updateRole);

module.exports = router;
