import express, { NextFunction, Request, Response } from "express";

import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import { setCache, getCache, removeCache, clearCache } from "../helpers/Cache";

import {
  generateSlug,
  getCategorySubCategoryNameFromSlug,
  reverseSluggify,
  transformJoiErrors,
  transformPrismaErrors,
} from "../helpers";

import prisma from "../db/prisma";
import ProductSchema from "../validators/ProductValidator";
import { auth, checkIfAdmin } from "../middlewares";

const Router = express.Router();

// fetch products
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { take = 10, skip = 0, orderBy } = (req as any).query;

    const totalProductsCount = await prisma.product.count();

    const products = await prisma.product.findMany({
      take: parseInt(take),
      skip: parseInt(skip),
      include: {
        images: true,
        pricing: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
        productDiscount: {
          where: {
            OR: [
              {
                validUntil: {
                  gt: new Date(),
                },
              },
              {
                validUntil: null,
              },
            ],
          },
        },
      },
      orderBy: {
        createdAt: orderBy || "desc",
      },
    });

    return res.status(HttpStatusCode.OK).send(
      new OK_REQUEST("Products fetched successfully", {
        products,
        totalProductsCount,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// fetch products on flash sale i.e discounted products
Router.get(
  "/flashSale",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { take = 10, skip = 0 } = (req as any).query;
      const products = await prisma.productDiscount.findMany({
        take: parseInt(take),
        skip: parseInt(skip),
        where: {
          OR: [
            {
              validUntil: {
                gt: new Date(),
              },
            },
            {
              validUntil: null,
            },
          ],
        },
        include: {
          product: {
            include: {
              images: true,
              pricing: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
              productDiscount: {
                where: {
                  OR: [
                    {
                      validUntil: {
                        gt: new Date(),
                      },
                    },
                    {
                      validUntil: null,
                    },
                  ],
                },
              },
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Flash sale products fetched successfully", {
          products,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// get products for a category/subcategory
Router.get(
  "/category",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        categorySlug,
        subCategorySlug,
        take = 10,
        skip = 0,
      } = (req as any).query;

      const totalProductsCount = await prisma.product.count();

      let subCategoryParam = {
        subCategorySlug,
      };
      if (subCategorySlug && subCategorySlug.includes("*")) {
        subCategoryParam = {
          subCategorySlug: subCategorySlug.replace("*", " & "),
        };
      }

      const products = await prisma.product.findMany({
        take: parseInt(take),
        skip: parseInt(skip),
        where: {
          categorySlug: categorySlug.includes("*")
            ? categorySlug.replace("*", " & ")
            : categorySlug,
          ...subCategoryParam,
        },
        include: {
          images: true,
          pricing: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          productDiscount: {
            where: {
              OR: [
                {
                  validUntil: {
                    gt: new Date(),
                  },
                },
                {
                  validUntil: null,
                },
              ],
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Products fetched successfully", {
          products,
          totalProductsCount,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// fetch products using different query filters
Router.get(
  "/filtered",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const productParams = {
        ...req.query,
      };

      let tempSortParams =
        (query as any).sort === undefined
          ? {}
          : JSON.parse((query as any).sort);

      let sortParams = {};

      if (Object.keys(tempSortParams).length > 0) {
        sortParams = {
          [tempSortParams.name]: tempSortParams.sortBy,
        };

        delete productParams.sort;
      }

      const priceParams =
        (query as any).price === undefined
          ? {}
          : JSON.parse((query as any).price);

      delete productParams.categoryName;
      delete productParams.subCategoryName;
      delete productParams.price;

      const prismaParams = {
        // gives typescript error, couldn't disable
        // i need case insensitivity for these product query params
        // @ts-ignore: Unreachable code error
        ...(Object.keys(productParams).length > 0 && {
          AND: [
            ...Object.keys(productParams).map((x: string) => ({
              filters: {
                some: {
                  name: {
                    equals: x,
                    mode: "insensitive",
                  },
                  value: {
                    equals: productParams[x]?.toString(),
                    mode: "insensitive",
                  },
                },
              },
            })),
          ],
        }),
      };

      const categoriesParams = {
        ...(query.categoryName !== undefined && {
          categorySlug: {
            equals: (query as any).categoryName,
          },
        }),
        ...(query.subCategoryName !== undefined && {
          subCategorySlug: {
            equals: (query as any).subCategoryName,
          },
        }),
      };

      const products = await prisma.product.findMany({
        // @ts-ignore: Unreachable code error
        where: {
          ...categoriesParams,
          ...(query.price !== undefined &&
            Object.keys(priceParams).length > 0 && {
              price: {
                gte: parseFloat(priceParams.min || 0),
                lte: parseFloat(priceParams.max || Number.POSITIVE_INFINITY),
              },
            }),

          ...(query.price && {
            pricing: {
              every: {
                AND:
                  Object.keys(priceParams).length > 0
                    ? [
                        {
                          basePrice: {
                            gte: parseInt(priceParams.min),
                          },
                        },
                        {
                          basePrice: {
                            lte: parseFloat(priceParams.max),
                          },
                        },
                      ]
                    : [],
              },
            },
          }),

          ...prismaParams,
        },
        orderBy: {
          ...sortParams,
        },
        include: {
          images: true,
          // pricing: {
          //   take: 1,
          //   orderBy: {
          //     createdAt: "desc",
          //   },
          // },
          productDiscount: {
            where: {
              OR: [
                {
                  validUntil: {
                    gt: new Date(),
                  },
                },
                {
                  validUntil: null,
                },
              ],
            },
          },
          // _count: true,
        },
      });

      const totalRows = await prisma.product.count({
        // @ts-ignore: Unreachable code error
        where: { ...prismaParams },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Products fetched successfully", {
          products,
          count: totalRows,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// fetch related products for the single product view
Router.get(
  "/relatedProducts/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      if (!slug) {
        return next(new BAD_REQUEST_ERROR("Invalid product slug."));
      }

      const product = await prisma.product.findFirst({
        where: {
          slug,
        },
      });

      if (!product) {
        return next(new BAD_REQUEST_ERROR("Product does not exist."));
      }

      const products = await prisma.product.findMany({
        include: {
          images: true,
          pricing: true,
          productDiscount: {
            where: {
              OR: [
                {
                  validUntil: {
                    gt: new Date(),
                  },
                },
                {
                  validUntil: null,
                },
              ],
            },
          },
        },
        where: {
          subCategoryName: product?.subCategoryName,
        },
        take: 4,
      });

      const relatedProducts = products.filter((p) => p.slug !== slug);

      return next(
        new OK_REQUEST("Related products fetched successfully", {
          relatedProducts,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// create a product
Router.post(
  "/",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        description,
        shortInfo,
        editorDescription,
        price,
        subCategoryName,
        categoryName,
        categorySlug,
        subCategorySlug,
        images,
        filters,
      } = req.body;

      const isValidSchema = ProductSchema.validate(req.body, {
        stripUnknown: true,
      });

      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid product data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

      const product = await prisma.product.create({
        // @ts-ignore: Unreachable code error
        data: {
          name,
          description,
          shortInfo,
          editorDescription,
          categoryName,
          subCategoryName,
          categorySlug,
          subCategorySlug,
          price: parseFloat(price),
          images: {
            create: [...images],
          },
          slug: generateSlug(name, "", true),
          category: {
            connect: {
              slug: subCategorySlug,
            },
          },
          filters: {
            create: [
              ...filters.map((f: any) => ({
                name: f.name,
                categoryName: f.categoryName,
                subCategoryName: f.subCategoryName,
                value: f.value,
                filterType: f.filterType,
                category: {
                  connect: {
                    name: f.subCategoryName,
                  },
                },
              })),
            ],
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product added successfully", {
          product,
        })
      );
    } catch (error) {
      console.log(error);
      const errors = transformPrismaErrors(error, "Product");
      next({
        ...{ error },
        payload: { errors },
        httpCode: HttpStatusCode.BAD_REQUEST,
      });
    }
  }
);

// fetch single product
Router.get(
  "/single/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const cachedBody = getCache(req.originalUrl);

      if (cachedBody) {
        return res.status(HttpStatusCode.OK).send(
          new OK_REQUEST("Product fetched successfully", {
            product: cachedBody,
          })
        );
      }

      const product = await prisma.product.findFirst({
        where: {
          slug,
        },
        include: {
          images: true,
          category: true,
          qna: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              user: true,
            },
          },
          filters: {
            include: {
              filterOptions: true,
            },
          },
          pricing: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
          productDiscount: {
            where: {
              OR: [
                {
                  validUntil: {
                    gt: new Date(),
                  },
                },
                {
                  validUntil: null,
                },
              ],
            },
          },
          _count: {
            select: {
              reviews: true,
              qna: true,
            },
          },
        },
      });

      if (!product) {
        return next(new NOT_FOUND_ERROR("Product not found"));
      }

      setCache({ key: req.originalUrl, payload: product });

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Product fetched successfully", { product }));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// quick update product
Router.put(
  "/quickEdit",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id,
        name,
        description,
        price,
        subCategoryName,
        categoryName,
        subCategorySlug,
        categorySlug,
      } = req.body;

      const isValidSchema = ProductSchema.validate(req.body, {
        stripUnknown: true,
      });

      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid product data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

      const product = await prisma.product.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          categoryName,
          subCategoryName,
          categorySlug,
          subCategorySlug,
          price,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product updated successfully", {
          product,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// update product
Router.put(
  "/",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id,
        name,
        description,
        editorDescription,
        price,
        subCategoryName,
        categoryName,
        imagesToDelete,
        images,
        slug,
        filters,
      } = req.body;

      const isValidSchema = ProductSchema.validate(req.body, {
        stripUnknown: true,
      });

      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid product data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

      if (imagesToDelete && imagesToDelete.length > 0) {
        const imagesToDeleteIds = [
          ...req.body.imagesToDelete.map((x: any) => x.productId),
        ];
        await prisma.images.deleteMany({
          where: {
            productId: {
              in: imagesToDeleteIds,
            },
          },
        });
      }

      if (
        images &&
        images.length > 0 &&
        !images.find((x: any) => x.isDefaultImage)
      ) {
        images[0].isDefaultImage = true;
      }

      await prisma.images.createMany({
        data: images.map((img: any) => ({
          imageUrl: img.imageUrl,
          productId: id,
          isDefaultImage: img.isDefaultImage || false,
        })),
      });

      const product = await prisma.product.update({
        where: {
          slug,
        },
        data: {
          name,
          description,
          editorDescription,
          categoryName,
          subCategoryName,
          // slug: generateSlug(name, "", true),
          pricing: {
            create: {
              basePrice: price,
            },
          },
          category: {
            connect: {
              name: req.body.categoryName,
            },
          },
        },
      });

      const handleUpdateFilterOption = async (filterOption: any) => {
        return prisma.filter.update({
          where: {
            id: filterOption.id,
          },
          data: {
            name: filterOption.name,
            value: filterOption.value,
            productId: id,
            categoryName: filterOption.categoryName,
            subCategoryName: filterOption.subCategoryName,
          },
        });
      };

      await Promise.all(
        filters.map(
          async (filterOption: any) =>
            await handleUpdateFilterOption(filterOption)
        )
      );

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product updated successfully", {
          product,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// search functionality
Router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      const { searchQuery } = query;
      const productParams = {
        ...req.query,
      };

      let tempSortParams =
        (query as any).sort === undefined
          ? {}
          : JSON.parse((query as any).sort);

      let sortParams = {};
      if (Object.keys(tempSortParams).length > 0) {
        sortParams = {
          [tempSortParams.name]: tempSortParams.sortBy,
        };

        delete productParams.sort;
      }

      const priceParams = (query as any).price
        ? JSON.parse((query as any).price)
        : {};

      delete productParams.categoryName;
      delete productParams.price;

      const products = await prisma.product.findMany({
        // @ts-ignore: Unreachable code error
        where: {
          AND: [
            {
              ...(query.price !== undefined &&
                Object.keys(priceParams).length > 0 && {
                  price: {
                    gte: parseFloat(priceParams.min || 0),
                    lte: parseFloat(
                      priceParams.max || Number.POSITIVE_INFINITY
                    ),
                  },
                }),
            },
            // {
            //   ...(query.price !== undefined && {
            //     pricing: {
            //       every: {
            //         AND:
            //           Object.keys(priceParams).length > 0
            //             ? [
            //                 {
            //                   basePrice: {
            //                     gte: parseFloat(priceParams.min || 0),
            //                   },
            //                 },
            //                 {
            //                   basePrice: {
            //                     lte: parseFloat(
            //                       priceParams.max || Number.POSITIVE_INFINITY
            //                     ),
            //                   },
            //                 },
            //               ]
            //             : [],
            //       },
            //     },
            //   }),
            // },
            {
              ...(query.categorySlug !== "" && {
                categorySlug: query.categorySlug as string,
              }),
            },
            {
              // @ts-ignore: Unreachable code error
              name: {
                contains: searchQuery as string,
                mode: "insensitive",
              },
            },

            {
              OR: [
                {
                  filters: {
                    some: {
                      name: {
                        equals: "Brand",
                        mode: "insensitive",
                      },
                      value: {
                        contains: searchQuery as string,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          ...sortParams,
        },
        include: {
          images: true,
          pricing: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          productDiscount: {
            where: {
              OR: [
                {
                  validUntil: {
                    gt: new Date(),
                  },
                },
                {
                  validUntil: null,
                },
              ],
            },
          },
          // _count: true,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Products fetched successfully", {
          products,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// handle product discount
Router.put(
  "/discount",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        productId,
        discountedUnit,
        discountedValue,
        discountId,
        validFrom,
        validUntil,
        expiryDate,
        removeDiscount,
      } = req.body;

      let res;

      // discountId presence means either the existing discount is being removed
      // or,a new discount is instead being created (same as updating the discount in the frontend)
      // either case, we need to remove the currently existing discount id,
      // by setting the validUntil to a date in the past
      if (discountId) {
        res = await prisma.productDiscount.update({
          where: {
            id: parseInt(discountId),
          },
          data: {
            validUntil: new Date(expiryDate),
          },
        });
      }
      clearCache();
      if (removeDiscount) {
        // just remove, nothing else to do
        return next(
          new OK_REQUEST("Product discount updated successfully", {
            productDiscount: res,
          })
        );
      }

      const productDiscount = await prisma.productDiscount.create({
        data: {
          discountedValue: parseFloat(discountedValue),
          discountedUnit,
          productId: parseInt(productId),
          validFrom: new Date(validFrom) || new Date(),
          validUntil: new Date(validUntil) || new Date("2023/12/1"),
        },
      });

      return next(
        new OK_REQUEST("Discount updated successfully", {
          productDiscount,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
