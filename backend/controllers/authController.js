const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, district, taluk, department, officeLocation, areaCovered, workDescription } = req.body;

    // Validate required fields including district and taluk
    if (!name || !email || !password || !district || !taluk) {
        res.status(400);
        throw new Error('Please add all required fields including district and taluk');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Set default role if not provided
    let finalRole = role || 'Citizen';
    let finalDepartment = finalRole === 'Department' ? department : null;

    if (finalRole === 'Department') {
        if (!department || !officeLocation || !areaCovered || !workDescription) {
            res.status(400);
            throw new Error('All department fields are required');
        }
    }

    // Create user with district and taluk
    const user = await User.create({
        name,
        email,
        password,
        role: finalRole,
        district,
        taluk,
        department: finalDepartment,
        departmentInfo: finalRole === 'Department' ? {
            officeLocation,
            areaCovered,
            workDescription
        } : undefined
    });

    if (user) {
        if (finalRole === 'Department') {
            res.status(201).json({
                message: 'Department registered successfully. Please login.'
            });
        } else {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                district: user.district,
                taluk: user.taluk,
                department: user.department,
                departmentInfo: user.departmentInfo,
                token: generateToken(user._id),
            });
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Return all user fields including district and taluk
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            district: user.district,
            taluk: user.taluk,
            department: user.department,
            departmentInfo: user.departmentInfo,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Setup department information
// @route   POST /api/auth/setup-department
// @access  Private (Department)
const setupDepartmentProfile = asyncHandler(async (req, res) => {
    const { officeLocation, areaCovered, workDescription, department, taluk } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role !== 'Department') {
        res.status(403);
        throw new Error('Only Department members can set up a department profile');
    }

    user.department = department || user.department;
    // Allow taluk update during setup
    user.taluk = taluk || user.taluk;
    user.departmentInfo = {
        officeLocation: officeLocation || '',
        areaCovered: areaCovered || '',
        workDescription: workDescription || ''
    };

    const updatedUser = await user.save();

    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        district: updatedUser.district,
        taluk: updatedUser.taluk,
        department: updatedUser.department,
        departmentInfo: updatedUser.departmentInfo,
        token: generateToken(updatedUser._id)
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Validate required fields
        if (req.body.name !== undefined && !req.body.name.trim()) {
            res.status(400);
            throw new Error('Name cannot be empty');
        }
        if (req.body.email !== undefined && !req.body.email.trim()) {
            res.status(400);
            throw new Error('Email cannot be empty');
        }

        // Use explicit undefined checks so empty strings can be stored intentionally
        if (req.body.name !== undefined) user.name = req.body.name.trim();
        if (req.body.email !== undefined) user.email = req.body.email.trim();
        if (req.body.district !== undefined) user.district = req.body.district;
        if (req.body.taluk !== undefined) user.taluk = req.body.taluk;

        if (user.role === 'Department') {
            if (req.body.department !== undefined) user.department = req.body.department;
            user.departmentInfo = {
                officeLocation: req.body.officeLocation !== undefined
                    ? req.body.officeLocation
                    : (user.departmentInfo?.officeLocation || ''),
                areaCovered: req.body.areaCovered !== undefined
                    ? req.body.areaCovered
                    : (user.departmentInfo?.areaCovered || ''),
                workDescription: req.body.workDescription !== undefined
                    ? req.body.workDescription
                    : (user.departmentInfo?.workDescription || ''),
            };
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                district: updatedUser.district,
                taluk: updatedUser.taluk,
                department: updatedUser.department,
                departmentInfo: updatedUser.departmentInfo,
                token: generateToken(updatedUser._id),
            },
        });
    } catch (error) {
        console.error("PROFILE UPDATE ERROR:", error);
        throw error;
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    setupDepartmentProfile,
    updateProfile
};
