const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
});

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private/Admin
const getAllComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(complaints);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        res.status(200).json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user role/department
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        user.department = req.body.role === 'Department' ? (req.body.department || user.department) : null;

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUsers,
    getAllComplaints,
    deleteUser,
    updateUser,
};
