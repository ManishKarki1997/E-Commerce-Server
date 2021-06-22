require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import prisma from "../db/prisma";
import {
  BAD_REQUEST_ERROR,
  generateSlug,
  OK_REQUEST,
  transformJoiErrors,
} from "../helpers";
import { auth, checkIfAdmin } from "../middlewares";
import ProductSchema from "../validators/ProductValidator";

const Router = express.Router();

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
      next(error);
    }
  }
);

export default Router;
