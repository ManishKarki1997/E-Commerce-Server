import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../constants/HttpStatusCodes";
import { BaseError } from "../helpers/Error";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof BaseError) {
    return res.status(err.httpCode).send({
      error: true,
      err,
    });
  }

  return res.status(HttpStatusCode.INTERNAL_SERVER).send({
    error: true,
    message: "Something went wrong",
  });
};

export default errorHandler;
