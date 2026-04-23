const mg=require('mongoose');
const followSchema = new mg.Schema({
    follower: {type: mg.Schema.Types.ObjectId,ref: "User"},
    following: {type: mg.Schema.Types.ObjectId,ref: "User"}
}, { timestamps: true });
followSchema.index({follower:1})
followSchema.index({following:1})
module.exports=mg.model('Follow',followSchema);
