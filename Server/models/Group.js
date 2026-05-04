const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dp: { type: String, default: '' },
});
groupSchema.index({ name: 1 });

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);

module.exports = Group;
module.exports.schema = groupSchema;