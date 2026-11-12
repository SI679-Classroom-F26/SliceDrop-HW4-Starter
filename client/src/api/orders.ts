// Orders: customers place, list and cancel their own; staff move them
// along.

import type { NewOrder, Order, OrderStatus } from '../types.ts';
// The mocks stand in for the server until each TODO below is done.
import { mockOrders, mockUsers } from './__tests__/mocks/mock-data.ts';
import {
  delay,
  mockCaller,
  mockPoints,
  mockStaffCaller,
  mockTotal,
  nextMockOrderId
} from './__tests__/mocks/mock-server.ts';

// TODO: placeOrder -- replace the mock with a request: POST /orders with
// the order as the body: the customer's name for pickup and the items. No
// prices and no customer id: the server works out the total, and takes
// who's ordering from the token. Answers 201 with the stored order (total
// and pointsEarned included).
export const placeOrder = async (order: NewOrder): Promise<Order> => {
  await delay();
  const caller = mockCaller();
  if (order.items.length === 0) {
    throw new Error('items must be a non-empty array.');
  }
  const total = mockTotal(order.items);
  const placed: Order = {
    ...structuredClone(order),
    id: nextMockOrderId(),
    customerId: caller.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    total,
    pointsEarned: mockPoints(total)
  };
  mockOrders.push(placed);
  const owner = mockUsers.find((candidate) => candidate.id === caller.id);
  if (owner) {
    owner.loyaltyPoints += placed.pointsEarned;
  }
  return structuredClone(placed);
};

// TODO: getOrders -- replace the mock with a request: GET /orders. The
// server decides what each caller sees, from the token: a customer gets
// their own orders, staff get all.
export const getOrders = async (): Promise<Order[]> => {
  await delay();
  const caller = mockCaller();
  const visible =
    caller.role === 'staff'
      ? mockOrders
      : mockOrders.filter((order) => order.customerId === caller.id);
  return structuredClone(visible);
};

// TODO: cancelOrder -- replace the mock with a request:
// PATCH /orders/:id/cancel, with the order's id in the path. No body.
// Answers with the cancelled order; a 409 when it isn't pending any more
// (apiFetch throws the server's message).
export const cancelOrder = async (id: string): Promise<Order> => {
  await delay();
  const caller = mockCaller();
  const order = mockOrders.find((candidate) => candidate.id === id);
  if (!order) {
    throw new Error(`No order with id "${id}".`);
  }
  if (order.customerId !== caller.id) {
    throw new Error('You can only cancel your own orders.');
  }
  if (order.status !== 'pending') {
    throw new Error(`Only a pending order can be cancelled; this one is ${order.status}.`);
  }
  order.status = 'cancelled';
  const owner = mockUsers.find((candidate) => candidate.id === order.customerId);
  if (owner) {
    owner.loyaltyPoints -= order.pointsEarned;
  }
  return structuredClone(order);
};

// TODO: updateOrderStatus -- replace the mock with a request:
// PATCH /orders/:id/status (staff), with the order's id in the path and
// { status } as the body. Answers with the updated order.
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  await delay();
  mockStaffCaller();
  const order = mockOrders.find((candidate) => candidate.id === id);
  if (!order) {
    throw new Error(`No order with id "${id}".`);
  }
  order.status = status;
  return structuredClone(order);
};
