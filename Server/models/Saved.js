const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

module.exports = mongoose.models.Saved || mongoose.model('Saved', savedSchema);
