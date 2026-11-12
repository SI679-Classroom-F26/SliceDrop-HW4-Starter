// The shapes the client works with. They match the JSON the server sends
// back (the server may send extra fields; the client ignores them).

export type Role = 'customer' | 'staff';

export type User = {
  id: string;
  username: string;
  role: Role;
};

export type Category = 'pizza' | 'appetizer' | 'side' | 'beverage' | 'dessert';

export const CATEGORIES: Category[] = [
  'pizza',
  'appetizer',
  'side',
  'beverage',
  'dessert'
];

// A choice that changes the price: a size, a crust, a topping.
export type PricedOption = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  category: Category;
  description?: string;
  // Flat price, for items that don't come in sizes.
  price?: number;
  // Present only when they apply to the item.
  sizes?: PricedOption[];
  crusts?: PricedOption[];
  sauces?: string[];
  // Toppings a customer can add, each at its price...
  toppings?: PricedOption[];
  // ...and the ones it comes with (names from `toppings`): free to take off.
  includedToppings?: string[];
};

// ---- Orders ----

// What staff can change on a menu item. The id is in the URL, never in
// the body.
export type MenuItemChanges = Partial<Omit<MenuItem, 'id'>>;

export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// One line of an order, as the customer chose it. No prices: the server
// works out what it costs.
export type OrderItem = {
  menuItemId: string;
  quantity: number;
  size?: string;
  crust?: string;
  sauce?: string;
  toppings?: string[]; // extras, each charged
  removedToppings?: string[]; // ones it comes with, left off (free)
};

// What the client sends to place an order. Who's ordering isn't in here:
// the server takes that from the token.
export type NewOrder = {
  customerName: string;
  items: OrderItem[];
};

export type Order = NewOrder & {
  id: string;
  customerId: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  pointsEarned: number;
};
