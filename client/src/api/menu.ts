// The menu: anyone can browse it, logged in or not; only staff change it.

import type { Category, MenuItem, MenuItemChanges } from '../types.ts';
// The mocks stand in for the server until each TODO below is done.
import { mockMenu } from './__tests__/mocks/mock-data.ts';
import { delay, mockServerValidation, mockStaffCaller } from './__tests__/mocks/mock-server.ts';

// TODO: getMenu -- replace the mock with a request: GET /menu -- or
// GET /menu?category=<category> when a category is given -- through apiFetch.
export const getMenu = async (category?: Category): Promise<MenuItem[]> => {
  await delay();
  const items = category
    ? mockMenu.filter((item) => item.category === category)
    : mockMenu;
  return structuredClone(items);
};

// TODO: getMenuItem -- replace the mock with a request: GET /menu/:id
// through apiFetch. An unknown id is the server's 404, which apiFetch turns
// into a thrown Error.
export const getMenuItem = async (id: string): Promise<MenuItem> => {
  await delay();
  const item = mockMenu.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`No menu item with id "${id}".`);
  }
  return structuredClone(item);
};

// TODO: createMenuItem -- replace the mock with a request: POST /menu
// (staff), with the whole item as the body, id included. Answers 201 with
// the item; a 409 when the id is already taken.
export const createMenuItem = async (item: MenuItem): Promise<MenuItem> => {
  await delay();
  mockStaffCaller();
  const problems = mockServerValidation(item);
  if (problems) {
    throw new Error(problems);
  }
  if (mockMenu.some((candidate) => candidate.id === item.id)) {
    throw new Error(`A menu item with id "${item.id}" already exists.`);
  }
  mockMenu.push(structuredClone(item));
  return structuredClone(item);
};

// TODO: updateMenuItem -- replace the mock with a request: PATCH /menu/:id
// (staff), with the item's id in the path and ONLY the fields that change
// as the body. Answers with the whole updated item.
export const updateMenuItem = async (id: string, changes: MenuItemChanges): Promise<MenuItem> => {
  await delay();
  mockStaffCaller();
  const problems = mockServerValidation(changes);
  if (problems) {
    throw new Error(problems);
  }
  const item = mockMenu.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`No menu item with id "${id}".`);
  }
  Object.assign(item, structuredClone(changes));
  return structuredClone(item);
};

// TODO: deleteMenuItem -- replace the mock with a request: DELETE /menu/:id
// (staff). The server answers 204 No Content: there's nothing to return.
export const deleteMenuItem = async (id: string): Promise<void> => {
  await delay();
  mockStaffCaller();
  const index = mockMenu.findIndex((candidate) => candidate.id === id);
  if (index === -1) {
    throw new Error(`No menu item with id "${id}".`);
  }
  mockMenu.splice(index, 1);
};
