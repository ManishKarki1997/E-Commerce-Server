import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  OK_REQUEST,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
const prisma = new PrismaClient();

const Router = express.Router();

// register user
Router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, avatar, password } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new BAD_REQUEST_ERROR("User with that email already exists");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar,
      },
    });
    return res
      .status(HttpStatusCode.OK)
      .send(new OK_REQUEST("User created successfully", user));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default Router;
