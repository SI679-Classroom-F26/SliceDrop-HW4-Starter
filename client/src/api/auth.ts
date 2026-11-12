// Logging in and out, and signing up.

import type { User } from '../types.ts';
import { clearSession, getUser, saveToken, saveUser } from './session.ts';
// The mocks stand in for the server until each TODO below is done.
import { mockUsers } from './__tests__/mocks/mock-data.ts';
import { delay } from './__tests__/mocks/mock-server.ts';
import { reconnectSocket } from './socket.ts';

// TODO: login -- replace the mock with two requests (week 7 lecture):
//   1. POST /auth/login with { username, password }. The server answers with
//      { token }: keep it with saveToken.
//   2. GET /auth/me (apiFetch sends the token you just saved). The server
//      answers with the token's payload: { sub, username, role, ... }. The
//      user's id is `sub`. Keep { id, username, role } with saveUser.
//   3. reconnectSocket(), so live updates come to this user -- then return
//      the user.
// A wrong password is the server's 401, which apiFetch turns into a thrown
// Error -- so a failed login never saves anything.
export const login = async (username: string, password: string): Promise<User> => {
  await delay();
  const found = mockUsers.find(
    (candidate) => candidate.username === username && candidate.password === password
  );
  if (!found) {
    throw new Error('Wrong username or password.');
  }
  saveToken(`mock-token-for-${found.username}`);
  const user: User = { id: found.id, username: found.username, role: found.role };
  saveUser(user);
  reconnectSocket();
  return user;
};

// TODO: register -- replace the mock with a request: POST /auth/register
// with { username, password }. The server answers 201 with the new user but
// NO token, so finish by logging in as them (there's a function for that)
// and return what it returns.
export const register = async (username: string, password: string): Promise<User> => {
  await delay();
  if (!username.trim() || !password.trim()) {
    throw new Error('username and password must be non-empty strings.');
  }
  if (mockUsers.some((candidate) => candidate.username === username)) {
    throw new Error('That username is taken.');
  }
  mockUsers.push({
    id: `mock-user-${username}`,
    username,
    password,
    role: 'customer',
    loyaltyPoints: 0
  });
  return login(username, password);
};

// GIVEN: logging out only forgets the token here, in this tab. There's no
// request: the server never kept track of who was logged in. The socket
// reconnects without a token, so this tab stops hearing this user's news.
export const logout = (): void => {
  clearSession();
  reconnectSocket();
};

// GIVEN: who's logged in in this tab, if anyone -- so a reload keeps you in.
export const getCurrentUser = (): User | null => getUser();
