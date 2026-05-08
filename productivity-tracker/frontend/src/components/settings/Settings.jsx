import React, { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [settings, setSettings] = useState({
    workStartTime:   user?.settings?.workStartTime  || '09:00',
    workEndTime:     user?.settings?.workEndTime    || '18:00',
    breakInterval:   user?.settings?.breakInterval  || 90,
    breakDuration:   user?.settings?.breakDuration  || 15,
    dailyGoalHours:  user?.settings?.dailyGoalHours || 8,
    notifications: {
      browser:       user?.settings?.notifications?.browser       ?? true,
      burnoutAlerts: user?.settings?.notifications?.burnoutAlerts ?? true,
      breakReminders:user?.settings?.notifications?.breakReminders ?? true,
      dailyDigest:   user?.settings?.notifications?.dailyDigest   ?? true
    }
  });
  const [busy, setBusy] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await api.put('/auth/profile', { name: profile.name });
      await refresh();
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
    finally { setBusy(false); }
  };

  const saveSettings = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await api.put('/auth/profile', { settings });
      await refresh();
      toast.success('Settings saved');
    } catch { toast.error('Save failed'); }
    finally { setBusy(false); }
  };

  const h = (key) => (e) => setSettings(s => ({ ...s, [key]: e.target.value }));
  const hN = (key) => (e) => setSettings(s => ({ ...s, notifications: { ...s.notifications, [key]: e.target.checked } }));

  return (
    <div className="fade-in">
      <div className="page-hdr">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and notification preferences</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Profile */}
        <div className="card">
          <div className="section-title">👤 Profile</div>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="form-input" value={profile.email} disabled style={{ opacity: .5 }} />
            </div>
            <button className="btn btn-primary" disabled={busy}>💾 Save Profile</button>
          </form>
        </div>

        {/* Work schedule */}
        <div className="card">
          <div className="section-title">🕐 Work Schedule</div>
          <form onSubmit={saveSettings}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Work Start</label>
                <input className="form-input" type="time" value={settings.workStartTime} onChange={h('workStartTime')} />
              </div>
              <div className="form-group">
                <label className="form-label">Work End</label>
                <input className="form-input" type="time" value={settings.workEndTime} onChange={h('workEndTime')} />
              </div>
              <div className="form-group">
                <label className="form-label">Break Every (min)</label>
                <input className="form-input" type="number" value={settings.breakInterval} onChange={h('breakInterval')} min="15" max="240" />
              </div>
              <div className="form-group">
                <label className="form-label">Break Duration (min)</label>
                <input className="form-input" type="number" value={settings.breakDuration} onChange={h('breakDuration')} min="5" max="60" />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Goal (hours)</label>
                <input className="form-input" type="number" value={settings.dailyGoalHours} onChange={h('dailyGoalHours')} min="1" max="16" step="0.5" />
              </div>
            </div>

            <div className="divider" />
            <div className="section-title">🔔 Notifications</div>
            {[
              { key: 'browser',        label: 'Browser Notifications', desc: 'Show notifications in the browser' },
              { key: 'burnoutAlerts',  label: 'Burnout Alerts',        desc: 'Alert when burnout risk is high' },
              { key: 'breakReminders', label: 'Break Reminders',       desc: `Remind every ${settings.breakInterval} minutes` },
              { key: 'dailyDigest',    label: 'Daily Digest',          desc: 'Morning summary of yesterday' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ display: 'none' }} checked={settings.notifications[key]} onChange={hN(key)} />
                  <span style={{
                    width: 44, height: 24, borderRadius: 12, background: settings.notifications[key] ? 'var(--primary)' : 'rgba(255,255,255,.12)',
                    transition: 'background .2s', display: 'inline-block', position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: settings.notifications[key] ? 22 : 3,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s'
                    }} />
                  </span>
                </label>
              </div>
            ))}

            <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={busy}>💾 Save Settings</button>
          </form>
        </div>
      </div>
    </div>
  );
}
