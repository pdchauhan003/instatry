const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true });

module.exports = mongoose.models.Saved || mongoose.model('Saved', savedSchema);
