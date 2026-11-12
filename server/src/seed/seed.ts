// GIVEN: idempotent seeding. Each function checks first and inserts only
// when it finds nothing, so restarting the server never duplicates data.
// The tests seed the menu but want orders and users to start empty.
import bcrypt from "bcryptjs";
import { MENU_COLLECTION, SALT_ROUNDS } from "../constants";
import { getDb } from "../db/db";
import * as usersRepository from "../db/users-repository";
import { MENU_SEED } from "./menu-data";

// Registration only ever makes customers, so this is the one way a staff
// account comes into being. For local development only -- a real app would
// never keep a password in its code.
const STAFF_USERNAME = "staff";
const STAFF_PASSWORD = "staff-password";

// A customer to log in as right away -- the same login the client's sample
// data has. (Anyone can also sign up: POST /auth/register.)
const DEMO_CUSTOMER_USERNAME = "client";
const DEMO_CUSTOMER_PASSWORD = "client-password";

export async function seedMenuIfEmpty(): Promise<void> {
  const menu = getDb().collection(MENU_COLLECTION);
  if ((await menu.countDocuments()) === 0) {
    await menu.insertMany(MENU_SEED);
  }
}

export async function seedStaffIfEmpty(): Promise<void> {
  if ((await usersRepository.findUserByUsername(STAFF_USERNAME)) === undefined) {
    await usersRepository.insertUser({
      username: STAFF_USERNAME,
      hashedPassword: await bcrypt.hash(STAFF_PASSWORD, SALT_ROUNDS),
      role: "staff",
    });
  }
}

export async function seedDemoCustomerIfEmpty(): Promise<void> {
  if ((await usersRepository.findUserByUsername(DEMO_CUSTOMER_USERNAME)) === undefined) {
    await usersRepository.insertUser({
      username: DEMO_CUSTOMER_USERNAME,
      hashedPassword: await bcrypt.hash(DEMO_CUSTOMER_PASSWORD, SALT_ROUNDS),
      role: "customer",
    });
  }
}
