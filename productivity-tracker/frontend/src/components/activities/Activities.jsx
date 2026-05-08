import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatTime, categoryColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TYPES = ['app_usage','website','task_work','break','meeting','idle','focus'];
const CATS  = ['productive','neutral','distracting','break'];

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [appUsage,   setAppUsage]   = useState([]);
  const [busy, setBusy]             = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm] = useState({ type: 'app_usage', name: '', category: 'neutral', startTime: '', endTime: '', duration: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/activities', { params: { limit: 30 } }),
      api.get('/activities/app-usage/summary')
    ])
      .then(([aRes, uRes]) => { setActivities(aRes.data); setAppUsage(uRes.data); })
      .catch(() => toast.error('Failed to load activities'))
      .finally(() => setBusy(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.startTime) payload.startTime = new Date(payload.startTime).toISOString();
      if (payload.endTime)   payload.endTime   = new Date(payload.endTime).toISOString();
      const r = await api.post('/activities', payload);
      setActivities(a => [r.data, ...a]);
      setModal(false);
      toast.success('Activity logged');
    } catch { toast.error('Failed to log activity'); }
  };

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const totalDur = appUsage.reduce((s, a) => s + a.totalDuration, 0);

  return (
    <div className="fade-in">
      <div className="flex-between page-hdr">
        <div>
          <h1 className="page-title">Activities</h1>
          <p className="page-subtitle">Track app usage, meetings, and work patterns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Log Activity</button>
      </div>

      {/* App usage summary */}
      {appUsage.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">Today's App Usage</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appUsage.map(a => {
              const pct = totalDur > 0 ? Math.round(a.totalDuration / totalDur * 100) : 0;
              return (
                <div key={a._id}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <span className="text-small font-semibold">{a._id}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`badge badge-${a.category === 'productive' ? 'success' : a.category === 'distracting' ? 'danger' : 'neutral'}`}>{a.category}</span>
                      <span className="text-small text-muted">{Math.round(a.totalDuration / 60)}m · {pct}%</span>
                    </div>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${pct}%`, background: categoryColor(a.category) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="section-title">Recent Activity Log</div>
      {busy ? (
        <div className="flex-center" style={{ height: 160 }}><div className="spinner" /></div>
      ) : activities.length === 0 ? (
        <div className="card empty"><div className="empty-icon">📱</div><div className="empty-title">No activities logged</div></div>
      ) : (
        <div className="card">
          <div className="timeline">
            {activities.map(a => (
              <div key={a._id} className="tl-item">
                <div className="flex-between flex-wrap gap-2">
                  <div>
                    <div className="flex gap-2 items-center flex-wrap" style={{ marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                      <span className={`badge badge-${a.category === 'productive' ? 'success' : a.category === 'distracting' ? 'danger' : a.category === 'break' ? 'warning' : 'neutral'}`}>{a.category}</span>
                      <span className="badge badge-primary">{a.type.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-muted">{formatTime(a.startTime)}{a.endTime ? ` → ${formatTime(a.endTime)}` : ' (ongoing)'}</span>
                  </div>
                  {a.duration > 0 && <span className="text-small text-muted">{Math.round(a.duration / 60)}m</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log modal */}
      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-hdr">
              <h2 className="modal-title">Log Activity</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Activity Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handle} required autoFocus placeholder="e.g. VS Code, Chrome, Slack" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input form-select" name="type" value={form.type} onChange={handle}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" name="category" value={form.category} onChange={handle}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="datetime-local" name="startTime" value={form.startTime} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="datetime-local" name="endTime" value={form.endTime} onChange={handle} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (seconds)</label>
                <input className="form-input" type="number" name="duration" value={form.duration} onChange={handle} min="0" />
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
