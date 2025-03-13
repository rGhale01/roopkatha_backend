const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const AvailiabilitySchema = mongoose.Schema(

    {
        booking_id: { type: String, required: true, unique: true },
        booking_date: { type: Date, required: true },
        booking_time: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Canceled'], default: 'Pending' },
        total_price: { type: Number, required: true },
        amount_paid:{type: Number, required: false },
        amount_due:{type: Number, required: false },


    }, 
    {
        timestamps: true,
    }
);

const Availiability = mongoose.model("Availiability", ArtistSchema, 'availiabilitys');
module.exports = Availiability;