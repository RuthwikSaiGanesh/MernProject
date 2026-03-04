const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Helper: Calculate Level 3 Smart Priority score
// densityScore + timeScore + severityScore → Low/Medium/High
const calculatePriority = (similarCount, daysPending, category) => {
    try {
        const densityScore = similarCount || 0;
        const timeScore = Math.floor((daysPending || 0) / 2);
        const severityScore = (category === 'Critical') ? 3 : 0;
        const totalScore = densityScore + timeScore + severityScore;

        if (totalScore >= 11) return 'High';
        if (totalScore >= 6) return 'Medium';
        return 'Low';
    } catch (err) {
        return 'Low';
    }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Public (or Private depending on isAnonymous)
const createComplaint = asyncHandler(async (req, res) => {
    const { title, description, department, lat, lng, address, village, taluk, district, pincode, isAnonymous, category } = req.body;

    if (!title || !description || !department || !address || !taluk || !district || !pincode) {
        res.status(400);
        throw new Error('Please provide all required fields including location address');
    }

    const isAnon = isAnonymous === 'true' || isAnonymous === true;

    // Attach user if authenticated and not anonymous
    let userId = null;
    if (!isAnon && req.user) {
        userId = req.user._id;

        // DISTRICT VALIDATION FOR LOGGED IN CITIZENS
        if (req.user.district !== district.trim()) {
            res.status(400);
            throw new Error('Complaint cannot be registered because the selected department does not operate in your district.');
        }
    }

    // Normalize department name for consistent matching
    const normalizedDepartment = department.trim();

    // MISSING DEPARTMENT VALIDATION
    const departmentExists = await User.findOne({
        role: 'Department',
        department: normalizedDepartment,
        district: district.trim()
    });

    if (!departmentExists) {
        res.status(400);
        throw new Error('No department available for this service in your district.');
    }

    const complaintId = `CMP-${uuidv4().substring(0, 8).toUpperCase()}`;

    let imagePath = null;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    }

    // Level 3 Smart Priority: density + time + severity
    const similarComplaintsCount = await Complaint.countDocuments({
        department: normalizedDepartment,
        'location.district': district.trim(),
        'location.taluk': taluk.trim(),
        status: { $nin: ['Finished'] }
    });

    const daysPending = 0;
    const complaintCategory = category || 'General';
    const calculatedPriority = calculatePriority(similarComplaintsCount, daysPending, complaintCategory);

    const complaint = await Complaint.create({
        complaintId,
        user: userId,
        title: title.trim(),
        description: description.trim(),
        department: normalizedDepartment,
        image: imagePath,
        isAnonymous: isAnon,
        priority: calculatedPriority,
        category: complaintCategory,
        location: {
            lat: lat ? parseFloat(lat) : undefined,
            lng: lng ? parseFloat(lng) : undefined,
            address: address.trim(),
            village: village ? village.trim() : '',
            taluk: taluk.trim(),
            district: district.trim(),
            pincode: pincode.trim()
        }
    });

    if (complaint) {
        console.log(`[COMPLAINT SAVED] ID: ${complaint.complaintId}, Dept: ${complaint.department}, User: ${userId}, Priority: ${calculatedPriority}`);
        res.status(201).json(complaint);
    } else {
        res.status(500);
        throw new Error('Failed to save complaint');
    }
});

// @desc    Get complaint by ID for tracking
// @route   GET /api/complaints/track/:complaintId
// @access  Public
const trackComplaint = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
        .populate('user', 'name -_id');

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    res.status(200).json(complaint);
});

// @desc    Get logged in user complaints
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    // Always return array
    res.status(200).json(Array.isArray(complaints) ? complaints : []);
});

