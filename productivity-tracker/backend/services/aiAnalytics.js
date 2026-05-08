/**
 * AI/ML Analytics – pure rule-based + statistical engine
 * No external ML library required.
 */

// ─── Burnout Risk Analysis ────────────────────────────────────────────────────
function analyzeBurnout(sessions = []) {
  if (!sessions.length)
    return { riskLevel: 'low', score: 0, factors: [], recommendations: ['Start tracking sessions to get insights.'] };

  let score = 0;
  const factors = [];

  // 1. Extended work days
  const longDays = sessions.filter(s => s.totalWorkMinutes > 540).length;
  if (longDays >= 5) { score += 30; factors.push({ factor: 'Extended work hours', severity: 'high', detail: `${longDays} days > 9 h` }); }
  else if (longDays >= 3) { score += 15; factors.push({ factor: 'Extended work hours', severity: 'medium', detail: `${longDays} days > 9 h` }); }

  // 2. Insufficient breaks
  const poorBreaks = sessions.filter(s => s.totalBreakMinutes < 30 && s.totalWorkMinutes > 240).length;
  if (poorBreaks >= 3) { score += 25; factors.push({ factor: 'Insufficient breaks', severity: 'high', detail: `${poorBreaks} days < 30 min breaks` }); }
  else if (poorBreaks >= 1) { score += 10; factors.push({ factor: 'Insufficient breaks', severity: 'medium', detail: `${poorBreaks} days < 30 min breaks` }); }

  // 3. Declining productivity trend
  if (sessions.length >= 5) {
    const recent = avg(sessions.slice(0, 3).map(s => s.productivityScore || 50));
    const older  = avg(sessions.slice(3, 7).map(s => s.productivityScore || 50));
    const drop = older - recent;
    if (drop >= 20) { score += 20; factors.push({ factor: 'Declining productivity', severity: 'high', detail: `↓ ${drop.toFixed(0)} pts` }); }
    else if (drop >= 10) { score += 10; factors.push({ factor: 'Declining productivity', severity: 'medium', detail: `↓ ${drop.toFixed(0)} pts` }); }
  }

  // 4. High stress
  const stressHigh = sessions.filter(s => s.stressLevel >= 4).length;
  if (stressHigh >= 3) { score += 20; factors.push({ factor: 'High stress levels', severity: 'high', detail: `${stressHigh} high-stress sessions` }); }

  // 5. Low energy
  const lowEnergy = sessions.filter(s => s.energyLevel <= 2).length;
  if (lowEnergy >= 3) { score += 15; factors.push({ factor: 'Low energy', severity: 'medium', detail: `${lowEnergy} low-energy sessions` }); }

  // 6. Weekend work
  const weekendWork = sessions.filter(s => { const d = new Date(s.date).getDay(); return (d === 0 || d === 6) && s.totalWorkMinutes > 60; }).length;
  if (weekendWork >= 2) { score += 10; factors.push({ factor: 'Weekend overwork', severity: 'low', detail: `${weekendWork} weekend sessions` }); }

  score = Math.min(score, 100);
  const riskLevel = score >= 70 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'moderate' : 'low';

  return { riskLevel, score, factors, recommendations: burnoutRecs(riskLevel, factors) };
}

function burnoutRecs(riskLevel, factors) {
  const recs = [];
  const names = factors.map(f => f.factor);
  if (names.includes('Extended work hours'))    recs.push('Set a hard stop time each day and use time-blocking to prevent overruns.');
  if (names.includes('Insufficient breaks'))    recs.push('Use the Pomodoro method: 25 min work → 5 min break → longer break every 4 cycles.');
  if (names.includes('Declining productivity')) recs.push('Prune your task list. Focus only on high-impact work for the next few days.');
  if (names.includes('High stress levels'))     recs.push('Practice 5-minute breathing exercises. Consider discussing workload with your team.');
  if (names.includes('Low energy'))             recs.push('Audit your sleep and nutrition. Reduce workload for 2–3 days to recharge.');
  if (names.includes('Weekend overwork'))       recs.push('Protect your weekends. Disconnecting fully is essential for long-term performance.');
  if (riskLevel === 'critical')                 recs.unshift('⚠️ Critical risk: consider taking a full day off immediately.');
  if (!recs.length)                             recs.push('Work-life balance looks healthy. Keep it up!');
  return recs;
}

