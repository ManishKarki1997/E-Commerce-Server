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

import { auth } from "../middlewares";
import CategorySchema from "../validators/CategoryValidator";

const Router = express.Router();

// create a subcategory
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, iconName, categoryUid } = req.body;

      const { role } = (req as any).user;
      if (role === UserRoles.USER) {
        throw new UNAUTHORIZED_ERROR("Operation Not Allowed");
      }

      const subCategory = await prisma.subCategory.create({
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
        new OK_REQUEST("SubCategory created successfully", {
          subCategory,
        })
      );
    } catch (error) {
      if (error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_VIOLATION_CODE) {
        const errors = transformPrismaErrors(error, "SubCategory");
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
