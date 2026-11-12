import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createSignedInUser, resetData, signToken, startTestDb, stopTestDb } from "./mongo-helper";
import { connectAs, heardWithin, nextEvent, startTestServer, stopTestServer } from "./socket-helpers";

// End to end, sockets and all: our server running for real, and test
// clients connecting to it the way browsers do -- the client's socket.ts
// does exactly what connectAs does.
let url: string;

beforeAll(async () => {
  await startTestDb();
  url = await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
  await stopTestDb();
});

// Placing an order credits the customer's points, so the customers are
// real users; staff only need a valid token.
let orderingCustomer: { id: string; token: string };
let otherCustomer: { id: string; token: string };
const staffToken = signToken("staff").token;

beforeEach(async () => {
  await resetData();
  orderingCustomer = await createSignedInUser("customer", "ordering-customer");
  otherCustomer = await createSignedInUser("customer", "other-customer");
});

const ONE_SODA = { customerName: "Pickup Name", items: [{ menuItemId: "soda", quantity: 1, size: "20 oz" }] };
const NEW_DESSERT = { id: "brownie", name: "Brownie", category: "dessert", price: 5.99 };
const UNKNOWN_MENU_ITEM_ID = "no-such-item";

// Over HTTP, like the client does.
const placeOrder = () =>
  request(url).post("/orders").set("Authorization", `Bearer ${orderingCustomer.token}`).send(ONE_SODA);

const setStatus = (orderId: string, status: string) =>
  request(url).patch(`/orders/${orderId}/status`).set("Authorization", `Bearer ${staffToken}`).send({ status });

const asStaff = (req: request.Test) => req.set("Authorization", `Bearer ${staffToken}`);

describe("connecting", () => {
  it("lets in a browser where nobody is logged in", async () => {
    const anonymous = await connectAs();
    expect(anonymous.connected).toBe(true);
  });

  it("lets in a browser with a valid token", async () => {
    const customer = await connectAs(orderingCustomer.token);
    expect(customer.connected).toBe(true);
  });

  it("turns away a bad token", async () => {
    await expect(connectAs("not-a-real-token")).rejects.toThrow();
  });
});

describe("order:created", () => {
  it("reaches staff, with the stored order", async () => {
    const staff = await connectAs(staffToken);

    // Start listening *before* placing the order, so we can't miss it.
    const staffHears = nextEvent(staff, "order:created");
    const res = await placeOrder();

    const order = await staffHears;
    expect(order.id).toBe(res.body.id);
    expect(order.total).toBe(res.body.total);
    expect(order.status).toBe("pending");
  });

  it("does not reach customers or browsers where nobody is logged in", async () => {
    const ordering = await connectAs(orderingCustomer.token);
    const other = await connectAs(otherCustomer.token);
    const anonymous = await connectAs();

    const orderingHears = heardWithin(ordering, "order:created");
    const otherHears = heardWithin(other, "order:created");
    const anonymousHears = heardWithin(anonymous, "order:created");
    await placeOrder();

    expect(await orderingHears).toBe(false);
    expect(await otherHears).toBe(false);
    expect(await anonymousHears).toBe(false);
  });

  it("is not sent for an order the server rejects", async () => {
    const staff = await connectAs(staffToken);
    const staffHears = heardWithin(staff, "order:created");

    const res = await request(url)
      .post("/orders")
      .set("Authorization", `Bearer ${orderingCustomer.token}`)
      .send({ customerName: "Pickup Name", items: [] });

    expect(res.status).toBe(400);
    expect(await staffHears).toBe(false);
  });
});

describe("order:updated, when staff change the status", () => {
  it("reaches the customer who placed the order, and staff", async () => {
    const placed = (await placeOrder()).body;
    const ordering = await connectAs(orderingCustomer.token);
    const staff = await connectAs(staffToken);

    const orderingHears = nextEvent(ordering, "order:updated");
    const staffHears = nextEvent(staff, "order:updated");
    await setStatus(placed.id, "in-progress");

    for (const order of [await orderingHears, await staffHears]) {
      expect(order.id).toBe(placed.id);
      expect(order.status).toBe("in-progress");
    }
  });

  it("does not reach another customer", async () => {
    const placed = (await placeOrder()).body;
    const other = await connectAs(otherCustomer.token);

    const otherHears = heardWithin(other, "order:updated");
    await setStatus(placed.id, "in-progress");

    expect(await otherHears).toBe(false);
  });
});

describe("order:updated, when the customer cancels", () => {
  it("reaches staff and the customer, with the cancelled order", async () => {
    const placed = (await placeOrder()).body;
    const ordering = await connectAs(orderingCustomer.token);
    const staff = await connectAs(staffToken);

    const orderingHears = nextEvent(ordering, "order:updated");
    const staffHears = nextEvent(staff, "order:updated");
    await request(url)
      .patch(`/orders/${placed.id}/cancel`)
      .set("Authorization", `Bearer ${orderingCustomer.token}`);

    for (const order of [await orderingHears, await staffHears]) {
      expect(order.id).toBe(placed.id);
      expect(order.status).toBe("cancelled");
    }
  });
});

describe("menu:updated", () => {
  it("reaches a browser where nobody is logged in, when staff add an item", async () => {
    const anonymous = await connectAs();
    const hears = nextEvent(anonymous, "menu:updated");

    await asStaff(request(url).post("/menu")).send(NEW_DESSERT);

    expect(await hears).toEqual({ id: NEW_DESSERT.id });
  });

  it("reaches a browser where nobody is logged in, when staff change an item", async () => {
    const anonymous = await connectAs();
    const hears = nextEvent(anonymous, "menu:updated");

    await asStaff(request(url).patch("/menu/soda")).send({ description: "Fizzy." });

    expect(await hears).toEqual({ id: "soda" });
  });

  it("reaches a browser where nobody is logged in, when staff delete an item", async () => {
    const anonymous = await connectAs();
    const hears = nextEvent(anonymous, "menu:updated");

    await asStaff(request(url).delete("/menu/soda"));

    expect(await hears).toEqual({ id: "soda" });
  });

  it("is not sent when the change is rejected", async () => {
    const anonymous = await connectAs();
    const hears = heardWithin(anonymous, "menu:updated");

    const res = await asStaff(request(url).patch(`/menu/${UNKNOWN_MENU_ITEM_ID}`)).send({ description: "Nope." });

    expect(res.status).toBe(404);
    expect(await hears).toBe(false);
  });
});
