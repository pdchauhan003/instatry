import mg from 'mongoose';

const bioSchema=new mg.Schema({
    bio:{type:String},
    user:{type:mg.Schema.Types.ObjectId,ref:'User'}
})
bioSchema.index({bio:1});
bioSchema.index({user:1});

const Bio=mg.models.Bio || mg.model('Bio',bioSchema)

export default Bio