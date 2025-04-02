import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, default: 'customer', trim: true },
        otp: { type: String, required: false },  // Ensure this field is included
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const CustomerModel = mongoose.model('Customer', CustomerSchema);
export { CustomerModel };