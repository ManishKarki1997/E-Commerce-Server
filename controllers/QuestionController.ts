require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

import prisma from "../db/prisma";
import { BAD_REQUEST_ERROR, OK_REQUEST } from "../helpers";

import { auth, checkIfAdmin } from "../middlewares";

const Router = express.Router();

// ask a question on a product
Router.post(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { qnaText, productId } = req.body;

      const question = await prisma.qnA.create({
        data: {
          qnaText,
          user: {
            connect: {
              email: user.email,
            },
          },
          product: {
            connect: {
              id: productId,
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Question posted successfully", {
          question,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
