import mg from 'mongoose';

const memberSchema=new mg.Schema({
    groupId:{type:mg.Schema.Types.ObjectId,ref:'Group'},
    userId:{type:mg.Schema.Types.ObjectId,ref:'User'},
})
memberSchema.index({userId:1});

module.exports=mg.models.Member || mg.model('Member',memberSchema);