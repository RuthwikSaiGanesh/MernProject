const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            enum: ['Citizen', 'Department', 'Admin'],
            default: 'Citizen',
        },
        district: {
            type: String,
            required: [true, 'Please select a district'],
        },
        taluk: {
            type: String,
            required: [true, 'Please add a taluk'],
        },
        department: {
            type: String, // e.g., Water, Electricity, Road, Sanitation
            required: function () {
                return this.role === 'Department';
            },
            enum: ['Water', 'Electricity', 'Road', 'Sanitation', null],
            default: null,
        },
        departmentInfo: {
            officeLocation: { type: String, default: '' },
            areaCovered: { type: String, default: '' },
            workDescription: { type: String, default: '' }
        }
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
