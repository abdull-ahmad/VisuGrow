import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    headers: {
        type: [String],
        required: true,
    },
    fileData: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const File = mongoose.model('File', schema);