import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  errorFormat: "pretty",
});

export default prisma;
