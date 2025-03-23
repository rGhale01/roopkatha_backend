// This file contains the schema for the Booking collection in the database
// The Booking collection will store the details of all the bookings made by customers for services provided by artists
// The Booking collection will have the following fields:
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
    {
        bookingID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
        customerID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer' },
        availabilityID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Availability' },
        serviceID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Service' },
        price: { type: Number, required: true }, // This will be set based on the serviceID during booking creation
        paymentStatus: { type: String, required: true, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
        bookingStatus: { type: String, required: true, enum: ['Pending', 'Booked', 'Completed', 'Cancelled'], default: 'Pending' },
        paymentMethod: { type: String, required: true, enum: ["Khalti"] },
        bookingDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const BookingModel = mongoose.model('Booking', BookingSchema);

export default BookingModel;