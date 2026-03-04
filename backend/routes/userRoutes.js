const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// The instruction requested: PUT /api/users/profile
router.put('/profile', protect, updateProfile);

module.exports = router;
