import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const CustomerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
        },
        role: {
            type: String,
            default: 'customer',
        
        },
        otp: {
            type: String,
        }, // OTP for verification
        isVerified: {
            type: Boolean,
            default: false,
        }, // Verification status
        phoneNo: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
        },
        DOB: {
            type: Date,
            required: [true, 'Date of Birth is required'],
            validate: {
                validator: function (value) {
                    return value < new Date(); // Ensure DOB is not in the future
                },
                message: 'Date of Birth cannot be in the future',
            },
        },
        gender: {
            type: String,
            required: [true, 'Gender is required'],
            enum: ['Male', 'Female'],
        }, // Gender field with enum validation
        profilePictureUrl: { type: String, required: false, trim: true },

    },
    { timestamps: true }
);



const CustomerModel = mongoose.model('Customer', CustomerSchema);
export { CustomerModel };