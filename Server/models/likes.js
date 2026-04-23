const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    likes: { type: Number, default: 0 },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
});

likeSchema.index({ likes: 1 });

module.exports = mongoose.models.Likes || mongoose.model('Likes', likeSchema);
