import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    to: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ to: 1, from: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
