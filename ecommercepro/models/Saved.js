import mongoose from 'mongoose';

const savePostSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// savePostSchema.index({ post: 1 });
savePostSchema.index({ user: 1 });

const Saved = mongoose.models.Saved || mongoose.model('Saved', savePostSchema);
export default Saved;
