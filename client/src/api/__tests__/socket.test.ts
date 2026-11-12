import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveToken } from '../session.ts';
import { API_URL } from './fake-server.ts';

// A stand-in for socket.io-client: io() hands back this fake socket, and
// the test checks what socket.ts asked of it. No connection is ever made.
const { fakeSocket, io } = vi.hoisted(() => {
  const fakeSocket = {
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn()
  };
  fakeSocket.disconnect.mockReturnValue(fakeSocket);
  fakeSocket.connect.mockReturnValue(fakeSocket);
  return { fakeSocket, io: vi.fn((..._args: unknown[]) => fakeSocket) };
});
vi.mock('socket.io-client', () => ({ io }));

type SendAuth = (data: { token: string | null }) => void;
type AuthFunction = (send: SendAuth) => void;

// socket.ts keeps its one socket in a module variable, so every test loads
// a fresh copy of it.
const freshSocketModule = async () => {
  vi.resetModules();
  return import('../socket.ts');
};

const onMenuUpdated = () => {};
const onOrderCreated = () => {};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('subscribe', () => {
  it("connects to the server's address the first time a screen subscribes", async () => {
    const { subscribe } = await freshSocketModule();

    subscribe('menu:updated', onMenuUpdated);

    expect(io).toHaveBeenCalledOnce();
    expect(io.mock.calls[0][0]).toBe(API_URL);
  });

  it('uses the same socket for every subscription after that', async () => {
    const { subscribe } = await freshSocketModule();

    subscribe('menu:updated', onMenuUpdated);
    subscribe('order:created', onOrderCreated);

    expect(io).toHaveBeenCalledOnce();
  });

  it('listens for the event with the handler', async () => {
    const { subscribe } = await freshSocketModule();

    subscribe('order:created', onOrderCreated);

    expect(fakeSocket.on).toHaveBeenCalledWith('order:created', onOrderCreated);
  });

  it('gives back a function that stops listening with that handler', async () => {
    const { subscribe } = await freshSocketModule();

    const stop = subscribe('order:created', onOrderCreated);
    expect(fakeSocket.off).not.toHaveBeenCalled();
    stop();

    expect(fakeSocket.off).toHaveBeenCalledWith('order:created', onOrderCreated);
  });

  it('sends the token we have at each (re)connect, not the one from when the socket was made', async () => {
    const { subscribe } = await freshSocketModule();
    subscribe('menu:updated', onMenuUpdated);
    const options = io.mock.calls[0][1] as { auth: AuthFunction };
    expect(typeof options.auth).toBe('function');
    const send = vi.fn();

    saveToken('token-after-login');
    options.auth(send);
    saveToken('token-after-switching-users');
    options.auth(send);

    expect(send).toHaveBeenNthCalledWith(1, { token: 'token-after-login' });
    expect(send).toHaveBeenNthCalledWith(2, { token: 'token-after-switching-users' });
  });
});

describe('reconnectSocket', () => {
  it('does nothing when no screen has subscribed yet', async () => {
    const { reconnectSocket } = await freshSocketModule();

    reconnectSocket();

    expect(io).not.toHaveBeenCalled();
    expect(fakeSocket.disconnect).not.toHaveBeenCalled();
  });

  it('disconnects the socket and connects it again', async () => {
    const { reconnectSocket, subscribe } = await freshSocketModule();
    subscribe('menu:updated', onMenuUpdated);

    reconnectSocket();

    expect(fakeSocket.disconnect).toHaveBeenCalledOnce();
    expect(fakeSocket.connect).toHaveBeenCalledOnce();
    expect(fakeSocket.disconnect.mock.invocationCallOrder[0]).toBeLessThan(
      fakeSocket.connect.mock.invocationCallOrder[0]
    );
  });
});
