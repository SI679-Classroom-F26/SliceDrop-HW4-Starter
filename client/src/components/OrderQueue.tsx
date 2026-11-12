import { useEffect, useState } from 'react';
import type { Order, OrderStatus } from '../types.ts';
import { getOrders, updateOrderStatus } from '../api/orders.ts';
import { getMenu } from '../api/menu.ts';
import { subscribe } from '../api/socket.ts';
import { OrderCard } from './OrderCard.tsx';

// The one step forward from each status staff work on.
const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: 'in-progress', label: 'Start' },
  'in-progress': { status: 'completed', label: 'Mark completed' }
};

const oldestFirst = (a: Order, b: Order) => a.createdAt.localeCompare(b.createdAt);
const newestFirst = (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt);

export const OrderQueue = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const [loadedOrders, menu] = await Promise.all([getOrders(), getMenu()]);
      setOrders(loadedOrders);
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

  // New orders, and orders that changed (another staff member moved one
  // along, or a customer cancelled): load the queue again.
  useEffect(() => {
    const stopCreated = subscribe('order:created', loadOrders);
    const stopUpdated = subscribe('order:updated', loadOrders);
    return () => {
      stopCreated();
      stopUpdated();
    };
  }, []);

  const moveForward = async (order: Order) => {
    const next = NEXT_STEP[order.status];
    if (!next) {
      return;
    }
    setUpdateError(null);
    try {
      const updated = await updateOrderStatus(order.id, next.status);
      setOrders((current) => current.map((each) => (each.id === updated.id ? updated : each)));
    } catch (err) {
      setUpdateError((err as Error).message);
    }
  };

  // Work in the order it came in; finished orders newest first.
  const columns = [
    {
      title: 'Pending',
      orders: orders.filter((order) => order.status === 'pending').sort(oldestFirst)
    },
    {
      title: 'In progress',
      orders: orders.filter((order) => order.status === 'in-progress').sort(oldestFirst)
    },
    {
      title: 'Finished',
      orders: orders
        .filter((order) => order.status === 'completed' || order.status === 'cancelled')
        .sort(newestFirst)
    }
  ];

  return (
    <section>
      <h2>Orders</h2>
      {loading && <p aria-busy="true">Loading orders…</p>}
      {error && <p className="error">{error}</p>}
      {updateError && <p className="error">{updateError}</p>}
      {!error && (
        <div className="queue">
          {columns.map((column) => (
            <div key={column.title}>
              <h3>
                {column.title} <small>({column.orders.length})</small>
              </h3>
              {column.orders.length === 0 && <p className="empty">None right now.</p>}
              {column.orders.map((order) => {
                const next = NEXT_STEP[order.status];
                return (
                  <OrderCard key={order.id} order={order} itemNames={itemNames}>
                    {next && <button onClick={() => moveForward(order)}>{next.label}</button>}
                  </OrderCard>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
