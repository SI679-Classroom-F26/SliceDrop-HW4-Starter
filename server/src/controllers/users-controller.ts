// User CONTROLLERS. Same job as the others: build the Caller, call the
// service, choose the status code.
import { Request, Response } from "express";
import { Caller } from "../models/user";
import * as loyaltyService from "../services/loyalty-service";

// getUserPoints -- GET /users/:id/points. 404 for no such user; a 403 is
// thrown by the service.
export async function getUserPoints(req: Request, res: Response): Promise<void> {
  const caller: Caller = { id: res.locals.user.sub, role: res.locals.user.role };
  const userId = String(req.params.id);

  const loyaltyPoints = await loyaltyService.getPointsFor(caller, userId);
  if (loyaltyPoints === undefined) {
    res.status(404).json({ error: `No user with id "${userId}".` });
    return;
  }

  res.json({ userId, loyaltyPoints });
}
