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
      error: err.httpCode != 200,
      message: err.message,
      errors: err.httpCode == 200 ? null : { ...err.payload.errors },
      payload: err.httpCode == 200 ? err.payload : null,
    });
  } else {
    console.log(err)
    return res.status(500).send({
      error: true,
      errors: {},
      message: "Something went wrong",
    });
  }
};

export default errorHandler;
