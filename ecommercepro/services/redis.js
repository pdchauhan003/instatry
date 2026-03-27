import { Redis } from "@upstash/redis"; 

let redis;

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (err) {
  console.log("Redis disabled during build");
}

export default redis;