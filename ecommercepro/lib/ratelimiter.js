import redis from "@/services/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "60 s"),
  analytics: true,
});