// ─── Productivity Insights ────────────────────────────────────────────────────
function generateInsights(sessions = [], tasks = [], user) {
  if (!sessions.length)
    return { insights: [], score: 0, summary: 'No session data yet. Start tracking to unlock insights!' };

  const avgProd  = avg(sessions.map(s => s.productivityScore || 0));
  const avgFocus = avg(sessions.map(s => s.focusScore || 0));
  const avgHours = avg(sessions.map(s => s.totalWorkMinutes)) / 60;

  const insights = [];

  // Peak time
  const mornScore = sessions.filter(s => { const h = new Date(s.startTime).getHours(); return h >= 6 && h < 12; });
  const aftnScore = sessions.filter(s => { const h = new Date(s.startTime).getHours(); return h >= 12 && h < 18; });
  if (avg(mornScore.map(s => s.productivityScore || 50)) > avg(aftnScore.map(s => s.productivityScore || 50))) {
    insights.push({ icon: '🌅', title: 'Morning Peak', message: 'You perform best before noon. Schedule deep work in the morning.', impact: 'high' });
  } else {
    insights.push({ icon: '☀️', title: 'Afternoon Peak', message: 'Your productivity peaks after lunch. Save complex tasks for then.', impact: 'medium' });
  }

  // Focus
  if (avgFocus >= 75)   insights.push({ icon: '🎯', title: 'Excellent Focus', message: `Avg focus score ${avgFocus.toFixed(0)}/100 – outstanding!`, impact: 'positive' });
  else if (avgFocus < 50) insights.push({ icon: '🎯', title: 'Focus Needs Work', message: `Avg focus only ${avgFocus.toFixed(0)}/100. Try eliminating notifications during deep work.`, impact: 'high' });

  // Hours balance
  if (avgHours > 9)             insights.push({ icon: '⚖️', title: 'Overworking', message: `You average ${avgHours.toFixed(1)} h/day. Aim for 7–8 h for sustainability.`, impact: 'high' });
  else if (avgHours >= 7 && avgHours <= 8) insights.push({ icon: '⚖️', title: 'Healthy Hours', message: `${avgHours.toFixed(1)} h/day average – ideal for long-term productivity.`, impact: 'positive' });

  // Task rate
  const completed = tasks.filter(t => t.status === 'completed').length;
  if (tasks.length > 0) {
    const rate = Math.round(completed / tasks.length * 100);
    if (rate >= 80) insights.push({ icon: '✅', title: 'High Completion', message: `${rate}% task completion rate. Excellent!`, impact: 'positive' });
    else if (rate < 50) insights.push({ icon: '⚠️', title: 'Low Completion', message: `Only ${rate}% completion. Try breaking tasks into smaller subtasks.`, impact: 'high' });
  }

  // Streak
  if (user?.stats?.streakDays >= 7)
    insights.push({ icon: '🔥', title: `${user.stats.streakDays}-Day Streak!`, message: 'Amazing consistency – keep the momentum going!', impact: 'positive' });

  return { insights, score: Math.round(avgProd), summary: avgProd >= 70 ? 'Great productivity! Above average.' : avgProd >= 50 ? 'Decent productivity with room to grow.' : 'Needs attention – review the insights below.' };
}

// ─── Work Pattern Analysis ────────────────────────────────────────────────────
function analyzePatterns(activities = []) {
  const hourly = Array(24).fill(0);
  activities.forEach(a => { hourly[new Date(a.startTime).getHours()] += (a.duration || 0); });

  const hourlyDist = hourly.map((dur, h) => ({
    hour: h, label: `${String(h).padStart(2, '0')}:00`,
    minutes: Math.round(dur / 60)
  }));

  const catMap = {};
  const totalDur = activities.reduce((s, a) => s + (a.duration || 0), 0);
  activities.forEach(a => { catMap[a.category || 'neutral'] = (catMap[a.category || 'neutral'] || 0) + (a.duration || 0); });

  const categoryBreakdown = Object.entries(catMap).map(([name, dur]) => ({
    name, minutes: Math.round(dur / 60),
    percentage: totalDur > 0 ? Math.round(dur / totalDur * 100) : 0
  })).sort((a, b) => b.minutes - a.minutes);

  const patterns = [];
  const peakHour = hourly.indexOf(Math.max(...hourly));
  if (hourly[peakHour] > 0)
    patterns.push({ title: `Peak at ${peakHour}:00`, description: `Schedule deep-work blocks around ${peakHour}:00 for best results.` });

  const distrPct = categoryBreakdown.find(c => c.name === 'distracting')?.percentage || 0;
  if (distrPct > 25)
    patterns.push({ title: 'High Distraction', description: `${distrPct}% time on distracting apps. Consider a website blocker during focus sessions.` });

  return { hourlyDist, categoryBreakdown, patterns };
}

