const express = require('express');
const router = express.Router();
const {
    getUsers,
    getAllComplaints,
    deleteUser,
    updateUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.get('/complaints', getAllComplaints);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

module.exports = router;
