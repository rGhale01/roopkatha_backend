import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
    {
        artistID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() }, 
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        profilePictureUrl: { type: String, required: false, trim: true },  // No validation
        otp: { type: String, required: false },  // Ensure this field is included
        isVerified: { type: Boolean, default: false },
        KYCVerified: { type: Boolean, default: false },
        citizenshipFilePath: { type: String, required: false },
        panFilePath: { type: String, required: false },
    },
    { timestamps: true }
);

const ArtistModel = mongoose.model('Artist', ArtistSchema);
export { ArtistModel };