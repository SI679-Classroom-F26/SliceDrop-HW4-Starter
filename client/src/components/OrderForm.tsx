import { useState } from 'react';
import type { FormEvent } from 'react';
import type { MenuItem, OrderItem } from '../types.ts';
import { estimateLine, extra, money, optionLabel } from '../format.ts';

type Props = {
  item: MenuItem;
  onAdd: (line: OrderItem) => void;
};

// The choices a customer makes before adding an item to the cart. Only the
// options this item actually has are shown.
export const OrderForm = ({ item, onAdd }: Props) => {
  const [size, setSize] = useState(item.sizes?.[0]?.name);
  const [crust, setCrust] = useState(item.crusts?.[0]?.name);
  const [sauce, setSauce] = useState(item.sauces?.[0]);
  // Toppings it comes with start checked: unchecking one leaves it off,
  // for free. Every other topping is an extra, charged when checked.
  const included = item.includedToppings ?? [];
  const [removedToppings, setRemovedToppings] = useState<string[]>([]);
  const [toppings, setToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const line: OrderItem = {
    menuItemId: item.id,
    quantity,
    ...(size && { size }),
    ...(crust && { crust }),
    ...(sauce && { sauce }),
    ...(toppings.length > 0 && { toppings }),
    ...(removedToppings.length > 0 && { removedToppings })
  };

  const toggle = (list: string[], name: string) =>
    list.includes(name) ? list.filter((each) => each !== name) : [...list, name];

  const isOn = (name: string) =>
    included.includes(name) ? !removedToppings.includes(name) : toppings.includes(name);

  const toggleTopping = (name: string) => {
    if (included.includes(name)) {
      setRemovedToppings(toggle(removedToppings, name));
    } else {
      setToppings(toggle(toppings, name));
    }
  };

  // The ones it comes with first, then the extras.
  const toppingOptions = [...(item.toppings ?? [])].sort(
    (a, b) => Number(included.includes(b.name)) - Number(included.includes(a.name))
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onAdd(line);
    setAdded(true);
  };

  return (
    <form onSubmit={handleSubmit} className="order-form" onChange={() => setAdded(false)}>
      {item.sizes && (
        <label>
          Size
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            {item.sizes.map((option) => (
              <option key={option.name} value={option.name}>
                {optionLabel(option.name)} — {money(option.price)}
              </option>
            ))}
          </select>
        </label>
      )}
      {item.crusts && (
        <label>
          Crust
          <select value={crust} onChange={(event) => setCrust(event.target.value)}>
            {item.crusts.map((option) => (
              <option key={option.name} value={option.name}>
                {optionLabel(option.name)} {extra(option.price)}
              </option>
            ))}
          </select>
        </label>
      )}
      {item.sauces && (
        <label>
          Sauce
          <select value={sauce} onChange={(event) => setSauce(event.target.value)}>
            {item.sauces.map((name) => (
              <option key={name} value={name}>
                {optionLabel(name)}
              </option>
            ))}
          </select>
        </label>
      )}
      {item.toppings && (
        <fieldset>
          <legend>Toppings</legend>
          <div className="topping-grid">
            {toppingOptions.map((option) => (
              <label key={option.name}>
                <input
                  type="checkbox"
                  checked={isOn(option.name)}
                  onChange={() => toggleTopping(option.name)}
                />
                {optionLabel(option.name)}{' '}
                <span className="extra">
                  {included.includes(option.name) ? 'included' : extra(option.price)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <label>
        Quantity
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
        />
      </label>
      <button type="submit">Add to cart — {money(estimateLine(item, line))}</button>
      {added && <p className="success">Added to your cart.</p>}
    </form>
  );
};
