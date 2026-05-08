import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getInitials } from '../../utils/helpers';

const NAV = [
  { to: '/',            icon: '🏠', label: 'Dashboard' },
  { to: '/tasks',       icon: '✅', label: 'Tasks' },
  { to: '/sessions',    icon: '⏱️', label: 'Work Sessions' },
  { to: '/activities',  icon: '📱', label: 'Activities' },
  { to: '/analytics',   icon: '📊', label: 'Analytics' },
  { to: '/burnout',     icon: '🔥', label: 'Burnout Monitor' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/settings',    icon: '⚙️', label: 'Settings' }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount }  = useSocket();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span style={{ fontSize: 26 }}>⚡</span>
        <span className="sidebar-logo-text text-grad">ProTrack</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section">Main</div>
        {NAV.slice(0, 5).map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span>{n.label}</span>
            {n.to === '/notifications' && unreadCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '1px 7px' }}>{unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section" style={{ marginTop: 8 }}>Insights</div>
        {NAV.slice(5).map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span>{n.label}</span>
            {n.to === '/notifications' && unreadCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '1px 7px' }}>{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div className="user-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 16, padding: '2px 4px' }} title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  );
}
