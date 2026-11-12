// The menu item model: the shapes the whole app agrees on for menu data.
//
// Crusts carry a price (Deep Dish is +$2.00) -- the same { name, price }
// shape a topping has. A pizza's includedToppings are the ones it comes
// with: Hawaiian comes with ham and pineapple, and bacon is an extra.

export type Category = "pizza" | "appetizer" | "side" | "beverage" | "dessert";

export interface SizeOption {
  name: string;
  price: number;
}

export interface ToppingOption {
  name: string;
  price: number;
}

export interface CrustOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description?: string;
  /** Flat price, for items that do not come in sizes. */
  price?: number;
  /** The option lists below are present only when they apply to the item. */
  sizes?: SizeOption[];
  crusts?: CrustOption[];
  sauces?: string[];
  /** Toppings a customer can add, each at its price. */
  toppings?: ToppingOption[];
  /** GIVEN (new in HW4): the toppings this item comes with -- names from
   * `toppings`. A customer can take any of them off (no change in price)
   * but can't add one as an extra: it's already on. */
  includedToppings?: string[];
}

