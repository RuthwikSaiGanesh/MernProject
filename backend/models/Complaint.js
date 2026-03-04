const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema(
    {
        complaintId: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional for anonymous reporting
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        department: {
            type: String,
            required: [true, 'Please select a department'],
            enum: ['Water', 'Electricity', 'Road', 'Sanitation'],
        },
        image: {
            type: String,
            default: null, // Stores path to uploaded image
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        location: {
            lat: {
                type: Number,
                required: false, // Make optional to prevent breaking if only passing structured address, but good to have
            },
            lng: {
                type: Number,
                required: false,
            },
            address: { type: String, required: true },
            village: { type: String, required: false },
            taluk: { type: String, required: true },
            district: { type: String, required: true, default: 'Bengaluru Urban' },
            pincode: { type: String, required: true }
        },
        status: {
            type: String,
            enum: ['Reached', 'In Progress', 'Finished'],
            default: 'Reached',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Low'
        },
        category: {
            type: String,
            enum: ['General', 'Critical'],
            default: 'General'
        },
        responses: [
            {
                message: { type: String, required: true },
                updatedBy: { type: String, required: true },
                date: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Complaint', complaintSchema);
