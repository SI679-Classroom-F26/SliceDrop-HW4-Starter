// The orders SERVICE layer: business logic that is not HTTP (that's the
// controllers) and not database access (that's db/). Pricing is a business
// rule -- it belongs to the restaurant, not to Express and not to Mongo.
//
// You may notice the menu has no service layer at all: its controllers call
// the menu repository directly, because the menu HAS no business logic, and a
// layer that only forwards calls is ceremony, not architecture. Not every
// resource needs every layer.
import { findMenuItem } from "../db/menu-repository";
import * as ordersRepository from "../db/orders-repository";
import * as loyaltyService from "./loyalty-service";
import { AuthorizationError, ConflictError } from "../errors";
import { NewOrder, Order, OrderItem } from "../models/order";
import { Caller } from "../models/user";

// An order is placed all at once: there is no saved cart. The cart lives in
// the client until the customer is ready, and the order arrives complete.
// Every new order starts "pending" (addOrder sets that); the customer can
// cancel it only while it is still pending -- once staff move it to
// "in-progress", the kitchen has started (see cancelOrder).
//
// placeOrder -- price it, work out its points, store it with whoever placed
// it, and credit them. The owner comes from the token, never the body.
export async function placeOrder(caller: Caller, newOrder: NewOrder): Promise<Order> {
  const total = await calculateOrderTotal(newOrder.items);
  const points = loyaltyService.calculatePoints(total);
  const order = await ordersRepository.addOrder(newOrder, total, caller.id, points);
  await loyaltyService.addPoints(caller.id, points);
  return order;
}

// listOrdersFor -- staff see every order; a customer sees only their own.
export async function listOrdersFor(caller: Caller, status?: string): Promise<Order[]> {
  if (caller.role === "staff") {
    return ordersRepository.listOrders({ status });
  }
  return ordersRepository.listOrders({ status, customerId: caller.id });
}

// getOrderFor -- staff may read any order; a customer only their own. The
// owner is written on the order, so the lookup has to come first.
export async function getOrderFor(caller: Caller, id: string): Promise<Order | undefined> {
  const order = await ordersRepository.getOrder(id);
  if (order === undefined) {
    return undefined;
  }

  if (caller.role !== "staff" && order.customerId !== caller.id) {
    throw new AuthorizationError("You can only see your own orders.");
  }

  return order;
}

/**
 * GIVEN: a customer cancels their own order, while it is still pending.
 * Fetch, then check ownership, then check the business rule, and only then
 * write. Nothing is written unless every check passes -- the unit tests in
 * orders-service.unit.test.ts hold this function to that.
 */
export async function cancelOrder(caller: Caller, id: string): Promise<Order | undefined> {
  const order = await ordersRepository.getOrder(id);
  if (order === undefined) {
    return undefined;
  }

  if (order.customerId !== caller.id) {
    throw new AuthorizationError("You can only cancel your own orders.");
  }

  // 409: the request clashes with the order's current state.
  if (order.status !== "pending") {
    throw new ConflictError(`Only a pending order can be cancelled; this one is ${order.status}.`);
  }

  const cancelled = await ordersRepository.updateOrderStatus(id, "cancelled");

  // A cancelled order doesn't keep its points: take back exactly what it
  // earned, now that every check has passed.
  await loyaltyService.addPoints(order.customerId, -order.pointsEarned);

  return cancelled;
}

// calculateOrderTotal -- for each item:
//   base price (matching size's price, or the flat price)
//   + crust price + each topping's price   (a sauce choice is free)
//   x quantity
// summed, then rounded to cents at the end (floating point).
//
// Validation has already run, so every id and option is known to exist.
export async function calculateOrderTotal(items: OrderItem[]): Promise<number> {
  let sum = 0;

  for (const item of items) {
    const menuItem = await findMenuItem(item.menuItemId);
    if (menuItem === undefined) {
      throw new Error(`calculateOrderTotal: unknown menu item "${item.menuItemId}" -- validation should have caught this.`);
    }

    const size = menuItem.sizes?.find((option) => option.name === item.size);
    let unitPrice = size?.price ?? menuItem.price ?? 0;

    const crust = menuItem.crusts?.find((option) => option.name === item.crust);
    unitPrice += crust?.price ?? 0;

    for (const toppingName of item.toppings ?? []) {
      const topping = menuItem.toppings?.find((option) => option.name === toppingName);
      unitPrice += topping?.price ?? 0;
    }

    sum += unitPrice * item.quantity;
  }

  return Math.round(sum * 100) / 100;
}
