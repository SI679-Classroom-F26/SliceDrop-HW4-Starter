import { Router } from "express";
import { getUserPoints } from "../controllers/users-controller";
import { requireJwt } from "../middleware/require-jwt";
import { validateId } from "../middleware/validate-id";

// Users routes, mounted at /users in app.ts. No requireRole: both roles may
// call it, and whose points they may see is the service's decision.
export const usersRouter = Router();

usersRouter.get("/:id/points", requireJwt, validateId, getUserPoints);
