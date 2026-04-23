import { connectDB } from "@/services/mongodb";
import { User, Bio, Message } from "@/lib/database";
import redis from "@/services/redis";
import mongoose from 'mongoose'


export const getAllUserData = async (userId) => {
    try {
        await connectDB();
        return User.find({ _id: userId });
    } catch (error) {
        console.error("Error in getAllUserData controller:", error);
        throw error;
    }
};

export const individualUserData = async (userId) => {
    try {
        await connectDB();
        const user = await User.findById(userId).select('-password').lean();
        return user;
    } catch (error) {
        console.error("Error in individualUserData controller:", error);
        throw error;
    }
};

export const getUserNameUsingId = async (userId) => {
    try {
        await connectDB();
        const user = await User.findById(userId).select('username image').lean();
        return user?.username || '';
    } catch (error) {
        console.error("Error in getUserNameUsingId controller:", error);
        throw error;
    }
};

export const getUserImageAndUsername = async (userId) => {
    try {
        await connectDB();
        const cacheKey = `user:${userId}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            try {
                console.log("Serving from cache:", cacheKey);
                return JSON.parse(cachedData);
            } catch (err) {
                console.log("Bad cache data, deleting...");
                await redis.del(cacheKey);
            }
        }
        const user = await User.findById(userId).select("username image").lean();
        if (user) {
            await redis.set(cacheKey, JSON.stringify(user), { EX: 3600, });
        }
        return user;
    } catch (error) {
        console.error("Error in getUserImageAndUsername controller:", error);
        throw error;
    }
};

export const getUserBio = async (userId) => {
    try {
        await connectDB();
        const [user, bio] = await Promise.all([
            User.findById(userId).select('name username image').lean(),
            Bio.findOne({ user: userId }).select('bio').lean()
        ]);

        return {
            userNameAndImage: { username: user?.username, image: user?.image },
            bio,
            name: { name: user?.name }
        };
    } catch (error) {
        console.error("Error in getUserBio controller:", error);
        throw error;
    }
};

export const getUserBioOnly = async (userId) => {
    try {
        await connectDB();
        const bio = await Bio.findOne({ user: userId }).select('bio')
        return bio?.bio
    } catch (error) {
        console.error("Error in getUserBioOnly controller:", error);
        throw error;
    }
}

export const updateUserField = async (userId, field, value) => {
    try {
        await connectDB();

        const updatedData = await User.findByIdAndUpdate(userId, { $set: { [field]: value } }, { new: true, upsert: true })
        if (updatedData) {
            await redis.set(`user:${userId}:minimal`, JSON.stringify({ username: updatedData.username, image: updatedData.image }))
        }
        return updatedData
    } catch (error) {
        console.error("Error in updateUserField controller:", error);
        throw error;
    }
}

export const updateBio = async (userId, value) => {
    try {
        await connectDB();
        const updatedBio = await Bio.updateOne({ user: userId }, { $set: { bio: value } }, { new: true, upsert: true });
        return updatedBio
    } catch (error) {
        console.error("Error in updateBio controller:", error);
        throw error;
    }
}

export const getMessageUserData = async (Id) => {
    try {
        await connectDB();

        const myId = new mongoose.Types.ObjectId(Id)
        const users = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from: myId },
                        { to: myId }
                    ]
                }
            },
            {
                $project: {
                    otherUser: {
                        $cond: {
                            if: { $eq: ['$from', myId] },
                            then: '$to',
                            else: '$from'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$otherUser'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: '$user._id',
                    username: '$user.username',
                    image: '$user.image'
                }
            }

        ]);
        console.log('function message data', users)
        return users;
    } catch (error) {
        console.error("Error in getMessageUserData controller:", error);
        throw error;
    }
};
