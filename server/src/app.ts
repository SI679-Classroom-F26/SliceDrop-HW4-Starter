import express, { NextFunction, Request, Response } from "express";
import { AuthenticationError, AuthorizationError, ConflictError, ValidationError } from "./errors";
import { authRouter } from "./routes/auth-router";
import { menuRouter } from "./routes/menu-router";
import { ordersRouter } from "./routes/orders-router";
import { usersRouter } from "./routes/users-router";

export const app = express();

// TODO: CORS -- the client runs on http://localhost:5173 and this server on
// http://localhost:3000: different origins, so the browser refuses to hand
// the client this server's answers unless the server says that origin is
// allowed. Add the cors middleware (already installed: import cors from
// "cors") here, BEFORE the routers, allowing only getClientOrigin() from
// config.ts (also a TODO) -- not every origin. Same as the week 7 lecture.
// src/__tests__/cors.e2e.test.ts checks it.

app.use(express.json());

app.use("/menu", menuRouter);
app.use("/orders", ordersRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);

// Any request no router handled ends up here.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found." });
});

// Fall-through error handler. Express recognizes it by its four parameters,
// and sends it EVERY error -- not just the one we happen to be thinking about.
// Our own error classes (errors.ts) map to their status codes; bad JSON is
// the client's 400; anything else is our bug, a 500.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof AuthenticationError) {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err instanceof AuthorizationError) {
    res.status(403).json({ error: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Request body is not valid JSON." });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});
