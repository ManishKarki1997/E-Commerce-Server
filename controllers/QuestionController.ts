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

// answer a question on a product
Router.post(
  "/answer",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { qnaText, productId, questionId } = req.body;

      // ToDo add checks to see if the person answering is the creator of the product

      const answer = await prisma.qnA.create({
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
          question: {
            connect: {
              id: parseInt(questionId),
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Question answered successfully", {
          answer,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// update answer to a question on a product
Router.put(
  "/answer",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { qnaText, productId, questionId, qnaId } = req.body;

      // ToDo add checks to see if the person answering is the creator of the product

      const answer = await prisma.qnA.update({
        where: {
          id: parseInt(qnaId),
        },
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
          question: {
            connect: {
              id: parseInt(questionId),
            },
          },
        },
      });

      return res.status(HttpStatusCode.OK).send(
        new OK_REQUEST("Question answered successfully", {
          answer,
        })
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// delete question
Router.delete(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId, answerId } = (req as any).query;

      const user = (req as any).user;

      const question = await prisma.qnA.findFirst({
        where: {
          userId: user.id,
          id: parseInt(questionId),
        },
      });

      if (!question) {
        return next(new BAD_REQUEST_ERROR("Question does not exist"));
      }

      await prisma.qnA.delete({
        where: {
          id: parseInt(questionId),
        },
      });

      // answerId and questionId are stringified as req.query
      if (answerId) {
        await prisma.qnA.delete({
          where: {
            id: parseInt(answerId),
          },
        });
      }

      return res
        .status(HttpStatusCode.OK)
        .send(
          new OK_REQUEST(
            questionId ? "Answer" : "Question" + " deleted successfully"
          )
        );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
