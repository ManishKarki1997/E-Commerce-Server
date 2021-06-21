require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";

import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { PrismaErrorCodes } from "../constants/PrismaErrorCodes";
import { UserRoles } from "../constants/UserRoles";
import prisma from "../db/prisma";
import {
  BAD_REQUEST_ERROR,
  OK_REQUEST,
  transformJoiErrors,
  transformPrismaErrors,
} from "../helpers";
import { NOT_FOUND_ERROR, UNAUTHORIZED_ERROR } from "../helpers/Error";

import { auth } from "../middlewares";
import CategorySchema from "../validators/CategoryValidator";

const Router = express.Router();

// fetch all categories
Router.get(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await prisma.category.findMany();
      return res
        .status(HttpStatusCode.OK)
        .send(
          new OK_REQUEST("Categories fetched successfully", { categories })
        );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// fetch all subcategories for a category
Router.get(
  "/subcategories/:categoryUid",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryUid } = req.params;

      const category = await prisma.category.findFirst({
        where: {
          uid: categoryUid,
        },
        include: {
          subCategories: true,
        },
      });

      if (!category) {
        next(new NOT_FOUND_ERROR("Category with that id not found"));
        return;
      }

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("SubCategories fetched successfully", {
          subCategories: category?.subCategories,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }
);

// create a category
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isValidSchema = await CategorySchema.validate(req.body, {
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
          ...req.body,
        },
      });

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Category created successfully", { category }));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// edit a category
Router.put(
  "/edit",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uid } = req.body;

      // declaration merging is not working
      const { role } = (req as any).user;

      if (role === UserRoles.USER) {
        throw new UNAUTHORIZED_ERROR("Permission Denied");
      }

      const category = await prisma.category.update({
        where: {
          uid,
        },
        data: {
          ...req.body,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Category updated successfully", {
          category,
        })
      );
    } catch (error) {
      if (error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_VIOLATION_CODE) {
        const errors = transformPrismaErrors(error, "Category");

        next({
          ...error,
          payload: { errors },
          httpCode: HttpStatusCode.BAD_REQUEST,
        });
        return;
      }

      next(error);
    }
  }
);

export default Router;
