import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { riskColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function BurnoutMonitor() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    api.get('/analytics/burnout')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load burnout analysis'))
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>;

  const { riskLevel, score, factors, recommendations } = data || {};
  const color = riskColor(riskLevel);
  const arcDeg = Math.round(score * 1.8); // 0-180 degrees
  const riskLabel = { low: '✅ Low', moderate: '⚠️ Moderate', high: '🔴 High', critical: '🚨 Critical' }[riskLevel] || riskLevel;

  return (
    <div className="fade-in">
      <div className="page-hdr">
        <h1 className="page-title">🔥 Burnout Monitor</h1>
        <p className="page-subtitle">AI-powered burnout risk analysis based on your last 14 days</p>
      </div>

      {/* Risk gauge */}
      <div className="card card-grad" style={{ marginBottom: 24, textAlign: 'center', padding: '40px 24px' }}>
        {/* Semi-circle gauge */}
        <div style={{ position: 'relative', width: 200, height: 110, margin: '0 auto 20px' }}>
          <svg viewBox="0 0 200 110" width="200" height="110">
            <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="rgba(255,255,255,.08)" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M 10 100 A 90 90 0 0 1 190 100"
              stroke={color} strokeWidth="16" fill="none" strokeLinecap="round"
              strokeDasharray={`${arcDeg * (Math.PI * 90 / 180)} ${Math.PI * 90}`}
            />
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color }}>{score}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>/ 100</div>
          </div>
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, color, marginBottom: 8 }}>{riskLabel}</div>
        <p className="text-muted text-small">Based on work hours, breaks, productivity trends, stress, and wellness data</p>
      </div>

      {/* Factors */}
      {factors?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">⚠️ Risk Factors Detected</div>
          {factors.map((f, i) => {
            const sev = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' }[f.severity] || 'badge-neutral';
            return (
              <div key={i} className="flex-between" style={{ padding: '12px 0', borderBottom: i < factors.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{f.factor}</div>
                  <div className="text-small text-muted">{f.detail}</div>
                </div>
                <span className={`badge ${sev}`}>{f.severity}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      <div className="card">
        <div className="section-title">💡 Personalized Recommendations</div>
        {recommendations?.map((rec, i) => (
          <div key={i} className="flex gap-3 items-center" style={{ padding: '12px 0', borderBottom: i < recommendations.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>
              {i === 0 && riskLevel === 'critical' ? '🚨' : ['🌿', '☕', '🎯', '💪', '😴', '🏃'][i % 6]}
            </span>
            <p className="text-small">{rec}</p>
          </div>
        ))}
      </div>

      {/* Wellness tips */}
      <div className="card card-grad" style={{ marginTop: 24 }}>
        <div className="section-title">🌟 Daily Wellness Habits</div>
        <div className="grid-2">
          {[
            { icon: '💧', tip: 'Drink 8 glasses of water throughout the day' },
            { icon: '🚶', tip: 'Take a 10-minute walk during your lunch break' },
            { icon: '🧘', tip: 'Practice 5 minutes of deep breathing before starting work' },
            { icon: '📵', tip: 'No screens for 30 minutes before bedtime' },
            { icon: '⏰', tip: 'Consistent sleep schedule: same time every day' },
            { icon: '🎵', tip: 'Listen to focus music during deep work sessions' }
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex gap-2 items-center" style={{ padding: '8px 0' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <span className="text-small">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
