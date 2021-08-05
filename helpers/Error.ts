import { HttpStatusCode } from "../constants/HttpStatusCodes";

export class BaseError extends Error {
  public readonly httpCode: HttpStatusCode;
  public readonly payload: any;

  constructor(httpStatusCode: HttpStatusCode, message: string, payload: any) {
    super(message);
    this.httpCode = httpStatusCode;
    this.payload = payload;
  }
}

export class NOT_FOUND_ERROR extends BaseError {
  constructor(message = "Resource not found.", payload: any = {}) {
    super(HttpStatusCode.NOT_FOUND, message, payload);
  }
}

export class INTERNAL_SERVER_ERROR extends BaseError {
  constructor(message = "Internal server error", payload: any = {}) {
    super(HttpStatusCode.INTERNAL_SERVER, message, payload);
  }
}

export class BAD_REQUEST_ERROR extends BaseError {
  constructor(message = "Bad Request", payload: any = {}) {
    super(HttpStatusCode.BAD_REQUEST, message, payload);
  }
}

export class UNAUTHORIZED_ERROR extends BaseError {
  constructor(message = "Unauthorized", payload: any = {}) {
    super(HttpStatusCode.UNAUTHORIZED, message, payload);
  }
}

export class OK_REQUEST {
  public readonly message: string;
  public readonly payload: any;
  public readonly httpCode = 200;

  constructor(message = "Success", payload: any = {}) {
    this.message = message;
    this.payload = payload;
  }
}
