export const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (d) => {
  const date = new Date(d);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const riskColor = (risk) => {
  const map = { low: 'var(--success)', moderate: 'var(--warning)', high: 'var(--danger)', critical: 'var(--critical)' };
  return map[risk] || 'var(--text-2)';
};

export const priorityBadge = (p) => {
  const map = { low: 'badge-info', medium: 'badge-primary', high: 'badge-warning', urgent: 'badge-danger' };
  return map[p] || 'badge-neutral';
};

export const statusBadge = (s) => {
  const map = { pending: 'badge-neutral', in_progress: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
  return map[s] || 'badge-neutral';
};

export const categoryColor = (cat) => {
  const map = { productive: '#10b981', neutral: '#6366f1', distracting: '#ef4444', break: '#f59e0b' };
  return map[cat] || '#6366f1';
};

export const scoreGrade = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'var(--success)' };
  if (score >= 60) return { label: 'Good',      color: '#10b981' };
  if (score >= 40) return { label: 'Fair',       color: 'var(--warning)' };
  return                   { label: 'Low',        color: 'var(--danger)' };
};
