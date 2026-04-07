// import { Redis } from "@upstash/redis"; yy

// let redis;

// try {
//   redis = new Redis({
//     url: process.env.UPSTASH_REDIS_REST_URL,
//     token: process.env.UPSTASH_REDIS_REST_TOKEN,
//   });
// } catch (err) {
//   console.log("Redis disabled during build");
// }

// export default redis;




// import Redis from 'ioredis';

// const redis=new Redis({
//     host:'127.0.0.1',
//     post:6379
// })
// export default redis;




// import { createClient } from "redis";
// const redis = createClient({
//   url: process.env.REDIS_URL|| 'redis://127.0.0.1:6379',
// });
// redis.on("error", (err) => console.log("Redis Error:", err));
// await redis.connect();
// export default redis; 

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