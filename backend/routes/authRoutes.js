const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, setupDepartmentProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/setup-department', protect, authorize('Department'), setupDepartmentProfile);

module.exports = router;
