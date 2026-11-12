import { useState } from 'react';
import type { MenuItem, Order, OrderItem, User } from '../types.ts';
import { placeOrder } from '../api/orders.ts';
import { describeChoices, estimateLine, money, points } from '../format.ts';

// One line in the cart: the menu item (for its name and prices) and the
// choices that will be sent to the server.
export type CartLine = {
  item: MenuItem;
  line: OrderItem;
};

type Props = {
  user: User;
  lines: CartLine[];
  onRemove: (index: number) => void;
  onPlaced: () => void;
  onViewOrders: () => void;
};

export const Cart = ({ user, lines, onRemove, onPlaced, onViewOrders }: Props) => {
  const [customerName, setCustomerName] = useState(user.username);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);

  const estimate = lines.reduce((sum, each) => sum + estimateLine(each.item, each.line), 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError(null);
    try {
      const order = await placeOrder({
        customerName,
        items: lines.map((each) => each.line)
      });
      setPlaced(order);
      onPlaced();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <article className="narrow">
        <h2>Order placed</h2>
        <p className="success">
          {money(placed.total)} — you earned {points(placed.pointsEarned)}.
        </p>
        <button onClick={onViewOrders}>See my orders</button>
      </article>
    );
  }

  return (
    <article className="narrow cart">
      <h2>Your cart</h2>
      {lines.length === 0 ? (
        <p>Your cart is empty. Add something from the menu.</p>
      ) : (
        <>
          <ul>
            {lines.map((each, index) => (
              <li key={index}>
                <div>
                  <strong>
                    {each.line.quantity} × {each.item.name}
                  </strong>
                  <br />
                  <small>{describeChoices(each.line)}</small>
                </div>
                <span>{money(estimateLine(each.item, each.line))}</span>
                <button className="ghost" onClick={() => onRemove(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="total">
            <span>Estimated total</span>
            <strong>{money(estimate)}</strong>
          </p>
          <label>
            Name for pickup
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button onClick={handlePlaceOrder} aria-busy={placing} disabled={placing}>
            Place order
          </button>
        </>
      )}
    </article>
  );
};
