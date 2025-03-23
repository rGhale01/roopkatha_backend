import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
    {
        serviceID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() },
        artistID: { type: mongoose.Schema.Types.ObjectId},
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true } // Duration in minutes
    },
    { timestamps: true }
);

const ServiceModel = mongoose.model("service", ServiceSchema);
export default ServiceModel;