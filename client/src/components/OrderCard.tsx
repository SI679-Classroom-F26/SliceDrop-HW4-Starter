import type { ReactNode } from 'react';
import type { Order } from '../types.ts';
import { dateTime, describeChoices, money, points } from '../format.ts';

type Props = {
  order: Order;
  // Menu item names by id: an order only stores each item's id.
  itemNames: Record<string, string>;
  children?: ReactNode;
};

export const OrderCard = ({ order, itemNames, children }: Props) => {
  return (
    <article className="order">
      <header>
        <strong>{order.customerName}</strong>
        <span className={`badge ${order.status}`}>{order.status.replace('-', ' ')}</span>
      </header>
      <ul>
        {order.items.map((line, index) => (
          <li key={index}>
            <span>
              {line.quantity} × {itemNames[line.menuItemId] ?? line.menuItemId}
              {describeChoices(line) && <small> — {describeChoices(line)}</small>}
            </span>
          </li>
        ))}
      </ul>
      <p className="total">
        <small>
          {dateTime(order.createdAt)} · {points(order.pointsEarned)}
        </small>
        <strong>{money(order.total)}</strong>
      </p>
      {children}
    </article>
  );
};
