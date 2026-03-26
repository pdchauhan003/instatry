const mg=require('mongoose')

// check req is pending or accept
const followStatusSchema = new mg.Schema({
    from: {type: mg.Schema.Types.ObjectId,ref: "User",required: true},
    to: {type: mg.Schema.Types.ObjectId, ref: "User",required: true},
    status: {type: String,enum: ["pending", "accepted"],default: "pending"}
}, { timestamps: true });
followStatusSchema.index({from:1,to:1});
module.exports=mg.model("FollowStatus", followStatusSchema)