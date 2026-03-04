const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all departments, sorted by proximity to user's district+taluk
// @route   GET /api/departments
// @access  Private (Citizen)
const getDepartments = asyncHandler(async (req, res) => {
    const userDistrict = req.user.district || '';
    const userTaluk = req.user.taluk || '';

    // Fetch ALL departments with completed profiles
    const allDepartments = await User.find({
        role: 'Department',
        'departmentInfo.officeLocation': { $exists: true, $ne: '' }
    }).select('-password').lean();

    if (!allDepartments || !Array.isArray(allDepartments)) {
        return res.status(200).json([]);
    }

    // Sort by proximity: same district+taluk first, then same district, then others
    // Add a 'proximity' field for frontend grouping
    const sorted = allDepartments.map(dept => {
        let proximity = 'other';
        if (dept.district === userDistrict && dept.taluk === userTaluk) {
            proximity = 'local'; // Same district AND taluk
        } else if (dept.district === userDistrict) {
            proximity = 'district'; // Same district only
        }
        return { ...dept, proximity };
    });

    // Sort: local first, then district, then other
    const proximityOrder = { 'local': 0, 'district': 1, 'other': 2 };
    sorted.sort((a, b) => (proximityOrder[a.proximity] || 2) - (proximityOrder[b.proximity] || 2));

    res.status(200).json(sorted);
});

module.exports = { getDepartments };
