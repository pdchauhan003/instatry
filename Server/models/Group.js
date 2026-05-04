import mg from 'mongoose';

const groupSchema=new mg.Schema({
    name:{type:String,required:true},
    dp:{type:String,default:''},
});
groupSchema.index({name:1});

module.exports=mg.models.Gropu || mg.model('Group',groupSchema);