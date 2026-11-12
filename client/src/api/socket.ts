// Live updates from the server, over a WebSocket, using socket.io -- the
// week 8 lecture's. The screens already call subscribe (look for it in
// components/), and login() and logout() call reconnectSocket, so once
// these two work every screen updates by itself.
//
// Until then they do nothing: no live updates, and a screen shows changes
// the next time it loads.

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getToken } from './session.ts';

const API_URL = import.meta.env.VITE_API_URL;

// One socket for the whole app, made the first time a screen subscribes.
let socket: Socket | null = null;

// TODO: subscribe -- start listening for `event`, call `handler` each time
// it arrives, and return a function that stops listening (socket.on /
// socket.off). Screens call this inside useEffect and return what it gives
// back, so React stops listening when the screen goes away.
// There's one socket for the whole app: the first call makes it, with
// io(API_URL, { auth: ... }), and every call after uses the same one (a
// small getSocket helper keeps that tidy). The server reads the token from
// the handshake's auth: give auth a FUNCTION, (send) => send({ token:
// getToken() }), not a value -- socket.io calls it on every (re)connect,
// so it always sends the token we have NOW.
export const subscribe = (event: string, handler: (data: any) => void): (() => void) => {
  return () => {};
};

// TODO: reconnectSocket -- disconnect and connect again, so the server
// hears the token we have now (login just saved one; logout just cleared
// it) and puts this browser in the right rooms. No socket yet? Nothing to
// do: the first subscribe makes it with the current token.
export const reconnectSocket = (): void => {};
