import express, { NextFunction, Request, Response } from "express";
import cookie from "cookie";
const jwt = require("jsonwebtoken");
import bcrypt from "bcryptjs";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import sendEmail from "../helpers/SendMail";
import { auth } from "../middlewares";
import { CategorySchema, UserSchema } from "../validators";
import {
  generateSlug,
  transformJoiErrors,
  transformPrismaErrors,
} from "../helpers";

import prisma from "../db/prisma";
import ProductSchema from "../validators/ProductValidator";

const Router = express.Router();

// get products for a category/subcategory
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryName,
      subCategoryName,
      take = 10,
      skip = 0,
    } = (req as any).query;

    const totalProductsCount = await prisma.product.count();

    const products = await prisma.product.findMany({
      take: parseInt(take),
      skip: parseInt(skip),
      where: {
        categoryName,
        subCategoryName,
      },
      include: {
        images: true,
        pricing: true,
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

// create a product
Router.post(
  "/",
  // auth,
  // checkIfAdmin,
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
        data: {
          name,
          description,
          shortInfo,
          editorDescription,
          categoryName,
          subCategoryName,
          price: parseFloat(price),
          images: {
            create: [...images],
          },
          slug: generateSlug(name, categoryName),
          category: {
            connect: {
              name: req.body.categoryName,
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
          pricing: {
            create: {
              basePrice: parseFloat(price),
            },
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
        ...error,
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
      const product = await prisma.product.findFirst({
        where: {
          slug,
        },
        include: {
          images: true,
          category: true,
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
          reviews: {
            orderBy: {
              createdAt: "desc",
            },
            include: { user: true },
          },
          qna: true,
        },
      });

      if (!product) {
        return next(new NOT_FOUND_ERROR("Product not found"));
      }

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Product fetched successfully", { product }));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// update product
Router.put(
  "/",
  // auth,
  // checkIfAdmin,
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

      if (imagesToDelete.length > 0) {
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

      if (images.length > 0 && !images.find((x: any) => x.isDefaultImage)) {
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
          subCategoryName,
          categoryName,
          slug: generateSlug(name, categoryName),
          price: parseFloat(price),
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

export default Router;
