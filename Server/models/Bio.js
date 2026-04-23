const mongoose = require('mongoose');

const bioSchema = new mongoose.Schema({
    bio: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

bioSchema.index({ bio: 1 });
bioSchema.index({ user: 1 });

module.exports = mongoose.models.Bio || mongoose.model('Bio', bioSchema);
