import { useEffect, useState } from 'react';
import type { MenuItem, OrderItem, PricedOption, User } from '../types.ts';
import { getMenuItem } from '../api/menu.ts';
import { subscribe } from '../api/socket.ts';
import { andList, capitalize, extra, money, optionLabel, startingPrice } from '../format.ts';
import { OrderForm } from './OrderForm.tsx';

type Props = {
  id: string;
  user: User | null;
  onBack: () => void;
  onAddToCart: (item: MenuItem, line: OrderItem) => void;
  onLoginClick: () => void;
};

// One labelled list of options, with what each costs.
const Options = ({ title, options }: { title: string; options: PricedOption[] }) => (
  <>
    <h4>{title}</h4>
    <ul className="options">
      {options.map((option) => (
        <li key={option.name}>
          <span>{optionLabel(option.name)}</span>
          <small>{title === 'Sizes' ? money(option.price) : extra(option.price)}</small>
        </li>
      ))}
    </ul>
  </>
);

export const MenuItemDetail = ({ id, user, onBack, onAddToCart, onLoginClick }: Props) => {
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItem = async () => {
    setLoading(true);
    try {
      setItem(await getMenuItem(id));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  // Staff changed THIS item (or deleted it): load it again.
  useEffect(() => {
    return subscribe('menu:updated', (changed: { id: string }) => {
      if (changed.id === id) {
        loadItem();
      }
    });
  }, [id]);

  return (
    <section className="narrow">
      <p>
        <button className="link" onClick={onBack}>
          ← Back to the menu
        </button>
      </p>

      {loading && <p aria-busy="true">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {item && !loading && (
        <article>
          <p>
            <small className="category">{item.category}</small>
          </p>
          <h2>{item.name}</h2>
          {item.description && <p>{item.description}</p>}
          {item.includedToppings && item.includedToppings.length > 0 && (
            <p>
              <small>Comes with {andList(item.includedToppings)}.</small>
            </p>
          )}
          <p className="price">{startingPrice(item)}</p>

          {item.sizes && <Options title="Sizes" options={item.sizes} />}
          {item.crusts && <Options title="Crusts" options={item.crusts} />}
          {item.sauces && (
            <>
              <h4>Sauces</h4>
              <p>{item.sauces.map(capitalize).join(', ')}</p>
            </>
          )}

          {/* Ordering needs a customer: the server only lets customers
              place orders. */}
          <footer>
            {user?.role === 'customer' && (
              <OrderForm item={item} onAdd={(line) => onAddToCart(item, line)} />
            )}
            {!user && (
              <p>
                <button className="link" onClick={onLoginClick}>
                  Log in
                </button>{' '}
                to order.
              </p>
            )}
          </footer>
        </article>
      )}
    </section>
  );
};
