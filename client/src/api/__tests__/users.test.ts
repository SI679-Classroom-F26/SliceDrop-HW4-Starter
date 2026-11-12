import { describe, expect, it } from 'vitest';
import { getPoints } from '../users.ts';
import { saveToken, saveUser } from '../session.ts';
import { API_URL, fakeServer } from './fake-server.ts';
import { mockUsers } from './mocks/mock-data.ts';

// The fake server answers with a mock customer's balance.
const CUSTOMER = mockUsers.find((user) => user.role === 'customer')!;
const USER_ID = CUSTOMER.id;
const LOGGED_IN_TOKEN = 'a-logged-in-token';
const SERVER_BALANCE = CUSTOMER.loyaltyPoints;

describe('getPoints', () => {
  it("asks for the user's points and gives back just the number", async () => {
    saveToken(LOGGED_IN_TOKEN);
    saveUser({ id: USER_ID, username: 'a-customer', role: 'customer' });
    const sent = fakeServer({
      status: 200,
      body: { userId: USER_ID, loyaltyPoints: SERVER_BALANCE }
    });

    const balance = await getPoints(USER_ID);

    expect(sent[0].method).toBe('GET');
    expect(sent[0].url).toBe(`${API_URL}/users/${USER_ID}/points`);
    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${LOGGED_IN_TOKEN}`);
    expect(balance).toBe(SERVER_BALANCE);
  });
});
