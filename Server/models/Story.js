const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now, expires: '24h' }
}, { timestamps: true });

module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);
