// GIVEN: a stand-in for the server. fakeServer(...replies) replaces fetch:
// each request gets the next reply, in order, and is written down so the
// test can check what was sent -- the address, method, headers and body.
// This file is not a test -- vitest only picks up *.test.ts.
import { vi } from 'vitest';

export const API_URL = 'http://slicedrop-server.test';

export type Reply = { status: number; body?: unknown };

export type SentRequest = {
  url: string;
  method: string;
  headers: Headers;
  body: unknown;
};

const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error'
};

export const fakeServer = (...replies: Reply[]): SentRequest[] => {
  const sent: SentRequest[] = [];
  const waiting = [...replies];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init: RequestInit = {}) => {
      const request: SentRequest = {
        url: String(input),
        method: (init.method ?? 'GET').toUpperCase(),
        headers: new Headers(init.headers),
        body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body
      };
      sent.push(request);

      const reply = waiting.shift();
      if (!reply) {
        throw new Error(`The fake server has no reply for ${request.method} ${request.url}.`);
      }
      const hasBody = reply.body !== undefined;
      return new Response(hasBody ? JSON.stringify(reply.body) : null, {
        status: reply.status,
        statusText: STATUS_TEXT[reply.status] ?? '',
        headers: hasBody ? { 'Content-Type': 'application/json' } : {}
      });
    })
  );

  return sent;
};
