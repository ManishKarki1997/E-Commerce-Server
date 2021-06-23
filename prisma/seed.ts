import categories from "./categories";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
  for (let category of categories) {
    await prisma.category.create({
      data: category
    });
  }
}

main().catch(e => {
  console.log(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});