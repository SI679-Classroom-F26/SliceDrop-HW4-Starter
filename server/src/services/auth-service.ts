// The auth SERVICE: registering and logging in. No req/res here -- the
// controller hands over plain values, and problems are THROWN as the error
// classes from errors.ts. The error handler in app.ts turns each one into
// its status code, so this file never has to know HTTP exists.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SALT_ROUNDS } from "../constants";
import { getJwtSecret } from "../config";
import * as usersRepository from "../db/users-repository";
import { AuthenticationError, ConflictError, ValidationError } from "../errors";
import { PublicUser, TokenPayload } from "../models/user";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

// registerUser -- everyone who registers is a customer.
export async function registerUser(username: string, password: string): Promise<PublicUser> {
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    throw new ValidationError("username and password must be non-empty strings.");
  }

  if ((await usersRepository.findUserByUsername(username)) !== undefined) {
    throw new ConflictError("That username is taken.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await usersRepository.insertUser({ username, hashedPassword, role: "customer" });

  return { id: user.id, username: user.username, role: user.role };
}

// logIn -- a signed JWT for the right username + password. Every failure
// gets the same message, so an attacker can't tell which part was wrong.
export async function logIn(username: string, password: string): Promise<string> {
  const failure = new AuthenticationError("Wrong username or password.");

  // Not a string means not a name: never let a body turn into a Mongo query.
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    throw failure;
  }

  const user = await usersRepository.findUserByUsername(username);
  if (user === undefined) {
    throw failure;
  }

  if (!(await bcrypt.compare(password, user.hashedPassword))) {
    throw failure;
  }

  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, getJwtSecret(), { expiresIn: "1h" });
}

// TODO: verifyToken -- the week 8 lecture's. Check a token with our secret
// and return what it carries (a TokenPayload: sub, username, role). A bad
// or expired token makes jwt.verify throw: throw an AuthenticationError
// ("Invalid or expired token.") instead, so the caller gets our error, not
// jsonwebtoken's. Every request with a token goes through it (requireJwt
// calls it), and so will every socket connection (sockets/sockets.ts) --
// until it's written, every route that needs a token answers 500.
// src/__tests__/verify-token.unit.test.ts checks it.
export function verifyToken(token: string): TokenPayload {
  throw new Error("TODO: verifyToken is not written yet.");
}
