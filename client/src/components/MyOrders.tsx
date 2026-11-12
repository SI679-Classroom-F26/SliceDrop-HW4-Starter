import { useEffect, useState } from 'react';
import type { Order, User } from '../types.ts';
import { cancelOrder, getOrders } from '../api/orders.ts';
import { getMenu } from '../api/menu.ts';
import { getPoints } from '../api/users.ts';
import { subscribe } from '../api/socket.ts';
import { points } from '../format.ts';
import { OrderCard } from './OrderCard.tsx';

type Props = {
  user: User;
};

export const MyOrders = ({ user }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Orders and points change together (placing earns, cancelling takes
  // back), so they load together.
  const loadOrders = async () => {
    try {
      const [loadedOrders, loadedPoints, menu] = await Promise.all([
        getOrders(),
        getPoints(user.id),
        getMenu()
      ]);
      setOrders(loadedOrders);
      setBalance(loadedPoints);
      setItemNames(Object.fromEntries(menu.map((item) => [item.id, item.name])));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Staff moved one of my orders along: load my orders (and points) again.
  useEffect(() => {
    return subscribe('order:updated', loadOrders);
  }, []);

  const handleCancel = async (id: string) => {
    setCancelError(null);
    try {
      await cancelOrder(id);
      await loadOrders();
    } catch (err) {
      setCancelError((err as Error).message);
    }
  };

  // Newest first.
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="narrow">
      <h2>My orders</h2>
      {balance !== null && (
        <article className="points">
          <span>Loyalty points</span>
          <strong>{points(balance)}</strong>
        </article>
      )}
      {loading && <p aria-busy="true">Loading orders…</p>}
      {error && <p className="error">{error}</p>}
      {cancelError && <p className="error">{cancelError}</p>}
      {!loading && !error && orders.length === 0 && <p>You haven't placed any orders yet.</p>}
      {sorted.map((order) => (
        <OrderCard key={order.id} order={order} itemNames={itemNames}>
          {order.status === 'pending' && (
            <button className="ghost" onClick={() => handleCancel(order.id)}>
              Cancel order
            </button>
          )}
        </OrderCard>
      ))}
    </section>
  );
};
