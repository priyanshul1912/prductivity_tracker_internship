import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate, formatDuration, scoreGrade } from '../../utils/helpers';
import toast from 'react-hot-toast';

// Chart.js registration
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1e35', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,.07)', borderWidth: 1 } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true }
  }
};

export default function Dashboard() {
  const [data, setData]   = useState(null);
  const [busy, setBusy]   = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setBusy(false));
  }, []);

  if (busy) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const { user, todaySession, taskSummary, weeklyData, appUsageToday, unreadCount } = data || {};
  const grade = scoreGrade(todaySession?.productivityScore || 0);

  // Weekly line chart
  const labels = weeklyData?.map(d => formatDate(d.date).slice(0, 6)) || [];
  const lineData = {
    labels,
    datasets: [
      {
        label: 'Productivity',
        data: weeklyData?.map(d => d.productivity) || [],
        borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.15)',
        fill: true, tension: 0.4, pointRadius: 4
      },
      {
        label: 'Focus',
        data: weeklyData?.map(d => d.focus) || [],
        borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,.1)',
        fill: true, tension: 0.4, pointRadius: 4
      }
    ]
  };

  // App usage doughnut
  const totalUsage = appUsageToday?.reduce((s, a) => s + a.totalDuration, 0) || 0;
  const catColors  = { productive: '#10b981', neutral: '#6366f1', distracting: '#ef4444' };
  const doughnutData = {
    labels:   appUsageToday?.map(a => a._id) || [],
    datasets: [{
      data:            appUsageToday?.map(a => Math.round(a.totalDuration / 60)) || [],
      backgroundColor: appUsageToday?.map(a => catColors[a.category] || '#6366f1') || [],
      borderWidth: 0
    }]
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Good {greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        {unreadCount > 0 && (
          <span className="badge badge-danger" style={{ fontSize: 13, padding: '5px 14px' }}>
            🔔 {unreadCount} unread
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="⏱️" val={formatDuration(todaySession?.totalWorkMinutes || 0)} lbl="Work Time Today" color="#6366f1" />
        <StatCard icon="☕" val={formatDuration(todaySession?.totalBreakMinutes || 0)} lbl="Break Time Today" color="#06b6d4" />
        <StatCard icon="✅" val={taskSummary?.completed || 0} lbl="Tasks Completed" color="#10b981" />
        <StatCard icon="📋" val={taskSummary?.in_progress || 0} lbl="In Progress" color="#f59e0b" />
      </div>

      {/* Productivity score + burnout */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Today's score */}
        <div className="card card-grad">
          <div className="section-title">Today's Productivity</div>
          <div className="flex-center" style={{ gap: 28, padding: '12px 0' }}>
            <div className="score-ring" style={{ '--pct': todaySession?.productivityScore || 0 }}>
              {todaySession?.productivityScore || '–'}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: grade.color }}>{grade.label}</div>
              <div className="text-muted text-small" style={{ marginTop: 4 }}>
                Focus Score: <strong style={{ color: 'var(--text)' }}>{todaySession?.focusScore || 0}</strong>
              </div>
              <div className="text-muted text-small">
                Burnout Risk: <strong className={`risk-${todaySession?.burnoutRisk || 'low'}`}>{(todaySession?.burnoutRisk || 'low').toUpperCase()}</strong>
              </div>
              <div className="text-muted text-small" style={{ marginTop: 6 }}>Tasks done: <strong style={{ color: 'var(--text)' }}>{todaySession?.tasksCompleted || 0}</strong></div>
            </div>
          </div>
        </div>

        {/* Task summary */}
        <div className="card">
          <div className="section-title">Task Overview</div>
          {[
            { label: 'Completed',   val: taskSummary?.completed || 0,   cls: 'badge-success' },
            { label: 'In Progress', val: taskSummary?.in_progress || 0, cls: 'badge-info' },
            { label: 'Pending',     val: taskSummary?.pending || 0,     cls: 'badge-neutral' },
            { label: 'Overdue',     val: taskSummary?.cancelled || 0,   cls: 'badge-danger' }
          ].map(({ label, val, cls }) => (
            <div key={label} className="flex-between" style={{ marginBottom: 14 }}>
              <span className="text-small text-muted">{label}</span>
              <span className={`badge ${cls}`}>{val}</span>
            </div>
          ))}
          <div className="progress" style={{ marginTop: 8 }}>
            <div className="progress-bar" style={{
              width: `${taskSummary?.completed && (taskSummary.completed + taskSummary.in_progress + taskSummary.pending) > 0
                ? Math.round(taskSummary.completed / (taskSummary.completed + taskSummary.in_progress + taskSummary.pending) * 100)
                : 0}%`
            }} />
          </div>
          <div className="text-xs text-muted" style={{ marginTop: 6, textAlign: 'right' }}>Completion rate</div>
        </div>
      </div>

      {/* Weekly trend + App usage */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="section-title">7-Day Productivity & Focus</div>
          <div style={{ height: 200 }}>
            <Line data={lineData} options={CHART_OPTS} />
          </div>
        </div>

        <div className="card">
          <div className="section-title">Today's App Usage</div>
          {appUsageToday?.length ? (
            <>
              <div style={{ height: 160, position: 'relative', margin: '0 auto', maxWidth: 180 }}>
                <Doughnut data={doughnutData} options={{ ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } }, scales: undefined, cutout: '65%' }} />
              </div>
              <div style={{ marginTop: 14 }}>
                {appUsageToday.map(a => (
                  <div key={a._id} className="flex-between" style={{ marginBottom: 8 }}>
                    <div className="flex gap-2 items-center">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[a.category] || '#6366f1', display: 'inline-block' }} />
                      <span className="text-small">{a._id}</span>
                    </div>
                    <span className="text-small text-muted">{Math.round(a.totalDuration / 60)}m</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty"><div className="empty-icon">📱</div><div className="empty-title">No app usage logged today</div></div>
          )}
        </div>
      </div>

      {/* Weekly burnout sparkline */}
      {weeklyData?.length > 0 && (
        <div className="card">
          <div className="section-title">Weekly Burnout Trend</div>
          <div style={{ height: 140 }}>
            <Line data={{
              labels,
              datasets: [{
                label: 'Burnout Score',
                data: weeklyData.map(d => d.burnoutScore),
                borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)',
                fill: true, tension: 0.4, pointRadius: 4
              }]
            }} options={{ ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, max: 100 } } }} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, val, lbl, color }) {
  return (
    <div className="stat-card">
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <span className="stat-icon">{icon}</span>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 16 }}>{icon}</span>
      </div>
      <div className="stat-val" style={{ color }}>{val}</div>
      <div className="stat-lbl">{lbl}</div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}
