import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
})
const testRedis = async () => {
    try {
        const res = await redis.ping();
        console.log('Ping result :', res)
    }
    catch (error) {
        console.log('error redis connection:', error)
    }
}
testRedis();
export default redis;   
