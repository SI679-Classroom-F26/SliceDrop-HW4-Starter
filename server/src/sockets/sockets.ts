// The socket server: how browsers keep a connection open to us, so we can
// tell them when something changes.
//
// Set up once in index.ts with initSockets(), then used anywhere through
// getIo() -- the same shape as connect() and getDb() in db/db.ts.
import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { getClientOrigin } from "../config";
import { verifyToken } from "../services/auth-service";

let io: Server | null = null;

// TODO: initSockets -- the week 8 lecture's, for SliceDrop. Three parts:
//   1. Make the socket server on httpServer and keep it in `io` (above).
//      Sockets do CORS separately from Express: give it the same origin,
//      getClientOrigin().
//   2. io.use: check each connection before it's let in. The browser sends
//      its token as socket.handshake.auth.token. No token: let it in
//      (anonymous -- it only hears broadcasts). A token verifyToken
//      accepts: keep the payload on socket.data.user and let it in. One it
//      rejects: turn the connection away with next(new Error(...)).
//   3. io.on("connection"): put a logged-in socket in its rooms -- every
//      user in `user:<their id>` (the token's sub), staff in "staff" too.
//      Rooms come from the token, never from anything the browser asks for.
// src/__tests__/sockets.e2e.test.ts checks it (with notifier.ts).
export function initSockets(httpServer: HttpServer): void {
  throw new Error("TODO: initSockets is not written yet.");
}

// GIVEN: null until initSockets() runs -- which it never does in the tests
// that use supertest alone, so callers write getIo()?.
export function getIo(): Server | null {
  return io;
}
