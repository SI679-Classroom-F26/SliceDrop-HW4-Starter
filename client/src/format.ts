// Small display helpers. Nothing here talks to the server.

import type { MenuItem, OrderItem } from './types.ts';

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export const money = (amount: number): string => dollars.format(amount);

// "From $11.99" for items with sizes; the flat price otherwise.
export const startingPrice = (item: MenuItem): string => {
  if (item.sizes && item.sizes.length > 0) {
    return `From ${money(Math.min(...item.sizes.map((size) => size.price)))}`;
  }
  return item.price === undefined ? '' : money(item.price);
};

// "+$2.00" for an option that costs extra; nothing for a free one.
export const extra = (price: number): string =>
  price > 0 ? `+${money(price)}` : '';

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

// Option names come from the server in lower case: "small", "deep dish",
// "xl". Short ones are abbreviations ("XL"); the rest just get a capital.
export const optionLabel = (name: string): string =>
  name.length <= 2 ? name.toUpperCase() : capitalize(name);

export const dateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

export const points = (count: number): string =>
  `${count.toLocaleString('en-US')} ${count === 1 ? 'point' : 'points'}`;

// What one cart line should cost, for showing in the cart. The server
// does its own arithmetic when the order is placed, and its total is the
// one that counts.
export const estimateLine = (item: MenuItem, line: OrderItem): number => {
  let unit = item.sizes?.find((size) => size.name === line.size)?.price ?? item.price ?? 0;
  unit += item.crusts?.find((crust) => crust.name === line.crust)?.price ?? 0;
  for (const name of line.toppings ?? []) {
    unit += item.toppings?.find((topping) => topping.name === name)?.price ?? 0;
  }
  return Math.round(unit * line.quantity * 100) / 100;
};

// "Large, deep dish, no ham, + bacon, ranch" -- the choices on one line.
export const describeChoices = (line: OrderItem): string =>
  [
    line.size && optionLabel(line.size),
    line.crust && line.crust,
    ...(line.removedToppings ?? []).map((name) => `no ${name}`),
    ...(line.toppings ?? []).map((name) => `+ ${name}`),
    line.sauce && line.sauce
  ]
    .filter(Boolean)
    .join(', ');

// ["ham", "pineapple", "bacon"] -> "ham, pineapple and bacon"
export const andList = (names: string[]): string =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

// "Veggie Supreme!" -> "veggie-supreme": a new menu item's id, made from
// its name.
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
