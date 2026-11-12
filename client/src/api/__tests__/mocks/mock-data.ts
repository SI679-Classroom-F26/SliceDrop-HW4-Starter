// MOCK DATA -- what the server would have, kept in the browser's memory.
//
// Until you connect a function in src/api/ to the server, it reads and
// changes this data instead (see mock-server.ts for the rules it follows).
// When every function makes a real request, nothing in src/api/ imports
// from here any more -- but keep the file: the tests use this data as the
// fake server's replies.
//
// Every name ends in "(mock)", so you can tell at a glance whether a screen
// is showing mock data or your server's.

import type { MenuItem, Order, PricedOption, Role } from '../../../types.ts';

const STANDARD_TOPPINGS: PricedOption[] = [
  { name: "pepperoni", price: 1.25 },
  { name: "italian sausage", price: 1.25 },
  { name: "ham", price: 1.25 },
  { name: "onion", price: 1.25 },
  { name: "mushroom", price: 1.25 },
  { name: "green pepper", price: 1.25 },
  { name: "black olive", price: 1.25 },
  { name: "pineapple", price: 1.25 },
  { name: "bacon", price: 1.25 },
  { name: "banana peppers", price: 1.25 },
  { name: "garlic", price: 1.25 },
  { name: "basil", price: 1.25 },
  { name: "green olives", price: 1.25 },
];

const PREMIUM_TOPPINGS: PricedOption[] = [
  { name: "feta", price: 2.25 },
  { name: "roast chicken", price: 2.25 },
  { name: "plant-based sausage", price: 2.25 },
];

const ALL_TOPPINGS: PricedOption[] = [...STANDARD_TOPPINGS, ...PREMIUM_TOPPINGS];

// Crusts, and they are not all free.
const PIZZA_CRUSTS: PricedOption[] = [
  { name: "round", price: 0 },
  { name: "thin", price: 0 },
  { name: "deep dish", price: 2.0 },
  { name: "gluten free", price: 0 },
];

const DIPPING_SAUCES = ["marinara", "honey mustard", "ranch", "garlic butter"];

