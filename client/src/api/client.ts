// One place that knows how to talk to the server. Every function in
// src/api/ that reaches the server goes through apiFetch.

import { getToken } from './session.ts';

// From client/.env. Vite only hands the browser variables that start with
// VITE_, and only reads .env when `npm run dev` starts.
const API_URL = import.meta.env.VITE_API_URL;

type Options = {
  method?: string;
  body?: unknown;
};

// TODO: apiFetch -- the week 7 helper. Send a request to `${API_URL}${path}`
// and give back the JSON the server answers with:
//   - the method from options (GET when there's none)
//   - a body? JSON.stringify it, and send Content-Type: application/json
//     so express.json() reads it
//   - a token in the session (getToken)? send Authorization: Bearer <token>
//   - not every response has a JSON body: fall back to {} instead of crashing
//   - fetch doesn't throw for a 4xx or 5xx. When the response isn't ok,
//     THROW an Error -- that's what the screens catch and show. Its message:
//       { error: "..." }      most of our errors -- use that string
//       { errors: [...] }     an invalid order (POST /orders) -- join the list
//       neither               fall back to the status, e.g. "404 Not Found"
//
// Nothing calls apiFetch until you start replacing the mocks, so the app
// works on mock data while this is still a TODO.
export const apiFetch = async (
  path: string,
  options: Options = {}
): Promise<any> => {
  throw new Error(`TODO: apiFetch is not written yet (${options.method ?? 'GET'} ${API_URL}${path}, token: ${getToken() ? 'yes' : 'no'}).`);
};
