require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST } from "../helpers";

import { auth, checkIfAdmin } from "../middlewares";

const Router = express.Router();

// fetch reviews for a product
Router.get(
  "/:productId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { take = 10, skip = 0 } = (req as any).query;

      const reviews = await prisma.review.findMany({
        take: parseInt(take),
        skip: parseInt(skip),
        where: {
          productId: parseInt(productId),
        },
        include: {
          user: true,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Reviews fetched successfully", {
          reviews,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// post a review for a product
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // todo: create a middleware to check if the user has bought the product
      const user = (req as any).user;
      const { comment, rating, productId } = req.body;

      const review = await prisma.review.create({
        data: {
          comment,
          rating: parseInt(rating),
          product: {
            connect: {
              id: productId,
            },
          },
          user: {
            connect: {
              email: user.email,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Review posted successfully", {
          review,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
