const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastSeen: { type: Date, default: Date.now }
});
memberSchema.index({ userId: 1 });
memberSchema.index({ groupId: 1 });

const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);

module.exports = Member;
module.exports.schema = memberSchema;