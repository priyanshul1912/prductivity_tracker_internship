import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  break_reminder: '⏰', burnout_alert: '🔥', goal_achieved: '🏆',
  productivity_tip: '💡', daily_digest: '📊', wellness_check: '❤️',
  streak_milestone: '🔥', task_due: '📌', focus_suggestion: '🎯'
};
const PRIORITY_BADGE = { low: 'badge-neutral', medium: 'badge-info', high: 'badge-warning', critical: 'badge-critical' };

export default function Notifications() {
  const { clearUnread } = useSocket();
  const [data,  setData]  = useState({ notifications: [], unreadCount: 0 });
  const [busy,  setBusy]  = useState(true);
  const [filter, setFilter] = useState('all');  // all | unread

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await api.get('/notifications', { params: { limit: 50, ...(filter === 'unread' ? { unread: true } : {}) } });
      setData(r.data);
    } catch { toast.error('Failed to load notifications'); }
    finally  { setBusy(false); }
  }, [filter]);

  useEffect(() => { load(); clearUnread(); }, [load, clearUnread]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setData(d => ({
      ...d,
      notifications: d.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, d.unreadCount - 1)
    }));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setData(d => ({ ...d, notifications: d.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 }));
    clearUnread();
    toast.success('All marked as read');
  };

  const del = async (id) => {
    await api.delete(`/notifications/${id}`);
    setData(d => ({ ...d, notifications: d.notifications.filter(n => n._id !== id) }));
  };

  const testNotif = async () => {
    try {
      await api.post('/notifications', {
        type: 'productivity_tip', title: '💡 Test Notification',
        message: 'This is a live test notification via Socket.io!', priority: 'medium'
      });
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="fade-in">
      <div className="flex-between page-hdr flex-wrap gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{data.unreadCount} unread</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-ghost btn-sm" onClick={testNotif}>🔔 Test</button>
          {data.unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>✓ Mark all read</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        {['all', 'unread'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${data.notifications.length})` : `Unread (${data.unreadCount})`}
          </button>
        ))}
      </div>

      {busy ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
      ) : data.notifications.length === 0 ? (
        <div className="card empty"><div className="empty-icon">🔔</div><div className="empty-title">No notifications</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.notifications.map(n => (
            <div key={n._id} className={`card ${!n.isRead ? 'card-grad' : ''}`} style={{ padding: '14px 18px', transition: 'opacity .2s' }}>
              <div className="flex-between gap-3">
                <div className="flex gap-3 items-center" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="flex gap-2 items-center flex-wrap" style={{ marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span>
                      <span className={`badge ${PRIORITY_BADGE[n.priority] || 'badge-neutral'}`}>{n.priority}</span>
                      {!n.isRead && <span className="badge badge-primary">New</span>}
                    </div>
                    <p className="text-small text-muted">{n.message}</p>
                    <span className="text-xs text-muted">{formatDate(n.createdAt)} {formatTime(n.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center" style={{ flexShrink: 0 }}>
                  {!n.isRead && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n._id)}>✓</button>}
                  <button className="btn btn-danger btn-sm" onClick={() => del(n._id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
