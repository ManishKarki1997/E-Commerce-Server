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

      const { product, count, totalPrice } = req.body;

      if (!user) {
        return next(new BAD_REQUEST_ERROR("You're not logged in."));
      }

      const cart = await prisma.cartItem.create({
        data: {
          user: {
            connect: {
              email: user.email,
            },
          },
          count: parseInt(count),
          totalPrice: parseFloat(totalPrice),
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

export default Router;
