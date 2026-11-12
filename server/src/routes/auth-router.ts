import { Router } from "express";
import { getMe, postLogin, postRegister } from "../controllers/auth-controller";
import { requireJwt } from "../middleware/require-jwt";

// Auth routes, mounted at /auth in app.ts.
export const authRouter = Router();

authRouter.post("/register", postRegister);
authRouter.post("/login", postLogin);
authRouter.get("/me", requireJwt, getMe);
