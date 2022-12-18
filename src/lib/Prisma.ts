import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient({ errorFormat: "pretty" });

export default Prisma;
