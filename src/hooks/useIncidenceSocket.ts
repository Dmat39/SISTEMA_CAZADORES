import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Strip "/api/v1" to get the raw socket server URL
const SOCKET_URL =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace('/api/v1', '') ??
  'http://localhost:3003';

/**
 * Connects to the Socket.IO server and calls `onUpdate` whenever
 * an incidence is updated or an assignment changes.
 * The connection is kept alive for the component's lifetime.
 */
export function useIncidenceSocket(onUpdate: () => void): void {
  // Keep a stable ref to avoid reconnecting when the callback identity changes
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('incidence:updated', () => callbackRef.current());
    socket.on('assignment:changed', () => callbackRef.current());

    return () => {
      socket.disconnect();
    };
  }, []);
}
