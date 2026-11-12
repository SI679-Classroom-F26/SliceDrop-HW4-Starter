// MOCK SERVER -- the server's rules, played in the browser: who may do
// what, what an order costs, the points it earns, the checks on a menu
// item. The mock versions of the src/api/ functions use these until you
// replace each one with a real request -- then nothing uses them, and they
// stay out of the way here, with the tests.

import type { MenuItemChanges, OrderItem, User } from '../../../types.ts';
import { getUser } from '../../session.ts';
import { mockMenu, mockOrders } from './mock-data.ts';

// A pause like a real request's, so the loading states show up.
export const delay = (ms: number = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

let nextOrderNumber = mockOrders.length + 1;
export const nextMockOrderId = (): string => `mock-order-${nextOrderNumber++}`;

// The same arithmetic as the server's calculateOrderTotal: size (or flat)
// price + crust + toppings, times quantity, rounded to cents at the end.
export const mockTotal = (items: OrderItem[]): number => {
  let sum = 0;
  for (const line of items) {
    const item = mockMenu.find((candidate) => candidate.id === line.menuItemId);
    if (!item) {
      continue;
    }
    let unit = item.sizes?.find((size) => size.name === line.size)?.price ?? item.price ?? 0;
    unit += item.crusts?.find((crust) => crust.name === line.crust)?.price ?? 0;
    for (const name of line.toppings ?? []) {
      unit += item.toppings?.find((topping) => topping.name === name)?.price ?? 0;
    }
    sum += unit * line.quantity;
  }
  return Math.round(sum * 100) / 100;
};

// The server's loyalty rule: 100 points per whole dollar.
export const mockPoints = (total: number): number => Math.floor(total) * 100;

// ---- The server's token and role checks ----

export const mockCaller = (): User => {
  const user = getUser();
  if (!user) {
    throw new Error('A token is required.');
  }
  return user;
};

export const mockStaffCaller = (): User => {
  const caller = mockCaller();
  if (caller.role !== 'staff') {
    throw new Error('Only staff may do this.');
  }
  return caller;
};

// ---- The server's checks on a menu item ----

// The checks on the fields staff can type in, word for word the server's
// messages. Its answer for a bad body is a 400 with { errors: [...] },
// which apiFetch joins into one message -- so this joins them too.
export const mockServerValidation = (changes: MenuItemChanges): string | null => {
  const problems: string[] = [];
  if (changes.name !== undefined && changes.name.trim() === '') {
    problems.push('name must be a non-empty string.');
  }
  if (changes.price !== undefined && !(changes.price > 0)) {
    problems.push('price must be a number greater than 0.');
  }
  return problems.length > 0 ? problems.join(' ') : null;
};
