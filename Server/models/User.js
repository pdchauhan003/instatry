const mongoose = require("mongoose");
const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    username:{type:String,required:true},
    email:{type:String,required:true},
    number:{type:String,required:true},
    password:{type:String,required:true},
    image:{type:String},
    otp:{type:String},
    role:{type:String,enum:['admin','user'],default:'user'},
    contacts:[{type:String}],
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    followings:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    savedposts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    sessionId:{type:String},
},{timestamps:true})
module.exports=mongoose.model('User',userSchema);
