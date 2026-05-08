import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      socketRef.current.emit('join', user._id);

      socketRef.current.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        const icons = {
          break_reminder: '⏰',
          burnout_alert: '🔥',
          goal_achieved: '🏆',
          productivity_tip: '💡',
          daily_digest: '📊',
          wellness_check: '❤️',
          streak_milestone: '🔥'
        };

        toast.custom((t) => (
          <div className={`notification-toast ${notification.priority === 'critical' ? 'critical' : ''}`}
               style={{
                 background: notification.priority === 'critical' ? 'rgba(220,38,38,0.9)' : 'rgba(30,42,59,0.95)',
                 border: `1px solid ${notification.priority === 'critical' ? 'rgba(220,38,38,0.5)' : 'rgba(99,102,241,0.3)'}`,
                 borderRadius: '12px', padding: '14px 18px',
                 display: 'flex', gap: '12px', alignItems: 'flex-start',
                 maxWidth: '360px', backdropFilter: 'blur(10px)',
                 boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                 color: '#f1f5f9', fontSize: '14px',
                 opacity: t.visible ? 1 : 0, transition: 'opacity 0.3s'
               }}>
            <span style={{ fontSize: '20px' }}>{icons[notification.type] || '🔔'}</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>{notification.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{notification.message}</div>
            </div>
          </div>
        ), { duration: notification.priority === 'critical' ? 8000 : 5000 });
      });

      socketRef.current.on('task_updated', (task) => {
        if (task.status === 'completed') {
          toast.success(`Task completed: ${task.title}`, { icon: '✅' });
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAllRead = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, unreadCount, addNotification, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
