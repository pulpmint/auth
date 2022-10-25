import { createClient } from "redis";

const Redis = createClient({
  url: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
});

export default Redis;
