// import Redis from 'ioredis';

// const redis=new Redis({
//     host:'127.0.0.1',
//     port:6379
// })

// export default redis;

// import Redis from "ioredis";
// let redis;
// try {
//   redis = new Redis(
//     process.env.REDIS_URL || "redis://127.0.0.1:6379"
//   );
//   redis.on("connect", () => console.log("Redis connected"));
//   redis.on("error", (err) => console.log("Redis error", err));
// } catch (err) {
//   console.log("Redis init failed", err);
// }
// export default redis;