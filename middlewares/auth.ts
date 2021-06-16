require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { BAD_REQUEST_ERROR } from "../helpers/Error";
const jwt = require("jsonwebtoken");

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new BAD_REQUEST_ERROR("You are not logged in.");
    }
    next();
  } catch (err) {
    throw new BAD_REQUEST_ERROR("Invalid Token");
  }
};
export default auth;
