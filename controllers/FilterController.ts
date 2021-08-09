import express, { NextFunction, Request, Response } from "express";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
  UNAUTHORIZED_ERROR,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import sendEmail from "../helpers/SendMail";
import { auth } from "../middlewares";
import { CategorySchema, UserSchema } from "../validators";
import { transformJoiErrors, transformPrismaErrors } from "../helpers";

import prisma from "../db/prisma";
import { UserRoles } from "../constants/UserRoles";

const Router = express.Router();

// fetch all filters
Router.get(
  "/",
  //  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = await prisma.filter.findMany({
        where: {
          productId: null,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Filters fetched successfully", {
          filters,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
