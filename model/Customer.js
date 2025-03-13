import mongoose from 'mongoose';

const CustomerSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    image: { type: String }
}, {
    timestamps: true
});

const CustomerModel = mongoose.model('Customer', CustomerSchema);
export { CustomerModel };