export const mockMenu: MenuItem[] = [
  {
    id: "hawaiian",
    name: "Hawaiian (mock)",
    category: "pizza",
    description: "Pineapple and ham.",
    sizes: [
      { name: "small", price: 11.99 },
      { name: "medium", price: 13.99 },
      { name: "large", price: 15.99 },
      { name: "xl", price: 17.99 },
    ],
    crusts: PIZZA_CRUSTS,
    toppings: ALL_TOPPINGS,
    includedToppings: ['ham', 'pineapple'],
  },
  {
    id: "meat-lovers",
    name: "Meat Lovers (mock)",
    category: "pizza",
    description: "Pepperoni, italian sausage, and ham.",
    sizes: [
      { name: "small", price: 11.99 },
      { name: "medium", price: 13.99 },
      { name: "large", price: 15.99 },
      { name: "xl", price: 17.99 },
    ],
    crusts: PIZZA_CRUSTS,
    toppings: ALL_TOPPINGS,
    includedToppings: ['pepperoni', 'italian sausage', 'ham'],
  },
  {
    id: "mediterranean",
    name: "Mediterranean (mock)",
    category: "pizza",
    description: "Feta and banana peppers.",
    sizes: [
      { name: "small", price: 12.99 },
      { name: "medium", price: 14.99 },
      { name: "large", price: 16.99 },
      { name: "xl", price: 18.99 },
    ],
    crusts: PIZZA_CRUSTS,
    toppings: ALL_TOPPINGS,
    includedToppings: ['feta', 'banana peppers'],
  },
  {
    id: "build-your-own",
    name: "Build Your Own (mock)",
    category: "pizza",
    description: "Cheese pizza. Add your own toppings.",
    sizes: [
      { name: "small", price: 9.99 },
      { name: "medium", price: 11.99 },
      { name: "large", price: 13.99 },
      { name: "xl", price: 15.99 },
    ],
    crusts: PIZZA_CRUSTS,
    toppings: ALL_TOPPINGS,
    includedToppings: [],
  },
  {
    id: "bread-nugz",
    name: "Bread Nugz (mock)",
    category: "appetizer",
    description: "Comes with one sauce.",
    sizes: [
      { name: "12 pc", price: 6.99 },
      { name: "24 pc", price: 9.99 },
    ],
    sauces: DIPPING_SAUCES,
  },
  {
    id: "garlic-nugz",
    name: "Garlic Nugz (mock)",
    category: "appetizer",
    description: "Comes with one sauce.",
    sizes: [
      { name: "12 pc", price: 7.99 },
      { name: "24 pc", price: 10.99 },
    ],
    sauces: DIPPING_SAUCES,
  },
  {
    id: "cheezy-nugz",
    name: "Cheezy Nugz (mock)",
    category: "appetizer",
    description: "Comes with one sauce.",
    sizes: [
      { name: "12 pc", price: 8.99 },
      { name: "24 pc", price: 11.99 },
    ],
    sauces: DIPPING_SAUCES,
  },
  {
    id: "dipping-sauce",
    name: "Dipping Sauce (mock)",
    category: "side",
    price: 0.75,
    sauces: DIPPING_SAUCES,
  },
  {
    id: "soda",
    name: "Soda (mock)",
    category: "beverage",
    description: "Coke, Diet Coke, Sprite, Diet Sprite, or Lemonade.",
    sizes: [
      { name: "20 oz", price: 1.99 },
      { name: "2 liter", price: 3.99 },
    ],
  },
  {
    id: "cinnamon-nugz",
    name: "Cinnamon Nugz (mock)",
    category: "dessert",
    description: "With Vanilla Dipz.",
    sizes: [
      { name: "12 pc", price: 7.99 },
      { name: "24 pc", price: 10.99 },
    ],
  },
  {
    id: "chocolate-chip-cookie",
    name: "Chocolate Chip Cookie (mock)",
    category: "dessert",
    price: 4.99,
  },
  {
    id: "oatmeal-raisin-cookie",
    name: "Oatmeal Raisin Cookie (mock)",
    category: "dessert",
    price: 4.99,
  },
  {
    id: "snickerdoodle-cookie",
    name: "Snickerdoodle Cookie (mock)",
    category: "dessert",
    price: 4.99,
  },
];

// ---- Users ----
//
// The mock logins: client and staff match the accounts the server
// seeds. jordan is a second customer, so staff see more than one
// customer's orders. (A real server never keeps passwords, only hashes --
// these exist only in your browser's memory.)

export type MockUser = {
  id: string;
  username: string;
  password: string;
  role: Role;
  loyaltyPoints: number;
};

export const mockUsers: MockUser[] = [
  { id: 'mock-user-client', username: 'client', password: 'client-password', role: 'customer', loyaltyPoints: 300 },
  { id: 'mock-user-jordan', username: 'jordan', password: 'jordan-password', role: 'customer', loyaltyPoints: 1300 },
  { id: 'mock-user-staff', username: 'staff', password: 'staff-password', role: 'staff', loyaltyPoints: 0 }
];

// ---- Orders ----

const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export const mockOrders: Order[] = [
  {
    id: 'mock-order-1',
    customerId: 'mock-user-client',
    customerName: 'Client',
    items: [{ menuItemId: 'soda', quantity: 2, size: '20 oz' }],
    status: 'completed',
    createdAt: minutesAgo(60 * 24),
    total: 3.98,
    pointsEarned: 300
  },
  {
    id: 'mock-order-2',
    customerId: 'mock-user-jordan',
    customerName: 'Jordan',
    items: [{ menuItemId: 'mediterranean', quantity: 1, size: 'medium', crust: 'thin' }],
    status: 'pending',
    createdAt: minutesAgo(5),
    total: 14.99,
    pointsEarned: 1400
  }
];
