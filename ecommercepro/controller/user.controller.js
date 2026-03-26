import { connectDB } from "@/services/mongodb";
import User from "@/models/User";
import redis from "@/services/redis";
import Bio from "@/models/Bio";
import Message from "@/models/Message";
import mongoose from 'mongoose'


export const getAllUserData = async (userId) => {
    await connectDB();
    return User.find({ _id: userId });
};

export const individualUserData = async (userId) => {
    await connectDB();
    
    const cacheKey = `user:${userId}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
        console.log("Serving user data from cache:", cacheKey);
        return JSON.parse(cachedData);
    }

    const user = await User.findById(userId).lean();
    if (user) {
        await redis.setex(cacheKey, 3600, JSON.stringify(user)); // Cache for 1 hour
    }
    return user;
};

export const getUserNameUsingId = async (userId) => {
    await connectDB();
    
    const cacheKey = `user:${userId}:minimal`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
        return JSON.parse(cachedData).username;
    }

    const user = await User.findById(userId).select('username image').lean();
    if (user) {
        await redis.setex(cacheKey, 3600, JSON.stringify(user));
    }
    return user?.username || '';
};

export const getUserImageAndUsername = async (userId) => {
    await connectDB();
    
    const cacheKey = `user:${userId}:minimal`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
        console.log("Serving minimal user data from cache:", cacheKey);
        return JSON.parse(cachedData);
    }

    const user = await User.findById(userId).select('username image').lean();
    if (user) {
        await redis.setex(cacheKey, 3600, JSON.stringify(user));
    }
    return user;
};

export const clearUserCache = async (userId) => {
    await redis.del(`user:${userId}`);
    await redis.del(`user:${userId}:minimal`);
    console.log(`Cleared cache for user: ${userId}`);
};


export const getUserBio=async(userId)=>{
    await connectDB();
    const name=await User.findOne({_id:userId}).select('name');
    const bio=await Bio.findOne({user:userId}).select('bio')
    const userNameAndImage=await getUserImageAndUsername(userId);
    console.log('username and image data is :',userNameAndImage)
    const udata={userNameAndImage,bio,name}
    return udata
}

export const getUserBioOnly=async(userId)=>{
    await connectDB();
    const bio=await Bio.findOne({user:userId}).select('bio')
    return bio?.bio
}

export const updateUserField=async(userId,field,value)=>{
    connectDB();
    const updatedData=await User.findByIdAndUpdate(userId,{$set:{[field]:value}},{new:true,upsert:true})
    return updatedData
}

export const updateBio=async(userId,value)=>{
    connectDB();
    const updatedBio=await Bio.updateOne({user:userId},{$set:{bio:value}},{new:true,upsert:true});
    return updateBio
}

export const getMessageUserData=async(Id)=>{
    await connectDB();

    const myId = new mongoose.Types.ObjectId(Id)
    const users=await Message.aggregate([
        {
            $match:{
                $or:[
                    {from:myId},
                    {to:myId}
                ]
            }
        },
        {
            $project:{
                otherUser:{
                    $cond:{
                        if:{$eq:['$from',myId]},
                        then:'$to',
                        else:'$from'
                    }
                }
            }
        },
        {
            $group:{
                _id:'$otherUser'
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'_id',
                foreignField:'_id',
                as:'user'
            }
        },
        {
            $unwind:'$user'
        },
        {
            $project:{
                _id:'$user._id',
                username:'$user.username',
                image:'$user.image'
            }
        }

    ]);
    console.log('function message data',users)
    return users;
};