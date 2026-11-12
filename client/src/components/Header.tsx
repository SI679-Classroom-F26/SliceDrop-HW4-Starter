import type { User } from '../types.ts';

export type View = 'menu' | 'item' | 'login' | 'cart' | 'my-orders' | 'queue' | 'menu-editor';

type Props = {
  user: User | null;
  view: View;
  cartCount: number;
  onNavigate: (view: View) => void;
  onLogout: () => void;
};

export const Header = ({ user, view, cartCount, onNavigate, onLogout }: Props) => {
  // Everyone sees the menu; customers also get their cart and orders,
  // staff the order queue and the menu editor.
  const tabs: { view: View; label: string }[] = [{ view: 'menu', label: 'Menu' }];
  if (user?.role === 'staff') {
    tabs.unshift({ view: 'queue', label: 'Orders' });
    tabs.push({ view: 'menu-editor', label: 'Edit menu' });
  }
  if (user?.role === 'customer') {
    tabs.push(
      { view: 'cart', label: cartCount > 0 ? `Cart (${cartCount})` : 'Cart' },
      { view: 'my-orders', label: 'My orders' }
    );
  }

  return (
    // Staff get a dark bar, so it's clear at a glance which side you're on.
    <header className={user?.role === 'staff' ? 'staff' : undefined}>
      <nav>
        <ul>
          <li>
            <strong className="brand">
              🍕 SliceDrop
              {user?.role === 'staff' && <span className="brand">Staff</span>}
            </strong>
          </li>
          {tabs.map((tab) => (
            <li key={tab.view}>
              <button
                className={tab.view === view ? 'tab active' : 'tab'}
                onClick={() => onNavigate(tab.view)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <ul>
          {user ? (
            <>
              <li>
                {user.role === 'customer' && <small>Hi {user.username}</small>}
              </li>
              <li>
                <button className="ghost" onClick={onLogout}>
                  Log out
                </button>
              </li>
            </>
          ) : (
            view !== 'login' && (
              <li>
                <button onClick={() => onNavigate('login')}>Log in</button>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  );
};