// ─── Weekly Report ────────────────────────────────────────────────────────────
function weeklyReport(sessions = [], tasks = [], user) {
  const totalWork  = sessions.reduce((s, x) => s + x.totalWorkMinutes, 0);
  const totalBreak = sessions.reduce((s, x) => s + x.totalBreakMinutes, 0);
  const avgProd    = avg(sessions.map(s => s.productivityScore || 0));
  const avgFocus   = avg(sessions.map(s => s.focusScore || 0));
  const burnout    = analyzeBurnout(sessions);
  const best       = sessions.reduce((b, s) => (!b || s.productivityScore > b.productivityScore) ? s : b, null);

  return {
    period: 'This Week',
    summary: {
      totalWorkHours:       +(totalWork / 60).toFixed(1),
      totalBreakHours:      +(totalBreak / 60).toFixed(1),
      avgProductivityScore: Math.round(avgProd),
      avgFocusScore:        Math.round(avgFocus),
      tasksCompleted:       tasks.length,
      workDays:             sessions.length,
      burnoutRisk:          burnout.riskLevel
    },
    bestDay:    best ? { date: best.date, score: best.productivityScore } : null,
    daily:      sessions.map(s => ({ date: s.date, workHours: +(s.totalWorkMinutes / 60).toFixed(1), productivity: s.productivityScore, focus: s.focusScore, tasks: s.tasksCompleted, burnout: s.burnoutScore })),
    burnout,
    achievements: buildAchievements(sessions, tasks),
    goals: buildGoals(sessions, tasks)
  };
}

function buildAchievements(sessions, tasks) {
  const a = [];
  if (tasks.length >= 10)  a.push({ icon: '🏆', title: 'Task Champion', desc: `${tasks.length} tasks completed this week` });
  if (sessions.some(s => s.productivityScore >= 90)) a.push({ icon: '⚡', title: 'Peak Performer', desc: 'Reached 90+ productivity score' });
  if (sessions.length >= 5) a.push({ icon: '📅', title: 'Consistent', desc: '5+ active work days' });
  if (avg(sessions.map(s => s.focusScore || 0)) >= 80) a.push({ icon: '🎯', title: 'Focus Master', desc: 'Avg focus score ≥ 80' });
  return a;
}

function buildGoals(sessions, tasks) {
  const goals = [];
  const avgH = avg(sessions.map(s => s.totalWorkMinutes)) / 60;
  if (avgH > 9) goals.push('Aim to close work by 6 PM each day.');
  if (tasks.length < 5) goals.push('Complete at least 5 meaningful tasks next week.');
  goals.push('Take a proper 15-min break every 90 minutes.');
  goals.push('Log mood & energy daily for richer insights.');
  return goals;
}

// ─── Productivity Score Calc ──────────────────────────────────────────────────
function calcProductivityScore({ totalWorkMinutes, totalBreakMinutes, tasksCompleted = 0, focusScore = 50, stressLevel = 3, energyLevel = 3 }) {
  let s = 50;
  const h = totalWorkMinutes / 60;
  if (h >= 7 && h <= 8) s += 20;
  else if (h >= 6)       s += 10;
  else if (h > 9)        s -= 10;

  const br = totalBreakMinutes / (totalWorkMinutes || 1);
  if (br >= 0.1 && br <= 0.2) s += 10;
  else if (br < 0.05)          s -= 15;

  s += Math.min(tasksCompleted * 3, 15);
  s += (focusScore - 50) * 0.2;
  s += (energyLevel - 3) * 3;
  s -= (stressLevel - 3) * 3;
  return Math.max(0, Math.min(100, Math.round(s)));
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

module.exports = { analyzeBurnout, generateInsights, analyzePatterns, weeklyReport, calcProductivityScore };
