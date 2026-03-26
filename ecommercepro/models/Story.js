import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    story: { type: String, required: true },
    caption: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    storyCreatedAt: { type: Date, default: '' },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
}, { timestamps: true });

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export default Story;
