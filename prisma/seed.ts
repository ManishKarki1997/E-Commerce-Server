import { PrismaClient } from "@prisma/client";
import { generateSlug } from "../helpers";

import users from "./seedData/users";
import categories from "./seedData/categories.json";
import products from "./seedData/products.json";
import filters from "./seedData/filters.json";
import filterOptions from "./seedData/filterOptions.json";

const prisma = new PrismaClient();

// function that returns an object for filter Options with structure acceptable to the db
// right now, the json file contains the filter options values as array of strings, because it is easier for me to write it
// but it needs to be converted properly to seed in the db, which this function does
const returnFormattedFilterOptions = (
  filterName: string,
  subCategoryName: string
) => {
  const filterOptionsForSubCategory = filterOptions.filter(
    (fo: any) =>
      fo.filterName == filterName && fo.subCategories.includes(subCategoryName)
  );

  return filterOptionsForSubCategory
    .map((fo: any) => {
      return fo.values.map((v: any) => ({
        name: v,
      }));
    })
    .flat();
};

const returnTotalProductsForACategory = (categoryName: string) => {
  if (!categoryName) return 0;
  return products.filter((p: any) => p.categoryName === categoryName).length;
};

async function main() {
  for (let category of categories) {
    const categorySlug = generateSlug(category.name);
    await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        slug: categorySlug,
        totalSubCategories: category.subCategories.length,
        totalProducts: returnTotalProductsForACategory(category.name),
        subCategories: {
          create: [
            ...category.subCategories.map((s: any) => {
              const subCategoryFilters: any = filters.filter((f: any) =>
                f.subCategories.includes(s.name)
              );

              return {
                name: s.name,
                slug: generateSlug(s.name, "", true),
                description: s.description,
                imageUrl: s.imageUrl,
                parentName: category.name,
                parentSlug: categorySlug,
                totalProducts: products.filter(
                  (p: any) => p.subCategoryName === s.name
                ).length,
                filters: {
                  create: [
                    ...subCategoryFilters.map((x: any) => ({
                      name: x.name,
                      productId: null,
                      categoryName: category.name,
                      subCategoryName: s.name,
                      filterType: "MULTIPLE_SELECT",
                      filterOptions: {
                        create: [
                          ...returnFormattedFilterOptions(x.name, s.name),
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

  for await (let product of products) {
    const categories: any = await prisma.category.findMany({});

    await prisma.product.create({
      // @ts-ignore: Unreachable code error
      data: {
        name: product.name,
        slug: generateSlug(product.name, "", true),
        shortInfo: product.description,
        description: product.description,
        categoryName: product.categoryName,
        price: product.price,
        categorySlug: categories.find(
          (c: any) => c.name === product.categoryName && !c.parentName
        )?.slug,
        subCategorySlug: categories.find(
          (c: any) =>
            c.name === product.subCategoryName &&
            c.parentName === product.categoryName
        )?.slug,
        subCategoryName: product.subCategoryName,
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
        ...(product.discount !== undefined && {
          productDiscount: {
            create: {
              couponCode: product.discount?.couponCode || undefined,
              discountedValue: product.discount?.discountedValue,
              // gives error if directly set, likely because discountedUnit is an enum
              discountedUnit:
                product.discount?.disocuntedUnit === "PERCENTAGE"
                  ? "PERCENTAGE"
                  : "CURRENCY",
              validFrom: new Date(Date.now()),
              validUntil: new Date(product.discount?.validUntil!),
            },
          },
        }),
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
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
