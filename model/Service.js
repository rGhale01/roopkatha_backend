const mongoose = require('mongoose');

const ServiceSchema = mongoose.Schema(

    {
    service_id: { type: String, required: true, unique: true },
    service_name: { type: String, required: true },
    service_description: { type: String },
    duration:{type: Number, required: true},
    image: {type: String, required: true},
    }, 
    {
        timestamps: true,
    }
);

const Service = mongoose.model("Service", ServiceSchema, 'services');
module.exports = Service;