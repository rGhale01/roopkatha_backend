import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema(
    {
        availabilityID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
        artistID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Artist' },
        serviceID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Service' },
        date: { type: Date, required: true },
        startTime: { type: String, required: true }, // e.g., "13:00"
        endTime: { type: String, required: true },   // e.g., "15:00"
        status: { type: String, required: true, enum: ['Available','Booked'], default: 'Available' }
    },
    { timestamps: true }
);

const AvailabilityModel = mongoose.model('Availability', AvailabilitySchema);
export { AvailabilityModel };