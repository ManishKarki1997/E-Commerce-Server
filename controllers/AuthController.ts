import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { INTERNAL_SERVER_ERROR, OK_REQUEST } from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";

const Router = express.Router();

// register user
Router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    return res
      .status(HttpStatusCode.OK)
      .send(new OK_REQUEST("Users fetched successfully", users));
  } catch (error) {
    next(error);
  }
});

export default Router;
