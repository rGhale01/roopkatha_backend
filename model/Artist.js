import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
    {
        artistID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() }, 
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, default: 'artist' },
        specialization: { type: String, required: true, trim: true },
        profilePictureUrl: { type: String, required: false, trim: true },  // No validation
    },
    { timestamps: true }
);

const ArtistModel = mongoose.model('Artist', ArtistSchema);
export { ArtistModel };