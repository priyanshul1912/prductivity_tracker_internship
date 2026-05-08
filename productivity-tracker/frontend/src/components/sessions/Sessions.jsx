import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { formatDate, formatTime, formatDuration } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [today, setToday]       = useState(null);
  const [busy, setBusy]         = useState(true);
  const [wellModal, setWellModal] = useState(false);
  const [wellForm, setWellForm] = useState({ moodRating: 3, energyLevel: 3, stressLevel: 3, notes: '' });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/sessions', { params: { limit: 14 } }),
        api.get('/sessions/today')
      ]);
      setSessions(sRes.data);
      setToday(tRes.data);
    } catch { toast.error('Failed to load sessions'); }
    finally  { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startSession = async () => {
    try {
      const r = await api.post('/sessions/start');
      setToday(r.data);
      toast.success('Session started! Have a productive day 🚀');
    } catch { toast.error('Failed to start session'); }
  };

  const endSession = async () => {
    if (!today) return;
    try {
      const r = await api.put(`/sessions/${today._id}`, { endTime: new Date() });
      setToday(r.data);
      toast.success('Session ended. Great work today!');
      load();
    } catch { toast.error('Failed to end session'); }
  };

  const logWellness = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post(`/sessions/${today._id}/wellness`, wellForm);
      setToday(r.data);
      setWellModal(false);
      toast.success('Wellness logged ❤️');
    } catch { toast.error('Failed to save wellness'); }
  };

  const updateScore = async (field, val) => {
    if (!today) return;
    try {
      const r = await api.put(`/sessions/${today._id}`, { [field]: val });
      setToday(r.data);
    } catch {}
  };

  const riskCls = (r) => ({ low: 'badge-success', moderate: 'badge-warning', high: 'badge-danger', critical: 'badge-critical' }[r] || 'badge-neutral');

  return (
    <div className="fade-in">
      <div className="page-hdr">
        <h1 className="page-title">Work Sessions</h1>
        <p className="page-subtitle">Track your daily work patterns and breaks</p>
      </div>

      {/* Today's session */}
      <div className="card card-grad" style={{ marginBottom: 24 }}>
        <div className="flex-between" style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>📅 Today's Session</h2>
          <div className="flex gap-2">
            {today && <button className="btn btn-secondary btn-sm" onClick={() => setWellModal(true)}>❤️ Log Wellness</button>}
            {!today ? (
              <button className="btn btn-primary" onClick={startSession}>▶ Start Session</button>
            ) : !today.endTime ? (
              <button className="btn btn-danger" onClick={endSession}>⏹ End Session</button>
            ) : (
              <span className="badge badge-success">Session Complete</span>
            )}
          </div>
        </div>

        {today ? (
          <div className="grid-4">
            <div>
              <div className="stat-lbl">Work Time</div>
              <div className="stat-val" style={{ fontSize: 22, color: 'var(--primary-l)' }}>{formatDuration(today.totalWorkMinutes)}</div>
            </div>
            <div>
              <div className="stat-lbl">Break Time</div>
              <div className="stat-val" style={{ fontSize: 22, color: 'var(--accent)' }}>{formatDuration(today.totalBreakMinutes)}</div>
            </div>
            <div>
              <div className="stat-lbl">Productivity</div>
              <div className="stat-val" style={{ fontSize: 22, color: 'var(--success)' }}>{today.productivityScore}<span style={{ fontSize: 12, fontWeight: 400 }}>/100</span></div>
            </div>
            <div>
              <div className="stat-lbl">Burnout Risk</div>
              <span className={`badge ${riskCls(today.burnoutRisk)}`} style={{ marginTop: 4 }}>{today.burnoutRisk}</span>
            </div>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">🌅</div>
            <div className="empty-title">No session today yet</div>
            <p className="text-muted text-small">Start your session to begin tracking</p>
          </div>
        )}

        {today && (
          <>
            <div className="divider" />
            <div className="grid-2">
              <div>
                <div className="stat-lbl" style={{ marginBottom: 8 }}>Productivity Score</div>
                <input type="range" min="0" max="100" value={today.productivityScore}
                  onChange={e => updateScore('productivityScore', +e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div className="flex-between"><span className="text-xs text-muted">0</span><strong>{today.productivityScore}</strong><span className="text-xs text-muted">100</span></div>
              </div>
              <div>
                <div className="stat-lbl" style={{ marginBottom: 8 }}>Focus Score</div>
                <input type="range" min="0" max="100" value={today.focusScore}
                  onChange={e => updateScore('focusScore', +e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <div className="flex-between"><span className="text-xs text-muted">0</span><strong>{today.focusScore}</strong><span className="text-xs text-muted">100</span></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent sessions */}
      <div className="section-title">Recent Sessions</div>
      {busy ? (
        <div className="flex-center" style={{ height: 160 }}><div className="spinner" /></div>
      ) : sessions.length === 0 ? (
        <div className="card empty"><div className="empty-icon">📆</div><div className="empty-title">No sessions yet</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map(s => (
            <div key={s._id} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex-between flex-wrap gap-2">
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{formatDate(s.date)}</div>
                  <div className="flex gap-3 flex-wrap">
                    <span className="text-small text-muted">⏱ {formatDuration(s.totalWorkMinutes)} worked</span>
                    <span className="text-small text-muted">☕ {formatDuration(s.totalBreakMinutes)} break</span>
                    <span className="text-small text-muted">✅ {s.tasksCompleted} tasks</span>
                    {s.breaks?.length > 0 && <span className="text-small text-muted">🔄 {s.breaks.length} breaks taken</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <div style={{ textAlign: 'center' }}>
                    <div className="text-xs text-muted">Productivity</div>
                    <strong style={{ color: 'var(--primary-l)' }}>{s.productivityScore}</strong>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="text-xs text-muted">Focus</div>
                    <strong style={{ color: 'var(--accent)' }}>{s.focusScore}</strong>
                  </div>
                  <span className={`badge ${riskCls(s.burnoutRisk)}`}>{s.burnoutRisk}</span>
                  {s.moodRating && <span className="text-small">{'⭐'.repeat(s.moodRating)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wellness modal */}
      {wellModal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setWellModal(false)}>
          <div className="modal">
            <div className="modal-hdr">
              <h2 className="modal-title">❤️ Log Wellness</h2>
              <button className="modal-close" onClick={() => setWellModal(false)}>×</button>
            </div>
            <form onSubmit={logWellness}>
              {[
                { key: 'moodRating',   label: 'Mood',         emoji: ['😞','😕','😐','😊','😄'] },
                { key: 'energyLevel',  label: 'Energy Level', emoji: ['🪫','😴','⚡','🔋','🚀'] },
                { key: 'stressLevel',  label: 'Stress Level', emoji: ['😌','🙂','😐','😟','😰'] }
              ].map(({ key, label, emoji }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <div className="star-rating">
                    {[1,2,3,4,5].map(v => (
                      <span key={v} className={`star ${wellForm[key] >= v ? 'on' : 'off'}`}
                        onClick={() => setWellForm(f => ({ ...f, [key]: v }))}>
                        {emoji[v - 1]}
                      </span>
                    ))}
                    <span className="text-small text-muted" style={{ marginLeft: 8 }}>({wellForm[key]}/5)</span>
                  </div>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" value={wellForm.notes} onChange={e => setWellForm(f => ({ ...f, notes: e.target.value }))} placeholder="How are you feeling?" />
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setWellModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
