import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketCtx = createContext(null);

const TYPE_ICONS = {
  break_reminder:   '⏰',
  burnout_alert:    '🔥',
  goal_achieved:    '🏆',
  productivity_tip: '💡',
  daily_digest:     '📊',
  wellness_check:   '❤️',
  streak_milestone: '🔥',
  task_due:         '📌'
};

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(
      process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
      { transports: ['websocket', 'polling'] }
    );
    socketRef.current = socket;

    socket.emit('join', user._id);

    socket.on('new_notification', (n) => {
      setUnreadCount(c => c + 1);
      const icon = TYPE_ICONS[n.type] || '🔔';
      const isCrit = n.priority === 'critical';

      toast.custom(() => (
        <div className={`notif-toast${isCrit ? ' crit' : ''}`}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{n.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{n.message}</div>
          </div>
        </div>
      ), { duration: isCrit ? 9000 : 5000, position: 'top-right' });
    });

    socket.on('task_updated', (t) => {
      if (t.status === 'completed') toast.success(`✅ Task completed: ${t.title}`);
    });

    return () => socket.disconnect();
  }, [user]);

  const clearUnread = () => setUnreadCount(0);

  return (
    <SocketCtx.Provider value={{ socket: socketRef.current, unreadCount, clearUnread }}>
      {children}
    </SocketCtx.Provider>
  );
}

export const useSocket = () => useContext(SocketCtx);
