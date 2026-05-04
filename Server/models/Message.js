const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for group messages
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Added for group messages
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ to: 1, from: 1 });
messageSchema.index({ groupId: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
module.exports.schema = messageSchema;
