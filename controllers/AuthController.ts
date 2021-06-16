import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  OK_REQUEST,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import sendEmail from "../helpers/SendMail";
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

    const accountActivationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET_KEY || "random_jwt_2321@231**@$@#)"
    );

    await sendEmail(
      "manishkarki247@gmail.com",
      "Activate your X-Commerce Account",
      `
    <div>
    <h4>Please activate your account </h4>
    <a href="http://localhost:4000/api/users/activateAccount?token=${accountActivationToken}" target="_blank" >Click here to activate your account</a>
    
    <p>Can't click on the link?</p>
    
    <p>Manually copy the link <span>http://localhost:4000/api/users/activateAccount?token=${accountActivationToken}</span> </p>
  </div>
    `
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar,
        accountActivationToken,
      },
    });

    return res
      .status(HttpStatusCode.OK)
      .send(
        new OK_REQUEST(
          "Please check your mail and activate your account.",
          user
        )
      );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default Router;
