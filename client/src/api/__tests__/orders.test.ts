import { beforeEach, describe, expect, it } from 'vitest';
import { cancelOrder, getOrders, placeOrder, updateOrderStatus } from '../orders.ts';
import { saveToken } from '../session.ts';
import { API_URL, fakeServer } from './fake-server.ts';
import type { NewOrder, Order } from '../../types.ts';
import { mockOrders } from './mocks/mock-data.ts';

const LOGGED_IN_TOKEN = 'a-logged-in-token';
// The fake server answers with a mock order (made pending: the one the
// cancel and status tests act on).
const STORED_ORDER: Order = { ...mockOrders[0], status: 'pending' };
const ORDER_ID = STORED_ORDER.id;
const NEW_ORDER: NewOrder = { customerName: STORED_ORDER.customerName, items: STORED_ORDER.items };

beforeEach(() => {
  saveToken(LOGGED_IN_TOKEN);
});

describe('placeOrder', () => {
  it('POSTs the order, with the token, and gives back the stored one', async () => {
    const sent = fakeServer({ status: 201, body: STORED_ORDER });

    const placed = await placeOrder(NEW_ORDER);

    expect(sent[0].method).toBe('POST');
    expect(sent[0].url).toBe(`${API_URL}/orders`);
    expect(sent[0].body).toEqual(NEW_ORDER);
    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${LOGGED_IN_TOKEN}`);
    expect(placed).toEqual(STORED_ORDER);
  });

  it("throws the server's messages for an order it rejects", async () => {
    const sent = fakeServer({
      status: 400,
      body: { errors: ['items must be a non-empty array.'] }
    });

    await expect(placeOrder({ customerName: 'Pickup Name', items: [] })).rejects.toThrow(
      'items must be a non-empty array.'
    );
    expect(sent).toHaveLength(1);
  });
});

describe('getOrders', () => {
  it('asks for the orders, with the token', async () => {
    const sent = fakeServer({ status: 200, body: [STORED_ORDER] });

    const orders = await getOrders();

    expect(sent[0].method).toBe('GET');
    expect(sent[0].url).toBe(`${API_URL}/orders`);
    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${LOGGED_IN_TOKEN}`);
    expect(orders).toEqual([STORED_ORDER]);
  });
});

describe('cancelOrder', () => {
  it("PATCHes the order's cancel address and gives back the cancelled order", async () => {
    const cancelled = { ...STORED_ORDER, status: 'cancelled' };
    const sent = fakeServer({ status: 200, body: cancelled });

    const answer = await cancelOrder(ORDER_ID);

    expect(sent[0].method).toBe('PATCH');
    expect(sent[0].url).toBe(`${API_URL}/orders/${ORDER_ID}/cancel`);
    expect(answer).toEqual(cancelled);
  });

  it("throws the server's message when the order isn't pending any more", async () => {
    const message = 'Only a pending order can be cancelled; this one is completed.';
    const sent = fakeServer({ status: 409, body: { error: message } });

    await expect(cancelOrder(ORDER_ID)).rejects.toThrow(message);
    expect(sent).toHaveLength(1);
  });
});

describe('updateOrderStatus', () => {
  it("PATCHes { status } to the order's status address", async () => {
    const completed = { ...STORED_ORDER, status: 'completed' };
    const sent = fakeServer({ status: 200, body: completed });

    const answer = await updateOrderStatus(ORDER_ID, 'completed');

    expect(sent[0].method).toBe('PATCH');
    expect(sent[0].url).toBe(`${API_URL}/orders/${ORDER_ID}/status`);
    expect(sent[0].body).toEqual({ status: 'completed' });
    expect(answer).toEqual(completed);
  });
});
