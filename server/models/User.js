const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: [String],
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    // Added for collaboration contact
    linkedIn: { type: String, default: "" },
    githubProfile: { type: String, default: "" },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);