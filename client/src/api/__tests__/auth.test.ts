import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login, register } from '../auth.ts';
import { getToken, getUser } from '../session.ts';
import { reconnectSocket } from '../socket.ts';
import { API_URL, fakeServer } from './fake-server.ts';

// login reconnects the live updates; here that's only checked, never run.
// The credentials are deliberately not a mock user's: the mock login would
// accept those without asking the server.
vi.mock('../socket.ts', () => ({ reconnectSocket: vi.fn(), subscribe: vi.fn() }));

const USERNAME = 'a-customer';
const PASSWORD = 'a-customer-password';
const ISSUED_TOKEN = 'the-token-the-server-issued';
const USER_ID = '64b000000000000000000001';
// What GET /auth/me answers: the token's payload, iat and exp included.
const TOKEN_PAYLOAD = { sub: USER_ID, username: USERNAME, role: 'customer', iat: 1, exp: 2 };
const LOGGED_IN_USER = { id: USER_ID, username: USERNAME, role: 'customer' };

beforeEach(() => {
  vi.mocked(reconnectSocket).mockClear();
});

describe('login', () => {
  it('posts the username and password, then asks /auth/me with the new token', async () => {
    const sent = fakeServer(
      { status: 200, body: { token: ISSUED_TOKEN } },
      { status: 200, body: TOKEN_PAYLOAD }
    );

    await login(USERNAME, PASSWORD);

    expect(sent).toHaveLength(2);
    expect(sent[0].method).toBe('POST');
    expect(sent[0].url).toBe(`${API_URL}/auth/login`);
    expect(sent[0].body).toEqual({ username: USERNAME, password: PASSWORD });
    expect(sent[1].method).toBe('GET');
    expect(sent[1].url).toBe(`${API_URL}/auth/me`);
    expect(sent[1].headers.get('Authorization')).toBe(`Bearer ${ISSUED_TOKEN}`);
  });

  it("gives back and keeps the user -- id from the token's sub -- and keeps the token", async () => {
    const sent = fakeServer(
      { status: 200, body: { token: ISSUED_TOKEN } },
      { status: 200, body: TOKEN_PAYLOAD }
    );

    const user = await login(USERNAME, PASSWORD);

    expect(sent).toHaveLength(2);
    expect(user).toEqual(LOGGED_IN_USER);
    expect(getUser()).toEqual(LOGGED_IN_USER);
    expect(getToken()).toBe(ISSUED_TOKEN);
  });

  it('reconnects the live updates, as the new user', async () => {
    const sent = fakeServer(
      { status: 200, body: { token: ISSUED_TOKEN } },
      { status: 200, body: TOKEN_PAYLOAD }
    );

    await login(USERNAME, PASSWORD);

    expect(sent).toHaveLength(2);
    expect(reconnectSocket).toHaveBeenCalled();
  });

  it("throws the server's message for a wrong password, and keeps nothing", async () => {
    const sent = fakeServer({ status: 401, body: { error: 'Wrong username or password.' } });

    await expect(login(USERNAME, 'wrong')).rejects.toThrow('Wrong username or password.');
    expect(sent).toHaveLength(1);
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });
});

describe('register', () => {
  it('posts the new account, then logs in as it', async () => {
    const sent = fakeServer(
      { status: 201, body: { id: USER_ID, username: USERNAME, role: 'customer' } },
      { status: 200, body: { token: ISSUED_TOKEN } },
      { status: 200, body: TOKEN_PAYLOAD }
    );

    const user = await register(USERNAME, PASSWORD);

    expect(sent[0].method).toBe('POST');
    expect(sent[0].url).toBe(`${API_URL}/auth/register`);
    expect(sent[0].body).toEqual({ username: USERNAME, password: PASSWORD });
    expect(sent[1].url).toBe(`${API_URL}/auth/login`);
    expect(user).toEqual(LOGGED_IN_USER);
    expect(getToken()).toBe(ISSUED_TOKEN);
  });

  it("throws the server's message when the username is taken, and logs nobody in", async () => {
    const sent = fakeServer({ status: 409, body: { error: 'That username is taken.' } });

    await expect(register(USERNAME, PASSWORD)).rejects.toThrow('That username is taken.');
    expect(sent).toHaveLength(1);
    expect(getToken()).toBeNull();
  });
});