// @desc    Get complaints for department dashboard
// @route   GET /api/complaints/department
// @access  Private (Department)
const getDepartmentComplaints = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Department') {
        res.status(403);
        throw new Error('Not authorized for department dashboard');
    }

    if (!req.user.departmentInfo || !req.user.departmentInfo.officeLocation) {
        res.status(403);
        throw new Error('Department profile incomplete. Please set up your profile first.');
    }

    // Match department name exactly (trimmed for consistency)
    const deptName = (req.user.department || '').trim();
    console.log(`[DEPT QUERY] Fetching complaints for department: "${deptName}"`);

    let complaints = await Complaint.find({ department: deptName }).lean();
    if (!complaints || !Array.isArray(complaints)) {
        complaints = [];
    }

    console.log(`[DEPT QUERY] Found ${complaints.length} complaints for "${deptName}"`);

    // Sort High → Medium → Low
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    complaints.sort((a, b) => {
        const pA = priorityWeight[a.priority] || 1;
        const pB = priorityWeight[b.priority] || 1;
        const diff = pB - pA;
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(200).json(complaints);
});

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Department / Admin)
const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    // Validate allowed statuses
    const allowedStatuses = ['Reached', 'In Progress', 'Finished'];
    if (status && !allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    if (req.user.role === 'Department') {
        if (!req.user.departmentInfo || !req.user.departmentInfo.officeLocation) {
            res.status(403);
            throw new Error('Department profile incomplete. Please set up your profile first.');
        }
        if (complaint.department !== req.user.department) {
            res.status(403);
            throw new Error('Not authorized to update complaints outside your department');
        }
    }

    // Update status and add automatic response entry
    const oldStatus = complaint.status;
    complaint.status = status;

    // Auto-add response entry for status change
    complaint.responses.push({
        message: `Status changed from "${oldStatus}" to "${status}"`,
        updatedBy: req.user.name || 'Department',
        date: Date.now()
    });

    const updatedComplaint = await complaint.save();

    console.log(`[STATUS UPDATE] Complaint ${complaint.complaintId}: ${oldStatus} → ${status}`);
    res.status(200).json(updatedComplaint);
});

// @desc    Add a response to a complaint
// @route   POST /api/complaints/:id/responses
// @access  Private (Department / Admin)
const addComplaintResponse = asyncHandler(async (req, res) => {
    const { message, status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    if (req.user.role === 'Department') {
        if (!req.user.departmentInfo || !req.user.departmentInfo.officeLocation) {
            res.status(403);
            throw new Error('Department profile incomplete. Please set up your profile first.');
        }
        if (complaint.department !== req.user.department) {
            res.status(403);
            throw new Error('Not authorized to respond to complaints outside your department');
        }
    }

    if (!message) {
        res.status(400);
        throw new Error('Response message is required');
    }

    complaint.responses.push({
        message,
        updatedBy: req.user.name,
        date: Date.now()
    });

    if (status) {
        complaint.status = status;
    }

    const updatedComplaint = await complaint.save();
    res.status(200).json(updatedComplaint);
});

// @desc    Recalculate priorities for all active complaints (Level 3)
// @route   POST /api/complaints/recalculate-priority
// @access  Private (Department / Admin)
const recalculatePriorities = asyncHandler(async (req, res) => {
    const activeComplaints = await Complaint.find({
        status: { $nin: ['Finished'] }
    });

    if (!activeComplaints || activeComplaints.length === 0) {
        return res.status(200).json({ message: 'No active complaints to recalculate', updated: 0 });
    }

    let updatedCount = 0;
    const now = new Date();

    for (const complaint of activeComplaints) {
        try {
            const similarCount = await Complaint.countDocuments({
                department: complaint.department,
                'location.district': complaint.location?.district || 'Bengaluru Urban',
                'location.taluk': complaint.location?.taluk,
                status: { $nin: ['Finished'] },
                _id: { $ne: complaint._id }
            });

            const daysPending = Math.floor((now - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24));
            const newPriority = calculatePriority(similarCount, daysPending, complaint.category || 'General');

            if (newPriority !== complaint.priority) {
                complaint.priority = newPriority;
                await complaint.save();
                updatedCount++;
            }
        } catch (err) {
            console.error(`Failed to recalculate priority for complaint ${complaint.complaintId}:`, err.message);
        }
    }

    res.status(200).json({
        message: `Recalculated priorities for ${activeComplaints.length} complaints`,
        updated: updatedCount
    });
});

module.exports = {
    createComplaint,
    trackComplaint,
    getMyComplaints,
    getDepartmentComplaints,
    updateComplaintStatus,
    addComplaintResponse,
    recalculatePriorities
};
