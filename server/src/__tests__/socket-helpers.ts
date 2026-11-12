// GIVEN: helpers for testing sockets -- the week 8 lecture's. You don't
// need to change these, but read them: they're how sockets.e2e.test.ts
// talks to the server.
//
// Testing sockets needs a real server, listening on a real port. supertest
// alone makes one request and it's over; a socket has to stay connected
// while something else happens.
// This file is not a test -- vitest only picks up *.test.ts.
import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { io as connectClient } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { app } from "../app";
import { getIo, initSockets } from "../sockets/sockets";

let server: HttpServer | null = null;
let url = "";
const clients: Socket[] = [];

// Start our app, sockets and all, on a free port (port 0 means "any free
// port"). Returns its address, which supertest can use too.
export async function startTestServer(): Promise<string> {
  server = createServer(app);
  initSockets(server);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  url = `http://localhost:${(server.address() as AddressInfo).port}`;
  return url;
}

export async function stopTestServer(): Promise<void> {
  for (const client of clients) {
    client.disconnect();
  }
  clients.length = 0;
  // Closing the socket server closes the HTTP server under it too.
  await new Promise<void>((resolve) => {
    const io = getIo();
    if (io) {
      io.close(() => resolve());
    } else {
      server?.close(() => resolve());
    }
  });
}

// Connect a test client, the way a browser would: with a token, or with
// none. Resolves once the server has let it in; rejects if it's turned away.
export function connectAs(token?: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const client = connectClient(url, {
      auth: token ? { token } : {},
      transports: ["websocket"],
    });
    clients.push(client);
    client.on("connect", () => resolve(client));
    client.on("connect_error", (err) => reject(err));
  });
}

// Resolves with the data of the next `event` this client hears. Fails the
// test if nothing arrives within `ms` milliseconds.
export function nextEvent(client: Socket, event: string, ms: number = 2000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`No ${event} within ${ms}ms`));
    }, ms);
    client.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

// Resolves true if this client hears `event` within `ms` milliseconds, and
// false if it doesn't. For checking that someone *didn't* hear something.
export function heardWithin(client: Socket, event: string, ms: number = 300): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), ms);
    client.once(event, () => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}
