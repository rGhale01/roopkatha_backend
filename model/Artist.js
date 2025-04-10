import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
    {
        artistID: { type: mongoose.Schema.Types.ObjectId, unique: true, default: () => new mongoose.Types.ObjectId() }, 
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        profilePictureUrl: { type: String, required: false, trim: true },
        otp: { type: String, required: false },
        isVerified: { type: Boolean, default: false },
        KYCVerified: { type: Boolean, default: false },
        citizenshipFilePath: { type: String, required: false },
        panFilePath: { type: String, required: false },
        phoneNo: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
        },
        DOB: {
            type: Date,
            required: [true, 'Date of Birth is required'],
            validate: {
                validator: function (value) {
                    return value < new Date(); // Ensure DOB is not in the future
                },
                message: 'Date of Birth cannot be in the future',
            },
        },
        gender: {
            type: String,
            required: [true, 'Gender is required'],
            enum: ['Male', 'Female'],
        }, // Gender field with enum validation
    },
    { timestamps: true }
);


const ArtistModel = mongoose.model('Artist', ArtistSchema);
export { ArtistModel };