require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { nextTick } from "process";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST, transformJoiErrors } from "../helpers";

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
        .send(new OK_REQUEST("Categories fetched successfully", categories));
    } catch (error) {
      console.log(error);
      next(error);
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
        .send(new OK_REQUEST("Category created successfully", category));
    } catch (error) {
      console.log(error);
      nextTick(error);
    }
  }
);

export default Router;
