require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST, transformJoiErrors } from "../helpers";
import { UNAUTHORIZED_ERROR } from "../helpers/Error";

import { auth, checkIfAdmin } from "../middlewares";
import ReviewSchema from "../validators/ReviewValidator";

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
        orderBy: {
          createdAt: "desc",
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

      const isValidSchema = ReviewSchema.validate(req.body, {
        stripUnknown: true,
      });
      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid Review Data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

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

// update product review
Router.put(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { productId, reviewId, comment, rating } = req.body;

      const isValidSchema = ReviewSchema.validate(req.body, {
        stripUnknown: true,
      });
      if (isValidSchema.error) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid Review Data",
            transformJoiErrors(isValidSchema.error)
          )
        );
      }

      const userHasPreviouslyReviewed = await prisma.review.findFirst({
        where: {
          productId: parseInt(productId),
          userId: user.id,
        },
      });

      if (!userHasPreviouslyReviewed) {
        return next(
          new BAD_REQUEST_ERROR("You haven't reviewed this product yet")
        );
      }

      const review = await prisma.review.update({
        where: {
          id: parseInt(reviewId),
        },
        data: {
          comment,
          rating: parseInt(rating),
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Review updated successfully", {
          review,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// delete product review
Router.delete(
  "/:reviewId",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { reviewId } = (req as any).params;

      const review = await prisma.review.findFirst({
        where: {
          id: parseInt(reviewId),
        },
      });

      // the user who requested to delete the review is not the author of
      // the review
      if (review?.userId !== user.id) {
        return next(
          new UNAUTHORIZED_ERROR(
            "You are not authorized to perform this action"
          )
        );
      }

      await prisma.review.delete({
        where: {
          id: parseInt(reviewId),
        },
      });

      return next(new OK_REQUEST("Review deleted successfully"));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
