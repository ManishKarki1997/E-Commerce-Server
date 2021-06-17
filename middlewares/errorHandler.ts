import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { BaseError } from "../helpers/Error";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.httpCode !== undefined) {
    return res.status(err.httpCode).send({
      error: true,
      message: err.message,
      payload: err.payload,
    });
  } else {
    return res.status(500).send({
      error: true,
      message: "Something went wrong",
    });
  }
};

export default errorHandler;
