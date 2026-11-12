// A user's loyalty points.

import { getUser } from './session.ts';
// The mock stands in for the server until the TODO below is done.
import { mockUsers } from './__tests__/mocks/mock-data.ts';
import { delay } from './__tests__/mocks/mock-server.ts';

// TODO: getPoints -- replace the mock with a request:
// GET /users/:id/points, with the user's id in the path. The server
// answers { userId, loyaltyPoints }: return just the number.
export const getPoints = async (userId: string): Promise<number> => {
  await delay();
  const caller = getUser();
  if (!caller) {
    throw new Error('A token is required.');
  }
  if (caller.role !== 'staff' && caller.id !== userId) {
    throw new Error('You can only see your own points.');
  }
  const user = mockUsers.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error(`No user with id "${userId}".`);
  }
  return user.loyaltyPoints;
};
