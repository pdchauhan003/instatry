import mg from 'mongoose';

const likeSchema=new mg.Schema({
    likes:{type:Number,default:0},
    post:{type:mg.Schema.Types.ObjectId,ref:'Post'},
})
likeSchema.index({likes:1})

const Likes= mg.models.Likes || mg.model('Likes',likeSchema);

export default Likes;
