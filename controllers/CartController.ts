require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST } from "../helpers";

import { auth, checkIfAdmin } from "../middlewares";

const Router = express.Router();

// fetch cart of a user
Router.get(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = (req as any).user;
      const cart = await prisma.cartItem.findMany({
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
        new OK_REQUEST("Cart fetched successfully", {
          cart,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// add a product to the cart
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      const { product, count } = req.body;

      if (!user) {
        return next(new BAD_REQUEST_ERROR("You're not logged in."));
      }

      //   check if the item is already present in the cart
      const isAlreadyPresent = await prisma.cartItem.findFirst({
        where: {
          user: {
            email: user.email,
          },
          productId: product.id,
        },
      });

      if (isAlreadyPresent) {
        return next(
          new BAD_REQUEST_ERROR("This product is already present in your cart")
        );
      }

      const cart = await prisma.cartItem.create({
        data: {
          user: {
            connect: {
              email: user.email,
            },
          },
          count: parseInt(count),
          product: {
            connect: {
              uid: product.uid,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product successfully added to the cart", {
          cart: {
            ...cart,
            ...req.body,
          },
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
        cartItemId,
        productUid,
      }: { cartItemId: string; productUid: string } = (req as any).query;

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

      await prisma.cartItem.delete({
        where: {
          id: parseInt(cartItemId),
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Product removed successfully from the cart", {
          cartItemId,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
