import categories from "./seedData/categories";

import { PrismaClient, UserRole } from "@prisma/client";
import { generateSlug } from "../helpers";

const prisma = new PrismaClient();

async function main() {
  for (let category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        totalSubCategories: category.subCategories.length,
        totalProducts: 0,
        subCategories: {
          create: [
            ...category.subCategories.map((s: any) => {
              return {
                name: s.name,
                description: s.description,
                imageUrl: s.imageUrl,
                parentName: category.name,
                totalProducts: 0,
              };
            }),
          ],
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
