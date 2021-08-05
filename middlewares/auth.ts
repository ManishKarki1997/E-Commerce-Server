require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { BAD_REQUEST_ERROR } from "../helpers/Error";
const jwt = require("jsonwebtoken");

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const xcommerceToken = (req.cookies as any).xcommerceToken;
    if (!xcommerceToken) {
      throw new BAD_REQUEST_ERROR("You are not logged in.");
    }
    const decodedToken = jwt.verify(
      xcommerceToken,
      process.env.JWT_SECRET_KEY || "random_jwt_2321@231**@$@#)"
    );
    (req as any).user = decodedToken;
    // req["user"] = decodedToken;

    next();
  } catch (err) {
    console.log(err);
    throw new BAD_REQUEST_ERROR("Invalid Token");
  }
};
export default auth;
