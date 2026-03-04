const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Middleware to ensure Department users have completed their profile setup
const requireDepartmentSetup = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'Department') {
        if (!req.user.departmentInfo || !req.user.departmentInfo.officeLocation) {
            res.status(403);
            throw new Error('Department profile incomplete. Please set up your profile first.');
        }
    }
    next();
});

// Optional auth: attach user if token present, but don't block if not
const optionalProtect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid, continue without user — allows anonymous
            req.user = null;
        }
    }
    next();
});

module.exports = { protect, requireDepartmentSetup, optionalProtect };
