import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { formatDate, priorityBadge, statusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', category: 'work', priority: 'medium',
  status: 'pending', dueDate: '', estimatedMinutes: 60, notes: '', tags: ''
};

export default function Tasks() {
  const [tasks, setTasks]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [busy,  setBusy]    = useState(true);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      const r = await api.get('/tasks', { params });
      setTasks(r.data.tasks);
      setTotal(r.data.total);
    } catch { toast.error('Failed to load tasks'); }
    finally  { setBusy(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ ...t, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '', tags: (t.tags || []).join(', ') });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (editing) {
        const r = await api.put(`/tasks/${editing._id}`, payload);
        setTasks(ts => ts.map(t => t._id === editing._id ? r.data : t));
        toast.success('Task updated');
      } else {
        const r = await api.post('/tasks', payload);
        setTasks(ts => [r.data, ...ts]);
        toast.success('Task created');
      }
      setModal(false);
    } catch { toast.error('Save failed'); }
  };

  const changeStatus = async (t, status) => {
    try {
      const r = await api.put(`/tasks/${t._id}`, { status });
      setTasks(ts => ts.map(x => x._id === t._id ? r.data : x));
      if (status === 'completed') toast.success('🎉 Task completed!');
    } catch { toast.error('Update failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(ts => ts.filter(t => t._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fade-in">
      <div className="flex-between page-hdr">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{total} tasks total</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Task</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div className="flex gap-3 flex-wrap">
          {[
            { key: 'status',   opts: ['','pending','in_progress','completed','cancelled'], label: 'Status' },
            { key: 'priority', opts: ['','low','medium','high','urgent'],                  label: 'Priority' },
            { key: 'category', opts: ['','work','personal','health','learning','creative','other'], label: 'Category' }
          ].map(f => (
            <select key={f.key} className="form-input form-select" style={{ width: 140 }}
              value={filters[f.key]} onChange={e => setFilters(x => ({ ...x, [f.key]: e.target.value }))}>
              <option value="">All {f.label}</option>
              {f.opts.slice(1).map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', priority: '', category: '' })}>Clear</button>
        </div>
      </div>

      {/* Task list */}
      {busy ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No tasks found</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNew}>Create your first task</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(t => (
            <div key={t._id} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex-between" style={{ gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex gap-2 items-center flex-wrap" style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</span>
                    <span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span>
                    <span className={`badge ${statusBadge(t.status)}`}>{t.status.replace('_', ' ')}</span>
                    <span className="badge badge-neutral">{t.category}</span>
                  </div>
                  {t.description && <p className="text-small text-muted" style={{ marginBottom: 6 }}>{t.description}</p>}
                  <div className="flex gap-3 flex-wrap">
                    {t.dueDate && <span className="text-xs text-muted">📅 Due: {formatDate(t.dueDate)}</span>}
                    <span className="text-xs text-muted">⏱ Est: {t.estimatedMinutes}m</span>
                    {t.subtasks?.length > 0 && <span className="text-xs text-muted">☑ {t.subtasks.filter(s => s.completed).length}/{t.subtasks.length} subtasks</span>}
                  </div>
                  {t.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
                      {t.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-center flex-wrap" style={{ flexShrink: 0 }}>
                  {t.status !== 'completed' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => changeStatus(t, 'completed')}>✓ Done</button>
                  )}
                  {t.status === 'pending' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => changeStatus(t, 'in_progress')}>▶ Start</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(t._id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-hdr">
              <h2 className="modal-title">{editing ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" value={form.title} onChange={handle} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" name="description" value={form.description} onChange={handle} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" name="category" value={form.category} onChange={handle}>
                    {['work','personal','health','learning','creative','other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input form-select" name="priority" value={form.priority} onChange={handle}>
                    {['low','medium','high','urgent'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" name="status" value={form.status} onChange={handle}>
                    {['pending','in_progress','completed','cancelled'].map(o => <option key={o} value={o}>{o.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" name="dueDate" value={form.dueDate} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated (min)</label>
                  <input className="form-input" type="number" name="estimatedMinutes" value={form.estimatedMinutes} onChange={handle} min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-sep)</label>
                  <input className="form-input" name="tags" value={form.tags} onChange={handle} placeholder="focus, urgent" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" name="notes" value={form.notes} onChange={handle} />
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
