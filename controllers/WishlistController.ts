require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST } from "../helpers";

import { auth, checkIfAdmin } from "../middlewares";

const Router = express.Router();

// fetch wishlist items of a user
Router.get(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = (req as any).user;
      const wishlist = await prisma.wishlist.findMany({
        where: {
          user: {
            email,
          },
        },
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Wishlist items fetched successfully", {
          wishlist,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// add a product to the wishhlist
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      const { product } = req.body;

      if (!user) {
        return next(new BAD_REQUEST_ERROR("You're not logged in."));
      }

      //   check if the item is already present in the wishlist
      const isAlreadyPresent = await prisma.wishlist.findFirst({
        where: {
          user: {
            email: user.email,
          },
          productId: product.id,
        },
      });

      if (isAlreadyPresent) {
        return next(
          new BAD_REQUEST_ERROR(
            "This product is already present in your wishlist"
          )
        );
      }

      const wishlist = await prisma.wishlist.create({
        data: {
          user: {
            connect: {
              email: user.email,
            },
          },
          product: {
            connect: {
              uid: product.uid,
            },
          },
        },
      });

      await prisma.product.update({
        where: {
          uid: product.uid,
        },
        data: {
          totalPeopleInterested: {
            increment: 1,
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product successfully added to the wishlist", {
          wishlist,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// remove product from user's cart
Router.delete(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        wishlistId,
        productUid,
      }: { wishlistId: string; productUid: string } = (req as any).query;

      await prisma.product.update({
        where: {
          uid: productUid,
        },
        data: {
          totalPeopleInterested: {
            decrement: 1,
          },
        },
      });

      await prisma.wishlist.delete({
        where: {
          id: parseInt(wishlistId),
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product removed successfully from the wishlist", {
          wishlistId,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
