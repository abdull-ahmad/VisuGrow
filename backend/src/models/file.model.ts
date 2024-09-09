import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    fileUri: {
        type: [String],
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const File = mongoose.model('File', schema);