require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import prisma from "../db/prisma";
import {
  BAD_REQUEST_ERROR,
  generateSlug,
  OK_REQUEST,
  transformJoiErrors,
  transformPrismaErrors,
} from "../helpers";
import { auth, checkIfAdmin } from "../middlewares";
import ProductSchema from "../validators/ProductValidator";

const Router = express.Router();

// fetch all products
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take }: { skip: string; take: string } = req.query as any;

    const products = await prisma.product.findMany({
      take: parseInt(take) || 10,
      skip: parseInt(skip) || 0,
      include: {
        images: true,
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
});

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
        editorDescription,
        price,
        subCategoryName,
        categoryName,
        images,
      } = req.body;

      const isValidSchema = await ProductSchema.validate(req.body, {
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
          editorDescription,
          subCategoryName,
          categoryName,
          price,
          images: {
            create: [...images],
          },
          slug: generateSlug(name),
          category: {
            connect: {
              name: req.body.categoryName,
            },
          },
          subCategory: subCategoryName
            ? {
                connect: {
                  name: subCategoryName,
                },
              }
            : undefined,
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
