import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    post: { type: String, required: true },
    caption: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
