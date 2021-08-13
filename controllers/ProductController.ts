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

export default Router;
