import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cookie from "cookie";
const jwt = require("jsonwebtoken");
import bcrypt from "bcryptjs";
import {
  BAD_REQUEST_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  OK_REQUEST,
} from "../helpers/Error";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import sendEmail from "../helpers/SendMail";
import { auth } from "../middlewares";
import { UserSchema } from "../validators";
import { transformJoiErrors } from "../helpers";

const prisma = new PrismaClient();

const Router = express.Router();

const cookieAgeInDays = 2;
const confirmAccountExpiryInHours = 24;

// register user
Router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, avatar, password } = req.body;
  try {
    const isValidSchema = UserSchema.validate(req.body, {
      stripUnknown: true,
    });
    if (isValidSchema.error) {
      return next(
        new BAD_REQUEST_ERROR(
          "Invalid Data",
          transformJoiErrors(isValidSchema.error)
        )
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      next(
        new BAD_REQUEST_ERROR("User with that email already exists", {
          errors: {
            email: "User with that email already exists",
          },
        })
      );
      return
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const accountActivationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET_KEY || "random_jwt_2321@231**@$@#)"
    );

    const activationExpiryDate = new Date();
    activationExpiryDate.setHours(
      activationExpiryDate.getHours() + confirmAccountExpiryInHours
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
        activationExpiryDate,
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

// activate account
Router.get(
  "/activateAccount",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      interface Token {
        token?: string;
      }
      const { token }: Token = req.query;

      const { email } = jwt.decode(token!, process.env.JWT_SECRET_KEY);

      if (!email) {
        next(new BAD_REQUEST_ERROR("Invalid Token"));
        return
      }

      const user = await prisma.user.findFirst({ where: { email } });

      if (!user) {
        next(new BAD_REQUEST_ERROR("User does not exist"));
        return
      }

      if (user?.activationExpiryDate! < new Date()) {
        next(
          new BAD_REQUEST_ERROR(
            "Activation token has expired. Please try and login to resend the token again."
          )
        );
        return
      }

      const activatedUser = await prisma.user.update({
        where: {
          email,
        },
        data: {
          ...user,
          isActivated: true,
          accountActivationToken: "",
          activationExpiryDate: new Date(),
        },
      });

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Account activated successfully.", activatedUser));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// login
Router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!existingUser) {
        next(new NOT_FOUND_ERROR("User with that email not found"));
        return
      }

      const isPasswordValid = bcrypt.compareSync(
        password,
        existingUser!.password
      );

      if (!isPasswordValid) {
        next(new BAD_REQUEST_ERROR("Invalid Credentials"));
        return

      }

      const token = jwt.sign(
        { email: existingUser!.email },
        process.env.JWT_SECRET_KEY || "random_jwt_2321@231**@$@#)"
      );

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("xcommerce", token, {
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 * 24 * cookieAgeInDays, // 1 day
        })
      );

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Logged in successfully", existingUser));
    } catch (error) {
      // console.log(error);
      next(error);
      
    }
  }
);

// get logged in user
Router.get(
  "/me",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.cookies;

      const { email } = jwt.decode(token!, process.env.JWT_SECRET_KEY);

      if (!email) {
        next(new BAD_REQUEST_ERROR("Invalid Token"));
        return

      }

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        next(new NOT_FOUND_ERROR("User not found"));
        return

      }

      return res
        .status(HttpStatusCode.OK)
        .send(new OK_REQUEST("Logged in successfully", user));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default Router;
