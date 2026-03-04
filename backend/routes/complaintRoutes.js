const express = require('express');
const router = express.Router();
const {
    createComplaint,
    trackComplaint,
    getMyComplaints,
    getDepartmentComplaints,
    updateComplaintStatus,
    addComplaintResponse,
    recalculatePriorities
} = require('../controllers/complaintController');
const { protect, requireDepartmentSetup, optionalProtect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Complaint creation uses optionalProtect: attaches user if logged in, allows anonymous
router.post('/', optionalProtect, upload.single('image'), createComplaint);
router.get('/track/:complaintId', trackComplaint);

// Protected routes
router.get('/my', protect, getMyComplaints);
router.get('/department', protect, authorize('Department'), requireDepartmentSetup, getDepartmentComplaints);
router.put('/:id/status', protect, authorize('Department', 'Admin'), requireDepartmentSetup, updateComplaintStatus);
router.post('/:id/responses', protect, authorize('Department', 'Admin'), requireDepartmentSetup, addComplaintResponse);

// Recalculate priorities for all active complaints (Level 3 Smart Priority)
router.post('/recalculate-priority', protect, authorize('Department', 'Admin'), recalculatePriorities);

module.exports = router;

