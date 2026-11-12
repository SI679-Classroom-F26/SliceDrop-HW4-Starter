// The loyalty SERVICE: how many points an order earns, keeping each
// customer's running total, and who may see it. Business rules only -- the
// repository just stores whatever number this file decides on.
import * as usersRepository from "../db/users-repository";
import { AuthorizationError } from "../errors";
import { Caller } from "../models/user";

// calculatePoints -- 100 points per whole dollar: drop the cents, then
// multiply.
export function calculatePoints(total: number): number {
  return Math.floor(total) * 100;
}

// addPoints -- read the user's total, add the change, save the result.
export async function addPoints(userId: string, change: number): Promise<void> {
  const user = await usersRepository.findUser(userId);
  if (user === undefined) {
    throw new Error(`addPoints: no user with id "${userId}" -- every caller should pass a real one.`);
  }

  await usersRepository.setLoyaltyPoints(userId, user.loyaltyPoints + change);
}

// getPointsFor -- a customer sees only their own; staff see anyone's. The
// owner IS the id asked about, so check before looking anything up.
export async function getPointsFor(caller: Caller, userId: string): Promise<number | undefined> {
  if (caller.role !== "staff" && caller.id !== userId) {
    throw new AuthorizationError("You can only see your own points.");
  }

  const user = await usersRepository.findUser(userId);
  return user?.loyaltyPoints;
}
