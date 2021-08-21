import categories from "./seedData/categories";
import products from "./seedData/products";
import filters from "./seedData/filters";
import filterOptions from "./seedData/filterOptions";
import users from "./seedData/users";

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
        slug: generateSlug(category.name),
        totalProducts: 0,
        subCategories: {
          create: [
            ...category.subCategories.map((s: any) => {
              const subCategoryFilters = filters.filter(
                (f: any) => f.subCategoryName === s.name
              );

              return {
                name: s.name,
                slug: generateSlug(s.name, category.name),
                description: s.description,
                imageUrl: s.imageUrl,
                parentName: category.name,
                totalProducts: products.filter(
                  (p: any) => p.subCategoryName === s.name
                ).length,
                filters: {
                  create: [
                    ...subCategoryFilters.map((x: any, idx: number) => ({
                      name: x.name,
                      productId: null,
                      categoryName: category.name,
                      subCategoryName: s.name,
                      filterType: x.filterType,
                      filterOptions: {
                        create: [
                          ...filterOptions
                            .filter(
                              (o: any) =>
                                o.subCategoryName.includes(s.name) &&
                                o.filterId === idx + 1
                            )
                            .map((m: any) => ({
                              name: m.name,
                            })),
                        ],
                      },
                    })),
                  ],
                },
              };
            }),
          ],
        },
      },
    });
  }

  for (let user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        avatar: user.avatar,
        isActivated: user.isActivated,
        password: user.password,
        email: user.email,
        role: user.role,
        accountActivationToken: "",
      },
    });
  }

  for (let product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: generateSlug(product.name, product.categoryName),
        shortInfo: product.description,
        description: product.description,
        price: product.price,
        categoryName: product.categoryName,
        categorySlug: generateSlug(product.categoryName),
        subCategorySlug: generateSlug(
          product.subCategoryName,
          product.categoryName
        ),
        subCategoryName: product.subCategoryName,
        pricing: {
          create: {
            basePrice: product.price,
          },
        },
        category: {
          connect: {
            name: product.categoryName,
          },
        },
        filters: {
          create: [
            ...product.filters.map((f: any) => ({
              name: f.name,
              value: f.value,
              filterType: f.filterType,
              categoryName: product.categoryName,
              subCategoryName: product.subCategoryName,
              category: {
                connect: {
                  name: product.categoryName,
                },
              },
            })),
          ],
        },
        images: {
          create: [
            ...product.images.map((i: any) => ({
              imageUrl: i.imageUrl,
              isDefaultImage: i.isDefaultImage || false,
            })),
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
