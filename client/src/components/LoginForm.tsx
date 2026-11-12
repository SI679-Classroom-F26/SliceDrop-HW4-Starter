import { useState } from 'react';
import type { FormEvent } from 'react';
import type { User } from '../types.ts';
import { login, register } from '../api/auth.ts';

type Props = {
  onLogin: (user: User) => void;
  onCancel: () => void;
};

// Log in, or sign up as a new customer -- one form, two modes.
export const LoginForm = ({ onLogin, onCancel }: Props) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await login(username, password)
          : await register(username, password);
      onLogin(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <article className="login">
      <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
      {mode === 'login' && (
        <p className="logins">
          <small>
            Customer: <code>client</code> / <code>client-password</code>
            <br />
            Staff: <code>staff</code> / <code>staff-password</code>
          </small>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" aria-busy={busy} disabled={busy}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
      <p>
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <button className="link" onClick={switchMode}>
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
        {' · '}
        <button className="link" onClick={onCancel}>
          Back to the menu
        </button>
      </p>
    </article>
  );
};
