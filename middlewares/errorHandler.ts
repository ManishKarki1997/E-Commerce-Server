import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { BaseError } from "../helpers/Error";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  return res.status(err.httpCode).send({
    error: true,
    message: err.message,
  });
};

export default errorHandler;
