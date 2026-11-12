import { describe, expect, it } from 'vitest';
import { apiFetch } from '../client.ts';
import { saveToken } from '../session.ts';
import { API_URL, fakeServer } from './fake-server.ts';

const SAVED_TOKEN = 'a-saved-token';
const SOME_BODY = { name: 'Brownie', price: 5.99 };

describe('apiFetch', () => {
  it("sends a GET to the server's address plus the path, and gives back the JSON", async () => {
    const sent = fakeServer({ status: 200, body: [{ id: 'soda' }] });

    const answer = await apiFetch('/menu');

    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe(`${API_URL}/menu`);
    expect(sent[0].method).toBe('GET');
    expect(answer).toEqual([{ id: 'soda' }]);
  });

  it('sends the method it is given, and the body as JSON with a Content-Type', async () => {
    const sent = fakeServer({ status: 201, body: { id: 'brownie' } });

    await apiFetch('/menu', { method: 'POST', body: SOME_BODY });

    expect(sent[0].method).toBe('POST');
    expect(sent[0].body).toEqual(SOME_BODY);
    expect(sent[0].headers.get('Content-Type')).toContain('application/json');
  });

  it('sends the saved token as a Bearer token', async () => {
    saveToken(SAVED_TOKEN);
    const sent = fakeServer({ status: 200, body: [] });

    await apiFetch('/orders');

    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${SAVED_TOKEN}`);
  });

  it('sends no Authorization header when nobody is logged in', async () => {
    const sent = fakeServer({ status: 200, body: [] });

    await apiFetch('/menu');

    expect(sent[0].headers.has('Authorization')).toBe(false);
  });

  it('gives back {} when the response has no body', async () => {
    fakeServer({ status: 204 });

    expect(await apiFetch('/menu/soda', { method: 'DELETE' })).toEqual({});
  });

  it("throws the server's { error } message", async () => {
    fakeServer({ status: 401, body: { error: 'Wrong username or password.' } });

    await expect(apiFetch('/auth/login', { method: 'POST', body: {} })).rejects.toThrow(
      'Wrong username or password.'
    );
  });

  it('throws every message in { errors: [...] }', async () => {
    fakeServer({
      status: 400,
      body: { errors: ['customerName is required.', 'items must be a non-empty array.'] }
    });

    const failure = apiFetch('/orders', { method: 'POST', body: {} });

    await expect(failure).rejects.toThrow('customerName is required.');
    await expect(failure).rejects.toThrow('items must be a non-empty array.');
  });

  it("throws with the status when the body doesn't say what went wrong", async () => {
    fakeServer({ status: 404 });

    await expect(apiFetch('/nowhere')).rejects.toThrow('404');
  });
});
