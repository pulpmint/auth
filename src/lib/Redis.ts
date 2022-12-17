import { createClient } from "redis";

const Redis = createClient({ url: process.env.REDIS_HOST });

export default Redis;
