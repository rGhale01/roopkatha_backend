import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, default: 'artist', enum: ['artist', 'admin'] },

        gender: { type: String, },
        specialization: { type: String, required: true, trim: true },
    },
    {
        timestamps: true
    }
);

const ArtistModel = mongoose.model('Artist', ArtistSchema);
export { ArtistModel };
