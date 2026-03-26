import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    message: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);
export default Participant;
