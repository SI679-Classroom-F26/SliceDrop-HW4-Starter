import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CATEGORIES } from '../types.ts';
import type { Category, MenuItem, MenuItemChanges } from '../types.ts';
import { createMenuItem, deleteMenuItem, getMenu, updateMenuItem } from '../api/menu.ts';
import { subscribe } from '../api/socket.ts';
import { capitalize, money, slugify, startingPrice } from '../format.ts';

export const MenuEditor = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = async () => {
    try {
      setItems(await getMenu());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Another staff member changed the menu: load it again.
  useEffect(() => {
    return subscribe('menu:updated', loadMenu);
  }, []);

  return (
    <section>
      <h2>Edit menu</h2>
      <AddItemForm onAdded={(added) => setItems((current) => [...current, added])} />
      {loading && <p aria-busy="true">Loading menu…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table className="menu-editor">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <EditorRow
                key={item.id}
                item={item}
                onSaved={(saved) =>
                  setItems((current) =>
                    current.map((each) => (each.id === saved.id ? saved : each))
                  )
                }
                onDeleted={() =>
                  setItems((current) => current.filter((each) => each.id !== item.id))
                }
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

// ---- Adding an item: name, category and price; the id comes from the name ----

const AddItemForm = ({ onAdded }: { onAdded: (item: MenuItem) => void }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('pizza');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedName, setAddedName] = useState<string | null>(null);

  const id = slugify(name);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setAddedName(null);
    try {
      const added = await createMenuItem({
        id,
        name: name.trim(),
        category,
        price: Number(price),
        ...(description.trim() && { description: description.trim() })
      });
      onAdded(added);
      setAddedName(added.name);
      setName('');
      setPrice('');
      setDescription('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <details className="add-item">
      <summary>Add a menu item</summary>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
            <small>id: {id || '—'}</small>
          </label>
          <label>
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              {CATEGORIES.map((each) => (
                <option key={each} value={each}>
                  {capitalize(each)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Description <small>(optional)</small>
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <button type="submit" disabled={saving || id === ''} aria-busy={saving}>
          Add item
        </button>
        {error && <p className="error">{error}</p>}
        {addedName && <p className="success">Added to the menu: {addedName}</p>}
      </form>
    </details>
  );
};

// ---- One row: show it, edit its description and price, or delete it ----

type RowProps = {
  item: MenuItem;
  onSaved: (item: MenuItem) => void;
  onDeleted: () => void;
};

const EditorRow = ({ item, onSaved, onDeleted }: RowProps) => {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [description, setDescription] = useState(item.description ?? '');
  const [price, setPrice] = useState(item.price?.toString() ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Items with sizes are priced per size; only a flat price is edited here.
  const hasFlatPrice = item.sizes === undefined;

  const startEditing = () => {
    setDescription(item.description ?? '');
    setPrice(item.price?.toString() ?? '');
    setError(null);
    setEditing(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    // Send only what changed: PATCH is partial.
    const changes: MenuItemChanges = {};
    if (description.trim() !== (item.description ?? '')) {
      changes.description = description.trim();
    }
    if (hasFlatPrice && Number(price) !== item.price) {
      changes.price = Number(price);
    }
    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onSaved(await updateMenuItem(item.id, changes));
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteMenuItem(item.id);
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <tr>
        <td>
          <strong>{item.name}</strong> <small className="category">{item.category}</small>
          {item.description && (
            <div>
              <small>{item.description}</small>
            </div>
          )}
        </td>
        <td>
          {hasFlatPrice && item.price !== undefined ? money(item.price) : startingPrice(item)}
        </td>
        <td>
          <div className="row-actions">
            {confirmingDelete ? (
              <>
                <button className="danger" onClick={handleDelete} disabled={busy} aria-busy={busy}>
                  Delete {item.name}
                </button>
                <button
                  className="ghost"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy}
                >
                  Keep
                </button>
              </>
            ) : (
              <>
                <button className="ghost" onClick={startEditing} disabled={editing}>
                  Edit
                </button>
                <button className="ghost" onClick={() => setConfirmingDelete(true)}>
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {editing && (
        <tr className="editing">
          <td colSpan={3}>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <label>
                  Description
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>
                {hasFlatPrice && (
                  <label>
                    Price
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      required
                    />
                  </label>
                )}
              </div>
              <div className="row-actions">
                <button type="submit" disabled={busy} aria-busy={busy}>
                  Save
                </button>
                <button type="button" className="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
      {error && (
        <tr>
          <td colSpan={3} className="error">
            {error}
          </td>
        </tr>
      )}
    </>
  );
};
