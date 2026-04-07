import jwt from 'jsonwebtoken';

export function generateAccessToken(data){
    console.log('accesstoken data is in jwt :',data)
    return jwt.sign({userId:data.id,role:data.role,sessionId:data.sessionId},process.env.ACCESS_SECRET,{expiresIn:'2m'});
}

export function generateRefreshToken(data){
    console.log('refresh tokrn data in jwt :',data)
    return jwt.sign({userId:data.id,sessionId:data.sessionId},process.env.REFRESH_SECRET,{expiresIn:'7d'})
}

// export function verifyToken(token){
//     return jwt.verify(token, process.env.JWT_SECRET);
// }