import { beforeEach, describe, expect, it } from 'vitest';
import { createMenuItem, deleteMenuItem, getMenu, getMenuItem, updateMenuItem } from '../menu.ts';
import { saveToken } from '../session.ts';
import { API_URL, fakeServer } from './fake-server.ts';
import type { MenuItem } from '../../types.ts';
import { mockMenu } from './mocks/mock-data.ts';

// The fake server answers with the mock menu. A function still returning
// the mock itself can't pass: every test also checks the request reached
// the fake server.
const menuItem = (id: string): MenuItem => {
  const found = mockMenu.find((item) => item.id === id);
  if (!found) {
    throw new Error(`The mock menu has no "${id}".`);
  }
  return found;
};
const SERVER_SODA = menuItem('soda');
const SERVER_PIZZA = menuItem('hawaiian');
const NEW_DESSERT: MenuItem = { id: 'brownie', name: 'Brownie', category: 'dessert', price: 5.99 };
const STAFF_TOKEN = 'a-staff-token';

describe('getMenu', () => {
  it('asks for the whole menu and gives back what the server sends', async () => {
    const sent = fakeServer({ status: 200, body: [SERVER_SODA, SERVER_PIZZA] });

    const menu = await getMenu();

    expect(sent[0].method).toBe('GET');
    expect(sent[0].url).toBe(`${API_URL}/menu`);
    expect(menu).toEqual([SERVER_SODA, SERVER_PIZZA]);
  });

  it('asks for one category with ?category=', async () => {
    const sent = fakeServer({ status: 200, body: [SERVER_PIZZA] });

    const menu = await getMenu('pizza');

    expect(sent[0].url).toBe(`${API_URL}/menu?category=pizza`);
    expect(menu).toEqual([SERVER_PIZZA]);
  });
});

describe('getMenuItem', () => {
  it('asks for one item by id', async () => {
    const sent = fakeServer({ status: 200, body: SERVER_PIZZA });

    const item = await getMenuItem('hawaiian');

    expect(sent[0].method).toBe('GET');
    expect(sent[0].url).toBe(`${API_URL}/menu/hawaiian`);
    expect(item).toEqual(SERVER_PIZZA);
  });

  it("throws the server's message for an unknown id", async () => {
    const sent = fakeServer({ status: 404, body: { error: 'No menu item with id "nope".' } });

    await expect(getMenuItem('nope')).rejects.toThrow('No menu item with id "nope".');
    expect(sent[0].url).toBe(`${API_URL}/menu/nope`);
  });
});

describe("staff's menu changes", () => {
  beforeEach(() => {
    saveToken(STAFF_TOKEN);
  });

  it('createMenuItem POSTs the whole item, with the token', async () => {
    const sent = fakeServer({ status: 201, body: NEW_DESSERT });

    const created = await createMenuItem(NEW_DESSERT);

    expect(sent[0].method).toBe('POST');
    expect(sent[0].url).toBe(`${API_URL}/menu`);
    expect(sent[0].body).toEqual(NEW_DESSERT);
    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${STAFF_TOKEN}`);
    expect(created).toEqual(NEW_DESSERT);
  });

  it("createMenuItem throws the server's message when the id is taken", async () => {
    const sent = fakeServer({
      status: 409,
      body: { error: 'A menu item with id "brownie" already exists.' }
    });

    await expect(createMenuItem(NEW_DESSERT)).rejects.toThrow('already exists');
    expect(sent).toHaveLength(1);
  });

  it("updateMenuItem PATCHes only the changes, to the item's address", async () => {
    const changes = { description: 'Fizzy.' };
    const sent = fakeServer({ status: 200, body: { ...SERVER_SODA, ...changes } });

    const updated = await updateMenuItem('soda', changes);

    expect(sent[0].method).toBe('PATCH');
    expect(sent[0].url).toBe(`${API_URL}/menu/soda`);
    expect(sent[0].body).toEqual(changes);
    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${STAFF_TOKEN}`);
    expect(updated).toEqual({ ...SERVER_SODA, ...changes });
  });

  it("deleteMenuItem sends a DELETE to the item's address", async () => {
    const sent = fakeServer({ status: 204 });

    await deleteMenuItem('soda');

    expect(sent[0].method).toBe('DELETE');
    expect(sent[0].url).toBe(`${API_URL}/menu/soda`);
    expect(sent[0].headers.get('Authorization')).toBe(`Bearer ${STAFF_TOKEN}`);
  });
});
