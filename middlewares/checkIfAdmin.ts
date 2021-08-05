require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { UserRoles } from "../constants/UserRoles";
import { BAD_REQUEST_ERROR, UNAUTHORIZED_ERROR } from "../helpers/Error";

const checkIfAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = (req as any).user;
    if (role === UserRoles.USER) {
      throw new UNAUTHORIZED_ERROR("Operation Not Allowed");
    }

    next();
  } catch (err) {
    console.log(err);
    throw new BAD_REQUEST_ERROR("Invalid Token");
  }
};
export default checkIfAdmin;
