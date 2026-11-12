// Everything the server tells browsers, in one place: which event, and who
// hears it. The rest of the app calls these functions and never touches
// socket.io itself.
//
// The rule: notify right after a change is saved, from the layer that saved
// it -- and only when it was (a rejected request changed nothing, so no one
// hears about it). getIo() is null when there's no socket server (most
// tests): write getIo()?. so each of these does nothing then.
//
// Each TODO below has two parts: write the function, then call it. There is
// no TODO where the call goes -- finding the spot where the change is saved
// is part of the task.
// src/__tests__/sockets.e2e.test.ts checks both: events, rooms, and that
// each one is sent when it should be (and only then).
import type { Order } from "../models/order";
import { getIo } from "./sockets";

// TODO: orderCreated -- a new order: tell every staff member.
//   1. Write it: event "order:created", with the order.
//   2. Call it: in placeOrder (services/orders-service.ts), right after the
//      new order is saved.
export function orderCreated(order: Order): void {
  throw new Error("TODO: orderCreated is not written yet.");
}

// TODO: orderUpdated -- an order's status changed: tell the customer it
// belongs to AND staff.
//   1. Write it: event "order:updated", with the order.
//   2. Call it in BOTH places an order's status is saved:
//      - patchOrderStatus (controllers/orders-controller.ts): staff move it
//        along
//      - cancelOrder (services/orders-service.ts): the customer cancels
export function orderUpdated(order: Order): void {
  throw new Error("TODO: orderUpdated is not written yet.");
}

// TODO: menuUpdated -- a menu item was added, changed or deleted: tell
// everyone, logged in or not.
//   1. Write it: event "menu:updated", with { id } of the item.
//   2. Call it in all THREE places the menu is saved, in
//      controllers/menu-controller.ts: postMenuItem, patchMenuItem,
//      deleteMenuItem.
export function menuUpdated(id: string): void {
  throw new Error("TODO: menuUpdated is not written yet.");
}
