// GIVEN: settings that come from the environment rather than from the code.
//
// `npm run dev` loads .env with Node's --env-file flag (see package.json).
// The tests set their own value in vitest.config.ts.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Copy .env.example to .env.");
  }
  return secret;
}

// TODO: getClientOrigin -- the one origin whose pages may call this server
// from a browser: CLIENT_ORIGIN from the environment (.env), or
// "http://localhost:5173" -- where the client's dev server runs -- when
// it isn't set. Unlike JWT_SECRET, a missing value isn't an error: the
// default is right for local development.
// src/__tests__/config.unit.test.ts checks it.
export function getClientOrigin(): string {
  throw new Error("TODO: getClientOrigin is not written yet.");
}
