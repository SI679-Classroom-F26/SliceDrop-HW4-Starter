import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { startTestDb, stopTestDb } from "./mongo-helper";

beforeAll(startTestDb);
afterAll(stopTestDb);

// The browser sends an Origin header with every cross-origin request, and
// only hands the response to the page if the server names that origin in
// Access-Control-Allow-Origin. The tests don't set CLIENT_ORIGIN, so the
// allowed origin is getClientOrigin()'s default: the client's dev server.
const clientOrigin = "http://localhost:5173";
const someOtherSite = "http://some-other-site.example";

describe("CORS", () => {
  it("names the client's origin on an ordinary request", async () => {
    const res = await request(app).get("/menu").set("Origin", clientOrigin);
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(clientOrigin);
  });

  it("answers the preflight a browser sends before a JSON POST with a token", async () => {
    const res = await request(app)
      .options("/orders")
      .set("Origin", clientOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type,authorization");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(clientOrigin);
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });

  it("does not let other sites read the server's answers", async () => {
    const res = await request(app).get("/menu").set("Origin", someOtherSite);
    expect(res.headers["access-control-allow-origin"]).not.toBe(someOtherSite);
    expect(res.headers["access-control-allow-origin"]).not.toBe("*");
  });
});
