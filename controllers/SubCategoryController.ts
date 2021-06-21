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
import { UNAUTHORIZED_ERROR } from "../helpers/Error";

import { auth, checkIfAdmin } from "../middlewares";
import CategorySchema from "../validators/CategoryValidator";

const Router = express.Router();

// create a subcategory
Router.post(
  "/",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, iconName, categoryName } = req.body;

      const subCategory = await prisma.subCategory.create({
        data: {
          name,
          description,
          iconName,
          category: {
            connect: {
              name: categoryName,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("SubCategory created successfully", {
          subCategory,
        })
      );
    } catch (error) {
      const errors = transformPrismaErrors(error, "Sub category");
      next({
        ...error,
        payload: { errors },
        httpCode: HttpStatusCode.BAD_REQUEST,
      });
    }
  }
);

// update sub category
Router.put(
  "/",
  auth,
  checkIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, iconName, categoryUid, uid } = req.body;

      const updatedSubCategory = await prisma.subCategory.update({
        where: {
          uid,
        },
        data: {
          name,
          description,
          iconName,
          category: {
            connect: {
              uid: categoryUid,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("SubCategory updated successfully", {
          subCategory: updatedSubCategory,
        })
      );
    } catch (error) {
      const errors = transformPrismaErrors(error, "SubCategory");
      next({
        ...error,
        payload: { errors },
        httpCode: HttpStatusCode.BAD_REQUEST,
      });
    }
  }
);

export default Router;
