import mongoose from 'mongoose';

const BookingSchema = mongoose.Schema({
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});

const BookingModel = mongoose.model('Booking', BookingSchema, 'bookings');
export { BookingModel };