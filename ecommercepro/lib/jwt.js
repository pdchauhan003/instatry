import jwt from 'jsonwebtoken';


// export function generateToken({user,sessionId}){
//     return jwt.sign({id:user._id,email:user.email,sessionId:sessionId},process.env.JWT_SECRET,{expiresIn:'1d'});
// }

export function generateToken(data){
    return jwt.sign(data,process.env.JWT_SECRET,{expiresIn:'2m'});
}

export function generateRefreshToken(data){
    return jwt.sign(data,process.env.REFRESH_SECRET,{expiresIn:'7d'})
}

export function verifyToken(token){
    return jwt.verify(token, process.env.JWT_SECRET);
}