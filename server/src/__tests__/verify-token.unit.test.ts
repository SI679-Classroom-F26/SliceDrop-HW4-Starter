import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config";
import { AuthenticationError } from "../errors";
import { verifyToken } from "../services/auth-service";

// What logIn signs into every token.
const CUSTOMER_PAYLOAD = { sub: "64b000000000000000000001", username: "a-customer", role: "customer" };
const SOMEONE_ELSES_SECRET = "not-our-secret";
const ONE_HOUR_AGO_IN_SECONDS = Math.floor(Date.now() / 1000) - 60 * 60;

describe("verifyToken", () => {
  it("returns the user a valid token was signed for", () => {
    const token = jwt.sign(CUSTOMER_PAYLOAD, getJwtSecret(), { expiresIn: "1h" });

    expect(verifyToken(token)).toMatchObject(CUSTOMER_PAYLOAD);
  });

  it("throws an AuthenticationError for something that isn't a token", () => {
    expect(() => verifyToken("not-a-real-token")).toThrow(AuthenticationError);
  });

  it("throws an AuthenticationError for a token signed with another secret", () => {
    const forged = jwt.sign(CUSTOMER_PAYLOAD, SOMEONE_ELSES_SECRET);

    expect(() => verifyToken(forged)).toThrow(AuthenticationError);
  });

  it("throws an AuthenticationError for an expired token", () => {
    const expired = jwt.sign({ ...CUSTOMER_PAYLOAD, exp: ONE_HOUR_AGO_IN_SECONDS }, getJwtSecret());

    expect(() => verifyToken(expired)).toThrow(AuthenticationError);
  });
});
