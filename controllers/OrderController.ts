require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST } from "../helpers";

import { auth, checkIfAdmin } from "../middlewares";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});

const currency = "usd";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const Router = express.Router();

// generate session for checkout of product(s)
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { products } = req.body;

      const mappedProducts = products.map((item: any) => {
        return {
          name: item.product.name,
          description: item.product.name,
          images: [item.product.images[0]?.imageUrl],
          amount: item.count * parseInt(item.product.price) * 100,
          currency,
          quantity: item.count,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: mappedProducts,
        mode: "payment",
        success_url: `${frontendUrl}/purchaseSuccess`,
        cancel_url: `${frontendUrl}/purchaseError`,
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Order confirmed. Product(s) will be delivered soon.", {
          session,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// confirm order & payment of product(s)
Router.post(
  "/confirmPayment",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { products, paymentIntentId } = req.body;

      const user = (req as any).user;

      if (!user) {
        return next(new BAD_REQUEST_ERROR("You are not logged in"));
      }

      if (!paymentIntentId) {
        return next(new BAD_REQUEST_ERROR("Invalid Payment"));
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (
        !paymentIntent ||
        paymentIntent.status === undefined ||
        paymentIntent.status !== "succeeded"
      ) {
        return next(
          new BAD_REQUEST_ERROR(
            "Invalid Payment Info. Please do not repeat this behavior again"
          )
        );
      }

      const existingPaymentIntent = await prisma.order.findFirst({
        where: {
          paymentIntentId,
        },
      });

      if (existingPaymentIntent) {
        return next(
          new BAD_REQUEST_ERROR(
            "Your payment has already been processed and saved."
          )
        );
      }

      const payload = products.map((item: any) => ({
        userId: user.id,
        productId: parseInt(item.product.id),
        quantity: item.count,
        perItemPrice: parseFloat(item.product.price),
        paymentIntentId,
        totalPrice: parseInt(item.count) * parseFloat(item.product.price),
      }));

      const orders = await prisma.order.createMany({
        data: payload,
      });

      //   clear user's current cart now that the payments has been done
      await prisma.cartItem.deleteMany({
        where: {
          userId: (req as any).user.id,
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST(
          "Payment successful. Products will be delivered to you as soon as possible",
          {
            orders,
          }
        )
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// get users purchase history products
Router.get(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      const history = await prisma.order.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: {
            select: {
              id: true,
              uid: true,
              images: true,
              name: true,
              slug: true,
              category: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Payment history fetched successfully", {
          history,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
