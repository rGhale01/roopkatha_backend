import mongoose from 'mongoose';

const ArtistSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'artist' },
    image: { type: String },
    service: { type: String, required: true },
    
}, {
    timestamps: true
});

const ArtistModel = mongoose.model('Artist', ArtistSchema);
export { ArtistModel };