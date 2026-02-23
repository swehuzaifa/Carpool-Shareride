import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { supabase } from './supabase';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

let socketInstance = null;

export function useSocket() {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const connect = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token || cancelled) return;

            // Reuse existing connection
            if (socketInstance?.connected) {
                socketRef.current = socketInstance;
                setConnected(true);
                return;
            }

            const socket = io(SOCKET_URL, {
                auth: { token: session.access_token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 5,
            });

            socket.on('connect', () => {
                if (!cancelled) {
                    setConnected(true);
                    console.log('🔌 Socket connected');
                }
            });

            socket.on('disconnect', () => {
                if (!cancelled) {
                    setConnected(false);
                    console.log('🔌 Socket disconnected');
                }
            });

            socketInstance = socket;
            socketRef.current = socket;
        };

        connect();

        return () => {
            cancelled = true;
        };
    }, []);

    const joinRide = (rideId) => socketRef.current?.emit('join:ride', rideId);
    const leaveRide = (rideId) => socketRef.current?.emit('leave:ride', rideId);

    const on = (event, callback) => {
        socketRef.current?.on(event, callback);
        return () => socketRef.current?.off(event, callback);
    };

    return {
        socket: socketRef.current,
        connected,
        joinRide,
        leaveRide,
        on,
    };
}

export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}
