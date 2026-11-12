import { useState } from 'react';
import type { MenuItem, OrderItem, User } from './types.ts';
import { getCurrentUser, logout } from './api/auth.ts';
import { Header } from './components/Header.tsx';
import type { View } from './components/Header.tsx';
import { LoginForm } from './components/LoginForm.tsx';
import { MenuList } from './components/MenuList.tsx';
import { MenuItemDetail } from './components/MenuItemDetail.tsx';
import { Cart } from './components/Cart.tsx';
import type { CartLine } from './components/Cart.tsx';
import { MyOrders } from './components/MyOrders.tsx';
import { OrderQueue } from './components/OrderQueue.tsx';
import { MenuEditor } from './components/MenuEditor.tsx';

// Who's logged in, which screen we're on, which menu item is open, and the
// cart. No router: changing `view` swaps the screen, as in the week 7
// client. The cart lives here so it survives moving between screens.

// Staff start at the order queue; everyone else at the menu.
const homeFor = (user: User | null): View => (user?.role === 'staff' ? 'queue' : 'menu');

export const App = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [view, setView] = useState<View>(homeFor(user));
  const [itemId, setItemId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);

  const openItem = (id: string) => {
    setItemId(id);
    setView('item');
  };

  const handleLogin = (loggedIn: User) => {
    setUser(loggedIn);
    setView(homeFor(loggedIn));
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCart([]);
    setView('menu');
  };

  const addToCart = (item: MenuItem, line: OrderItem) => {
    setCart([...cart, { item, line }]);
  };

  return (
    <>
      <Header
        user={user}
        view={view}
        cartCount={cart.length}
        onNavigate={setView}
        onLogout={handleLogout}
      />
      <main>
        {view === 'login' && (
          <LoginForm onLogin={handleLogin} onCancel={() => setView('menu')} />
        )}
        {view === 'menu' && <MenuList onOpenItem={openItem} />}
        {view === 'item' && itemId && (
          <MenuItemDetail
            id={itemId}
            user={user}
            onBack={() => setView('menu')}
            onAddToCart={addToCart}
            onLoginClick={() => setView('login')}
          />
        )}
        {view === 'cart' && user && (
          <Cart
            user={user}
            lines={cart}
            onRemove={(index) => setCart(cart.filter((_, each) => each !== index))}
            onPlaced={() => setCart([])}
            onViewOrders={() => setView('my-orders')}
          />
        )}
        {view === 'my-orders' && user && <MyOrders user={user} />}
        {view === 'queue' && user?.role === 'staff' && <OrderQueue />}
        {view === 'menu-editor' && user?.role === 'staff' && <MenuEditor />}
      </main>
    </>
  );
};
