import { useEffect, useState } from 'react';
import { CATEGORIES } from '../types.ts';
import type { Category, MenuItem } from '../types.ts';
import { getMenu } from '../api/menu.ts';
import { subscribe } from '../api/socket.ts';
import { capitalize, startingPrice } from '../format.ts';

type Props = {
  onOpenItem: (id: string) => void;
};

export const MenuList = ({ onOpenItem }: Props) => {
  // undefined means "every category".
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = async () => {
    setLoading(true);
    try {
      setItems(await getMenu(category));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load once, and again whenever the category changes.
  useEffect(() => {
    loadMenu();
  }, [category]);

  // Staff changed the menu somewhere: load it again. (Re-subscribes when
  // the category changes, so the reload uses the current one.)
  useEffect(() => {
    return subscribe('menu:updated', loadMenu);
  }, [category]);

  return (
    <section>
      <h2>Menu</h2>
      <div className="filters" role="toolbar" aria-label="Category">
        <button
          className={category === undefined ? 'chip active' : 'chip'}
          onClick={() => setCategory(undefined)}
        >
          All
        </button>
        {CATEGORIES.map((each) => (
          <button
            key={each}
            className={category === each ? 'chip active' : 'chip'}
            onClick={() => setCategory(each)}
          >
            {capitalize(each)}
          </button>
        ))}
      </div>

      {loading && <p aria-busy="true">Loading the menu…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p>Nothing in this category yet.</p>
      )}

      <div className="menu-grid">
        {items.map((item) => (
          <article key={item.id} className="menu-card">
            <p>
              <small className="category">{item.category}</small>
            </p>
            <h3>{item.name}</h3>
            {item.description && <p>{item.description}</p>}
            <p className="price">{startingPrice(item)}</p>
            <button onClick={() => onOpenItem(item.id)}>View</button>
          </article>
        ))}
      </div>
    </section>
  );
};
