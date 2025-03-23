import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
    {
        reviewID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
        customerID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer' },
        artistID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Artist' },
        serviceID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Service' },
        review: { type: String, required: true, trim: true }, // Detailed review text
    },
    { timestamps: true }
);

const ReviewModel = mongoose.model('Review', ReviewSchema);
export { ReviewModel };