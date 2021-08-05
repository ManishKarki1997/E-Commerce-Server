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
import { transformJoiErrors, transformPrismaErrors } from "../helpers";

import prisma from "../db/prisma";

const Router = express.Router();

// create a category
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    const isSubCategory = req.body.categoryName ? true : false;
    try {
      const isValidSchema = CategorySchema.validate(req.body, {
        stripUnknown: true,
      });

      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid category data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

      const existingCategory = await prisma.category.findFirst({
        where: {
          name: req.body.name,
          parentName: isSubCategory
            ? {
                equals: req.body.categoryName,
              }
            : null,
        },
      });

      if (existingCategory) {
        next(
          new BAD_REQUEST_ERROR("Category with that name already exists", {
            errors: {
              name: "Category with that name already exists",
            },
          })
        );
        return;
      }

      const category = await prisma.category.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          imageUrl: req.body.imageUrl,
          parentName: isSubCategory ? req.body.categoryName : null,
          parent: isSubCategory
            ? {
                connect: {
                  name: req.body.categoryName,
                },
              }
            : undefined,
        },
      });

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Category created successfully", { category }));
    } catch (error) {
      const errors = transformPrismaErrors(
        error,
        isSubCategory ? "SubCategory" : "Category"
      );
      next(errors);
    }
  }
);

export default Router;
