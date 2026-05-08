import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Filler, Tooltip, Legend, RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend, RadialLinearScale);

const OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
    tooltip: { backgroundColor: '#1a1e35', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,.07)', borderWidth: 1 }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true }
  }
};
const NO_SCALES = { ...OPTS, scales: undefined };

export default function Analytics() {
  const [period,   setPeriod]   = useState('7d');
  const [trends,   setTrends]   = useState([]);
  const [insights, setInsights] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [weekly,   setWeekly]   = useState(null);
  const [busy,     setBusy]     = useState(true);

  useEffect(() => {
    setBusy(true);
    Promise.all([
      api.get('/analytics/trends', { params: { period } }),
      api.get('/analytics/insights'),
      api.get('/analytics/patterns'),
      api.get('/analytics/weekly-report')
    ])
      .then(([t, i, p, w]) => { setTrends(t.data); setInsights(i.data); setPatterns(p.data); setWeekly(w.data); })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setBusy(false));
  }, [period]);

  const labels = trends.map(d => formatDate(d.date).slice(0, 6));

  const productivityLine = {
    labels,
    datasets: [
      { label: 'Productivity', data: trends.map(d => d.productivityScore), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.15)', fill: true, tension: 0.4, pointRadius: 4 },
      { label: 'Focus',        data: trends.map(d => d.focusScore),        borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,.1)',   fill: true, tension: 0.4, pointRadius: 4 }
    ]
  };

  const workHoursBar = {
    labels,
    datasets: [
      { label: 'Work Hours',  data: trends.map(d => d.workHours),    backgroundColor: 'rgba(99,102,241,.7)',  borderRadius: 6 },
      { label: 'Break (min)', data: trends.map(d => d.breakMinutes), backgroundColor: 'rgba(6,182,212,.5)',  borderRadius: 6 }
    ]
  };

  const burnoutLine = {
    labels,
    datasets: [{ label: 'Burnout Score', data: trends.map(d => d.burnoutScore), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.12)', fill: true, tension: 0.4, pointRadius: 4 }]
  };

  const wellnessLine = {
    labels,
    datasets: [
      { label: 'Mood',   data: trends.map(d => d.mood),   borderColor: '#10b981', tension: 0.4, pointRadius: 3 },
      { label: 'Energy', data: trends.map(d => d.energy), borderColor: '#f59e0b', tension: 0.4, pointRadius: 3 },
      { label: 'Stress', data: trends.map(d => d.stress), borderColor: '#ef4444', tension: 0.4, pointRadius: 3 }
    ]
  };

  const hourlyBar = patterns?.hourlyDist
    ? {
        labels: patterns.hourlyDist.map(h => h.label),
        datasets: [{ label: 'Active Minutes', data: patterns.hourlyDist.map(h => h.minutes), backgroundColor: 'rgba(99,102,241,.65)', borderRadius: 4 }]
      }
    : null;

  const catDoughnut = patterns?.categoryBreakdown?.length
    ? {
        labels:   patterns.categoryBreakdown.map(c => c.name),
        datasets: [{
          data:            patterns.categoryBreakdown.map(c => c.minutes),
          backgroundColor: ['#10b981','#6366f1','#ef4444','#f59e0b'],
          borderWidth: 0
        }]
      }
    : null;

  return (
    <div className="fade-in">
      <div className="flex-between page-hdr flex-wrap gap-3">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">AI-powered behavioral insights and productivity trends</p>
        </div>
        <div className="flex gap-2">
          {['7d','14d','30d'].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {busy ? (
        <div className="flex-center" style={{ height: 250 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* Insights */}
          {insights && (
            <div className="card card-grad" style={{ marginBottom: 24 }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>🧠 AI Insights</h2>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-l)' }}>{insights.score}<span style={{ fontSize: 14, fontWeight: 400 }}>/100</span></div>
                  <div className="text-xs text-muted">Avg Score</div>
                </div>
              </div>
              <p className="text-small text-muted" style={{ marginBottom: 16 }}>{insights.summary}</p>
              <div className="grid-2">
                {insights.insights.map((ins, i) => (
                  <div key={i} className="card" style={{ padding: '14px 16px', background: 'rgba(255,255,255,.03)' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{ins.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ins.title}</div>
                    <p className="text-small text-muted">{ins.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts row 1 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="section-title">Productivity & Focus Trend</div>
              <div style={{ height: 220 }}><Line data={productivityLine} options={OPTS} /></div>
            </div>
            <div className="card">
              <div className="section-title">Work Hours & Breaks</div>
              <div style={{ height: 220 }}><Bar data={workHoursBar} options={OPTS} /></div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="section-title">Burnout Score Over Time</div>
              <div style={{ height: 220 }}><Line data={burnoutLine} options={{ ...OPTS, scales: { ...OPTS.scales, y: { ...OPTS.scales.y, max: 100 } } }} /></div>
            </div>
            <div className="card">
              <div className="section-title">Wellness Trends (1–5)</div>
              <div style={{ height: 220 }}><Line data={wellnessLine} options={{ ...OPTS, scales: { ...OPTS.scales, y: { ...OPTS.scales.y, min: 1, max: 5 } } }} /></div>
            </div>
          </div>

          {/* Work patterns */}
          {patterns && (
            <div className="grid-2" style={{ marginBottom: 24 }}>
              {hourlyBar && (
                <div className="card">
                  <div className="section-title">Hourly Activity Distribution</div>
                  <div style={{ height: 200 }}><Bar data={hourlyBar} options={OPTS} /></div>
                </div>
              )}
              {catDoughnut && (
                <div className="card">
                  <div className="section-title">Activity Category Breakdown</div>
                  <div style={{ height: 160, maxWidth: 200, margin: '0 auto' }}>
                    <Doughnut data={catDoughnut} options={{ ...NO_SCALES, plugins: { ...NO_SCALES.plugins, legend: { labels: { color: '#94a3b8', font: { size: 11 } } } }, cutout: '60%' }} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {patterns.categoryBreakdown.map((c, i) => (
                      <div key={c.name} className="flex-between" style={{ marginBottom: 6 }}>
                        <div className="flex gap-2 items-center">
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: ['#10b981','#6366f1','#ef4444','#f59e0b'][i], display: 'inline-block' }} />
                          <span className="text-small">{c.name}</span>
                        </div>
                        <span className="text-small text-muted">{c.minutes}m · {c.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weekly report */}
          {weekly && (
            <div className="card">
              <div className="section-title">📋 Weekly Report</div>
              <div className="grid-4" style={{ marginBottom: 20 }}>
                {[
                  { lbl: 'Total Work', val: `${weekly.summary.totalWorkHours}h` },
                  { lbl: 'Avg Productivity', val: `${weekly.summary.avgProductivityScore}/100` },
                  { lbl: 'Tasks Completed', val: weekly.summary.tasksCompleted },
                  { lbl: 'Burnout Risk', val: weekly.summary.burnoutRisk.toUpperCase() }
                ].map(({ lbl, val }) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-l)' }}>{val}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {weekly.achievements?.length > 0 && (
                <>
                  <div className="divider" />
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>🏆 Achievements</div>
                  <div className="flex gap-3 flex-wrap">
                    {weekly.achievements.map((a, i) => (
                      <div key={i} className="card card-grad" style={{ padding: '10px 14px', flex: '0 1 auto' }}>
                        <span style={{ fontSize: 20 }}>{a.icon}</span> <strong style={{ fontSize: 13 }}>{a.title}</strong>
                        <div className="text-xs text-muted">{a.desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {weekly.goals?.length > 0 && (
                <>
                  <div className="divider" />
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>🎯 Next Week Goals</div>
                  {weekly.goals.map((g, i) => (
                    <div key={i} className="flex gap-2 items-center" style={{ marginBottom: 8 }}>
                      <span style={{ color: 'var(--primary-l)' }}>→</span>
                      <span className="text-small">{g}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
