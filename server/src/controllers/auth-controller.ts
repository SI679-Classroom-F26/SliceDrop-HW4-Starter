// Auth CONTROLLERS. Thin on purpose: pull values off the request, call the
// service, choose the success status. Failures arrive as thrown errors and
// never pass through here -- Express hands them to the error handler.
import { Request, Response } from "express";
import * as authService from "../services/auth-service";

export async function postRegister(req: Request, res: Response): Promise<void> {
  const user = await authService.registerUser(req.body?.username, req.body?.password);
  res.status(201).json(user);
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const token = await authService.logIn(req.body?.username, req.body?.password);
  res.json({ token });
}

// requireJwt has already verified the token and left its payload here.
export function getMe(_req: Request, res: Response): void {
  res.json(res.locals.user);
}
