import Prisma from "../lib/Prisma";
import Redis from "../lib/Redis";

const init = () =>
  new Promise<string>(async (resolve, reject) => {
    try {
      await Prisma.$connect();
      console.log("Connected to Prsima MongoDB Cluster");

      await Redis.connect();
      console.log("Connected to Redis Cluster");

      resolve("Connected to all the services");
    } catch (err) {
      console.log(err);
      reject("Error connecting to the services");
    }
  });

export default init;
