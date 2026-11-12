import { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors";
import { verifyToken } from "../services/auth-service";

// requireJwt -- 401 unless the request carries `Bearer <valid token>`. The
// verified payload goes in res.locals.user for requireRole and the
// controllers. verifyToken (services/auth-service.ts) does the checking,
// and throws the 401 for a bad or expired token.
export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const header = req.get("authorization");
  if (header === undefined || !header.startsWith("Bearer ")) {
    throw new AuthenticationError("A token is required.");
  }

  res.locals.user = verifyToken(header.slice("Bearer ".length));
  next();
}
