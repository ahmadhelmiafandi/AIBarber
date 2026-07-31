/* eslint-disable @typescript-eslint/no-explicit-any */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any> | undefined;
  }
}

export function initEcho(token?: string): Echo<any> | null {
  if (typeof window === 'undefined') return null;

  window.Pusher = Pusher;

  const echoKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'app-key';
  const echoHost = process.env.NEXT_PUBLIC_PUSHER_HOST || 'localhost';
  const echoPort = Number(process.env.NEXT_PUBLIC_PUSHER_PORT || 6001);
  const echoScheme = process.env.NEXT_PUBLIC_PUSHER_SCHEME || 'http';

  try {
    const echo = new Echo({
      broadcaster: 'pusher',
      key: echoKey,
      wsHost: echoHost,
      wsPort: echoPort,
      wssPort: echoPort,
      forceTLS: echoScheme === 'https',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      },
    });

    window.Echo = echo;
    return echo;
  } catch (err) {
    console.warn('Realtime Echo initialization warning:', err);
    return null;
  }
}

export function getEcho(): Echo<any> | null {
  if (typeof window === 'undefined') return null;
  return window.Echo || null;
}

export function disconnectEcho() {
  if (typeof window !== 'undefined' && window.Echo) {
    window.Echo.disconnect();
    window.Echo = undefined;
  }
}
