import jwt from 'jsonwebtoken';

export function generateAccessToken(data){
    console.log('accesstoken data is in jwt :',data)
    const userId = data.id?.toString() || data.id;
    return jwt.sign({userId,role:data.role,sessionId:data.sessionId},process.env.ACCESS_SECRET,{expiresIn:'1m'});
}

export function generateRefreshToken(data){
    console.log('refresh tokrn data in jwt :',data)
    const userId = data.id?.toString() || data.id;
    return jwt.sign({userId,sessionId:data.sessionId},process.env.REFRESH_SECRET,{expiresIn:'7d'})
}
