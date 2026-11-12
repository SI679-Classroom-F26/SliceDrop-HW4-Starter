import { NextFunction, Request, Response } from "express";
import { AuthorizationError } from "../errors";
import { Role } from "../models/user";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// requireRole(...allowed) -- a middleware factory. 403 unless the token's
// role is one of `allowed`. Always runs after requireJwt.
export function requireRole(...allowed: Role[]): Middleware {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!allowed.includes(res.locals.user?.role)) {
      throw new AuthorizationError(`Only ${allowed.join(" or ")} may do this.`);
    }
    next();
  };
}
