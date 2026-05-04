import mongoose from 'mongoose';
import UserData from "../../Server/models/User";
import PostData from "../../Server/models/Post";
import StoryData from "../../Server/models/Story";
import FollowData from "../../Server/models/Follow";
import MessageData from "../../Server/models/Message";
import FollowStatusData from "../../Server/models/FollowStatus";
import SavedData from "../../Server/models/Saved";
import CommentData from "../../Server/models/Comment";
import ParticipantData from "../../Server/models/Participant";
import PendingUserData from "../../Server/models/PendingUser";
import PaymentData from "../../Server/models/Payment";
import TermsData from "../../Server/models/Terms";
import BioData from "../../Server/models/Bio";
import LikesData from "../../Server/models/likes";
import GroupData from "../../Server/models/Group";
import MemberData from "../../Server/models/Members";

// Helper to get schema from exported model/schema object
const getSchema = (data) => data.schema || data;

export const User = mongoose.models.User || mongoose.model('User', getSchema(UserData));
export const Post = mongoose.models.Post || mongoose.model('Post', getSchema(PostData));
export const Story = mongoose.models.Story || mongoose.model('Story', getSchema(StoryData));
export const Follow = mongoose.models.Follow || mongoose.model('Follow', getSchema(FollowData));
export const Message = mongoose.models.Message || mongoose.model('Message', getSchema(MessageData));
export const FollowStatus = mongoose.models.FollowStatus || mongoose.model('FollowStatus', getSchema(FollowStatusData));
export const Saved = mongoose.models.Saved || mongoose.model('Saved', getSchema(SavedData));
export const Comment = mongoose.models.Comment || mongoose.model('Comment', getSchema(CommentData));
export const Participant = mongoose.models.Participant || mongoose.model('Participant', getSchema(ParticipantData));
export const PendingUser = mongoose.models.PendingUser || mongoose.model('PendingUser', getSchema(PendingUserData));
export const Payment = mongoose.models.Payment || mongoose.model('Payment', getSchema(PaymentData));
export const Terms = mongoose.models.Terms || mongoose.model('Terms', getSchema(TermsData));
export const Bio = mongoose.models.Bio || mongoose.model('Bio', getSchema(BioData));
export const Likes = mongoose.models.Likes || mongoose.model('Likes', getSchema(LikesData));
export const Group = mongoose.models.Group || mongoose.model('Group', getSchema(GroupData));
export const Member = mongoose.models.Member || mongoose.model('Member', getSchema(MemberData));

