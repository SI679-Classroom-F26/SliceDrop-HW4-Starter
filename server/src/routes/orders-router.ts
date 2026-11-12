import { Router } from "express";
import {
  getOrder,
  getOrders,
  patchOrderCancel,
  patchOrderStatus,
  postOrder,
} from "../controllers/orders-controller";
import { requireJwt } from "../middleware/require-jwt";
import { requireRole } from "../middleware/require-role";
import { validateId } from "../middleware/validate-id";

// Order routes. Same order every time: who-are-you (requireJwt), then
// are-you-allowed (requireRole), then is-the-request-well-formed
// (validateId), then the controller. requireRole says WHICH roles get
// through; the service decides WHICH orders a customer sees.

export const ordersRouter = Router();

ordersRouter.post("/", requireJwt, requireRole("customer"), postOrder);
ordersRouter.get("/", requireJwt, requireRole("customer", "staff"), getOrders);
ordersRouter.get("/:id", requireJwt, requireRole("customer", "staff"), validateId, getOrder);
ordersRouter.patch("/:id/status", requireJwt, requireRole("staff"), validateId, patchOrderStatus);

// GIVEN: customers cancel their own pending orders.
ordersRouter.patch("/:id/cancel", requireJwt, requireRole("customer"), validateId, patchOrderCancel);
