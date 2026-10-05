import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [lockedEvents, setLockedEvents] = useState([]);
  const [hackathonStatus, setHackathonStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Connect to backend socket
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      // connected
    });

    s.on('problem_locked', (data) => {
      setLockedEvents((prev) => [data, ...prev.slice(0, 19)]);
      showToast(`🔒 Problem ${data.problemCode} was just selected & locked by a participant!`, 'info');
    });

    s.on('problem_updated', (data) => {
      showToast(`Problem ${data.problem_code} updated: status is now ${data.status}`, 'info');
    });

    s.on('hackathon_status_updated', (data) => {
      setHackathonStatus(data);
      showToast(`📢 Hackathon Selection status updated: ${data.selection_status}`, 'warning');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  return (
    <SocketContext.Provider value={{
      socket,
      lockedEvents,
      hackathonStatus,
      toastMessage,
      showToast,
      clearToast
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
