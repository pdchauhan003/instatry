const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String, required: true },
    // views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:0}],
    createdAt: { type: Date, default: Date.now, expires: '24h' }
}, { timestamps: true });

module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);
