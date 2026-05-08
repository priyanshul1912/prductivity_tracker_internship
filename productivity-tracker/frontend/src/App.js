import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Login        from './components/auth/Login';
import Register     from './components/auth/Register';
import Sidebar      from './components/layout/Sidebar';
import Dashboard    from './components/dashboard/Dashboard';
import Tasks        from './components/tasks/Tasks';
import Sessions     from './components/sessions/Sessions';
import Activities   from './components/activities/Activities';
import Analytics    from './components/analytics/Analytics';
import BurnoutMonitor from './components/analytics/BurnoutMonitor';
import Notifications from './components/notifications/Notifications';
import Settings     from './components/settings/Settings';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <div className="app-wrap">
      <Sidebar />
      <main className="page-wrap">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      <Route path="/" element={<Protected><SocketProvider><AppLayout><Dashboard /></AppLayout></SocketProvider></Protected>} />
      <Route path="/tasks" element={<Protected><SocketProvider><AppLayout><Tasks /></AppLayout></SocketProvider></Protected>} />
      <Route path="/sessions" element={<Protected><SocketProvider><AppLayout><Sessions /></AppLayout></SocketProvider></Protected>} />
      <Route path="/activities" element={<Protected><SocketProvider><AppLayout><Activities /></AppLayout></SocketProvider></Protected>} />
      <Route path="/analytics" element={<Protected><SocketProvider><AppLayout><Analytics /></AppLayout></SocketProvider></Protected>} />
      <Route path="/burnout" element={<Protected><SocketProvider><AppLayout><BurnoutMonitor /></AppLayout></SocketProvider></Protected>} />
      <Route path="/notifications" element={<Protected><SocketProvider><AppLayout><Notifications /></AppLayout></SocketProvider></Protected>} />
      <Route path="/settings" element={<Protected><SocketProvider><AppLayout><Settings /></AppLayout></SocketProvider></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(19,22,39,.97)',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,.25)',
              borderRadius: 12,
              fontSize: 13,
              backdropFilter: 'blur(12px)'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
