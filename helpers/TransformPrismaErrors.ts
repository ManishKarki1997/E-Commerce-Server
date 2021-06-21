import { PrismaErrorCodes } from "../constants/PrismaErrorCodes";

export default (error: any, modelName: string) => {
  if (error.code === undefined) {
    return error;
  }

  let errors: { [k: string]: any } = {};

  if (error.code === PrismaErrorCodes.NESTED_CONNECT_ID_INVALID) {
    errors["reason"] = error.meta.cause;
  } else if (error.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_VIOLATION_CODE) {
    error.meta.target.forEach((m: string | number) => {
      errors[m] = `${modelName} with that ${m} already exists`;
    });
  }
  return errors;
};
