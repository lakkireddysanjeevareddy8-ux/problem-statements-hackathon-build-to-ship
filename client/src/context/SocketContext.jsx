import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lockedEvents, setLockedEvents] = useState([]);
  const [hackathonStatus, setHackathonStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  // Set of callbacks subscribed to real-time problem changes (Section 4 & 6)
  const problemSubscribersRef = useRef(new Set());

  const showToast = useCallback((message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  const clearToast = useCallback(() => setToastMessage(null), []);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    s.on('connect', () => {
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('reconnect', () => {
      setConnected(true);
      setReconnectCount((c) => c + 1);
    });

    const notifySubscribers = (eventName, data) => {
      problemSubscribersRef.current.forEach((callback) => {
        try {
          callback(eventName, data);
        } catch (err) {
          console.error('Problem subscriber callback error:', err);
        }
      });
    };

    // When a problem is locked / assigned
    s.on('problem_locked', (data) => {
      setLockedEvents((prev) => [data, ...prev.slice(0, 19)]);
      notifySubscribers('problem_locked', data);
      showToast(`🔒 Problem ${data?.problemCode || ''} was just locked by a participant!`, 'info');
    });

    s.on('problem_assigned', (data) => {
      notifySubscribers('problem_assigned', data);
    });

    // When an assignment is reset / problem becomes available again
    s.on('problem_unlocked', (data) => {
      notifySubscribers('problem_unlocked', data);
      showToast(`🔓 Problem ${data?.problemCode || ''} is now available for selection!`, 'success');
    });

    s.on('problem_updated', (data) => {
      notifySubscribers('problem_updated', data);
    });

    s.on('hackathon_status_updated', (data) => {
      setHackathonStatus(data);
      showToast(`📢 Hackathon Selection status updated: ${data.selection_status}`, 'warning');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [showToast]);

  // Clean subscription method with automatic cleanup to prevent duplicate listeners (Section 6)
  const subscribeToProblems = useCallback((callback) => {
    problemSubscribersRef.current.add(callback);
    return () => {
      problemSubscribersRef.current.delete(callback);
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      reconnectCount,
      lockedEvents,
      hackathonStatus,
      toastMessage,
      showToast,
      clearToast,
      subscribeToProblems
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
