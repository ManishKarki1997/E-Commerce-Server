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

// get products for a category/subcategory
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryName,
      subCategoryName,
      take = 10,
      skip = 0,
    } = (req as any).query;

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
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default Router;
