/**
 * AI/ML Analytics Service
 * Implements rule-based and statistical ML analysis for productivity, burnout,
 * and behavioral patterns without requiring external ML dependencies.
 */

/**
 * Analyze burnout risk based on recent work sessions
 */
function analyzeBurnoutRisk(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      riskLevel: 'low',
      score: 0,
      factors: [],
      recommendations: ['Start tracking your work sessions to get personalized insights.']
    };
  }

  const factors = [];
  let burnoutScore = 0;

  // Factor 1: Consecutive long work days (>9 hours)
  const longDays = sessions.filter(s => s.totalWorkMinutes > 540).length;
  if (longDays >= 5) { burnoutScore += 30; factors.push({ factor: 'Extended work hours', severity: 'high', detail: `${longDays} days with 9+ hour sessions` }); }
  else if (longDays >= 3) { burnoutScore += 15; factors.push({ factor: 'Extended work hours', severity: 'medium', detail: `${longDays} days with 9+ hour sessions` }); }

  // Factor 2: Insufficient breaks
  const poorBreakDays = sessions.filter(s => s.totalBreakMinutes < 30 && s.totalWorkMinutes > 240).length;
  if (poorBreakDays >= 3) { burnoutScore += 25; factors.push({ factor: 'Insufficient breaks', severity: 'high', detail: `${poorBreakDays} days with less than 30 min breaks` }); }
  else if (poorBreakDays >= 1) { burnoutScore += 10; factors.push({ factor: 'Insufficient breaks', severity: 'medium', detail: `${poorBreakDays} days with less than 30 min breaks` }); }

  // Factor 3: Declining productivity trend
  if (sessions.length >= 5) {
    const recent = sessions.slice(0, 3).map(s => s.productivityScore || 50);
    const older = sessions.slice(3, 7).map(s => s.productivityScore || 50);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    if (recentAvg < olderAvg - 20) { burnoutScore += 20; factors.push({ factor: 'Declining productivity', severity: 'high', detail: `Productivity dropped by ${Math.round(olderAvg - recentAvg)} points` }); }
    else if (recentAvg < olderAvg - 10) { burnoutScore += 10; factors.push({ factor: 'Declining productivity', severity: 'medium', detail: `Slight productivity decline detected` }); }
  }

  // Factor 4: High stress levels
  const stressSessions = sessions.filter(s => s.stressLevel >= 4);
  if (stressSessions.length >= 3) { burnoutScore += 20; factors.push({ factor: 'Elevated stress levels', severity: 'high', detail: `${stressSessions.length} sessions with high stress` }); }

  // Factor 5: Low energy patterns
  const lowEnergySessions = sessions.filter(s => s.energyLevel <= 2);
  if (lowEnergySessions.length >= 3) { burnoutScore += 15; factors.push({ factor: 'Low energy levels', severity: 'medium', detail: `${lowEnergySessions.length} sessions with low energy` }); }

  // Factor 6: Weekend work
  const weekendWork = sessions.filter(s => {
    const day = new Date(s.date).getDay();
    return (day === 0 || day === 6) && s.totalWorkMinutes > 60;
  }).length;
  if (weekendWork >= 2) { burnoutScore += 10; factors.push({ factor: 'Working on weekends', severity: 'low', detail: `${weekendWork} weekend sessions detected` }); }

  burnoutScore = Math.min(burnoutScore, 100);
  let riskLevel = 'low';
  if (burnoutScore >= 70) riskLevel = 'critical';
  else if (burnoutScore >= 50) riskLevel = 'high';
  else if (burnoutScore >= 25) riskLevel = 'moderate';

  const recommendations = generateBurnoutRecommendations(riskLevel, factors);
  return { riskLevel, score: burnoutScore, factors, recommendations };
}

function generateBurnoutRecommendations(riskLevel, factors) {
  const recs = [];
  const factorNames = factors.map(f => f.factor);

  if (factorNames.includes('Extended work hours')) {
    recs.push('Set a strict end-of-work time and honor it daily. Use time-blocking to prevent overruns.');
  }
  if (factorNames.includes('Insufficient breaks')) {
    recs.push('Schedule the Pomodoro technique: 25 minutes focused work, 5-minute break. Take a longer 30-min break after 4 cycles.');
  }
  if (factorNames.includes('Declining productivity')) {
    recs.push('Review your task list and eliminate low-priority work. Focus on high-impact tasks only.');
  }
  if (factorNames.includes('Elevated stress levels')) {
    recs.push('Practice 5-minute mindfulness or breathing exercises. Consider speaking with a wellness professional.');
  }
  if (factorNames.includes('Low energy levels')) {
    recs.push('Evaluate your sleep schedule and nutrition. Consider a lighter workload for the next few days.');
  }
  if (riskLevel === 'critical') {
    recs.unshift('⚠️ Critical burnout risk detected. Consider taking a full day off and discussing workload with your manager.');
  }
  if (recs.length === 0) {
    recs.push('Keep up the great work! Your work-life balance looks healthy.');
    recs.push('Consider setting stretch goals to further boost your productivity.');
  }
  return recs;
}

/**
 * Generate AI-powered productivity insights
 */
function generateInsights(sessions, tasks, user) {
  const insights = [];

  if (sessions.length === 0) return { insights, score: 0, summary: 'No data yet. Start tracking to get insights!' };

  // Calculate averages
  const avgProductivity = sessions.reduce((a, s) => a + (s.productivityScore || 0), 0) / sessions.length;
  const avgFocus = sessions.reduce((a, s) => a + (s.focusScore || 0), 0) / sessions.length;
  const avgWorkHours = sessions.reduce((a, s) => a + s.totalWorkMinutes, 0) / sessions.length / 60;

  // Peak productivity time analysis
  const morningScore = sessions.filter(s => {
    const h = new Date(s.startTime).getHours();
    return h >= 6 && h < 12;
  }).reduce((a, s) => a + (s.productivityScore || 0), 0);
  const afternoonScore = sessions.filter(s => {
    const h = new Date(s.startTime).getHours();
    return h >= 12 && h < 18;
  }).reduce((a, s) => a + (s.productivityScore || 0), 0);

  if (morningScore > afternoonScore) {
    insights.push({ type: 'peak_time', icon: '🌅', title: 'Morning Person', message: 'You are most productive in the mornings. Schedule your most important tasks before noon.', impact: 'high' });
  } else {
    insights.push({ type: 'peak_time', icon: '☀️', title: 'Afternoon Peak', message: 'Your productivity peaks in the afternoon. Save complex tasks for after lunch.', impact: 'medium' });
  }

  // Task completion rate
  if (tasks.length > 0) {
    const completionRate = (tasks.filter(t => t.status === 'completed').length / tasks.length * 100).toFixed(0);
    if (completionRate >= 80) {
      insights.push({ type: 'tasks', icon: '✅', title: 'High Completion Rate', message: `Excellent! You complete ${completionRate}% of your tasks. Keep setting realistic goals.`, impact: 'positive' });
    } else if (completionRate < 50) {
      insights.push({ type: 'tasks', icon: '⚠️', title: 'Low Completion Rate', message: `Only ${completionRate}% completion rate. Try breaking tasks into smaller sub-tasks.`, impact: 'high' });
    }
  }

  // Focus trend
  if (avgFocus < 50) {
    insights.push({ type: 'focus', icon: '🎯', title: 'Focus Improvement Needed', message: 'Your average focus score is below 50. Try eliminating distractions and using focus modes.', impact: 'high' });
  } else if (avgFocus >= 75) {
    insights.push({ type: 'focus', icon: '🎯', title: 'Excellent Focus', message: `Your average focus score is ${avgFocus.toFixed(0)}! You maintain great concentration.`, impact: 'positive' });
  }

  // Work hours balance
  if (avgWorkHours > 9) {
    insights.push({ type: 'balance', icon: '⚖️', title: 'Overworking Detected', message: `You average ${avgWorkHours.toFixed(1)} hours/day. Aim for 7-8 hours for sustainable productivity.`, impact: 'high' });
  } else if (avgWorkHours >= 7 && avgWorkHours <= 8) {
    insights.push({ type: 'balance', icon: '⚖️', title: 'Healthy Work Hours', message: `Your ${avgWorkHours.toFixed(1)} avg daily hours is ideal for long-term productivity.`, impact: 'positive' });
  }

  // Streak analysis
  if (user.productivity && user.productivity.streakDays >= 7) {
    insights.push({ type: 'streak', icon: '🔥', title: `${user.productivity.streakDays}-Day Streak!`, message: 'Amazing consistency! You have been productive for over a week straight.', impact: 'positive' });
  }

  return {
    insights,
    score: Math.round(avgProductivity),
    summary: avgProductivity >= 70
      ? 'Great productivity! You are performing above average.'
      : avgProductivity >= 50
        ? 'Decent productivity with room for improvement.'
        : 'Your productivity needs attention. Review the insights below.'
  };
}

/**
 * Analyze work behavioral patterns
 */
function analyzeWorkPatterns(activities) {
  if (!activities || activities.length === 0) {
    return { patterns: [], hourlyDistribution: [], categoryBreakdown: [] };
  }

  // Hourly distribution
  const hourlyData = Array(24).fill(0);
  activities.forEach(a => {
    const hour = new Date(a.startTime).getHours();
    hourlyData[hour] += a.duration || 0;
  });

  const hourlyDistribution = hourlyData.map((duration, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, '0')}:00`,
    duration: Math.round(duration / 60),
    productivity: duration > 0 ? Math.min(100, Math.round((duration / 3600) * 50)) : 0
  }));

  // Category breakdown
  const categoryData = {};
  activities.forEach(a => {
    const cat = a.category || 'neutral';
    categoryData[cat] = (categoryData[cat] || 0) + (a.duration || 0);
  });

  const total = Object.values(categoryData).reduce((a, b) => a + b, 0);
  const categoryBreakdown = Object.entries(categoryData).map(([name, duration]) => ({
    name,
    duration: Math.round(duration / 60),
    percentage: total > 0 ? Math.round((duration / total) * 100) : 0
  })).sort((a, b) => b.duration - a.duration);

  // Identify patterns
  const patterns = [];
  const peakHour = hourlyData.indexOf(Math.max(...hourlyData));
  if (peakHour !== -1) {
    patterns.push({
      type: 'peak_hour',
      title: `Peak Activity at ${peakHour}:00`,
      description: `You are most active around ${peakHour}:00. Schedule deep work during this time.`
    });
  }

  const distractingPct = categoryBreakdown.find(c => c.name === 'distracting')?.percentage || 0;
  if (distractingPct > 25) {
    patterns.push({
      type: 'distraction',
      title: 'High Distraction Rate',
      description: `${distractingPct}% of activity time is spent on distracting apps. Consider website blockers during focus sessions.`
    });
  }

  return { patterns, hourlyDistribution, categoryBreakdown };
}

/**
 * Generate weekly performance report
 */
function generateWeeklyReport(sessions, tasks, user) {
  const totalWorkMinutes = sessions.reduce((a, s) => a + s.totalWorkMinutes, 0);
  const totalBreakMinutes = sessions.reduce((a, s) => a + s.totalBreakMinutes, 0);
  const avgProductivity = sessions.length > 0
    ? sessions.reduce((a, s) => a + (s.productivityScore || 0), 0) / sessions.length : 0;
  const avgFocus = sessions.length > 0
    ? sessions.reduce((a, s) => a + (s.focusScore || 0), 0) / sessions.length : 0;
  const burnoutRisk = analyzeBurnoutRisk(sessions);

  const bestDay = sessions.reduce((best, s) => {
    return (!best || s.productivityScore > best.productivityScore) ? s : best;
  }, null);

  const dailyBreakdown = sessions.map(s => ({
    date: s.date,
    workHours: parseFloat((s.totalWorkMinutes / 60).toFixed(1)),
    productivity: s.productivityScore,
    focus: s.focusScore,
    tasks: s.tasksCompleted,
    burnout: s.burnoutScore
  }));

  return {
    period: 'This Week',
    summary: {
      totalWorkHours: parseFloat((totalWorkMinutes / 60).toFixed(1)),
      totalBreakHours: parseFloat((totalBreakMinutes / 60).toFixed(1)),
      avgProductivityScore: Math.round(avgProductivity),
      avgFocusScore: Math.round(avgFocus),
      tasksCompleted: tasks.length,
      workDays: sessions.length,
      burnoutRisk: burnoutRisk.riskLevel
    },
    bestDay: bestDay ? { date: bestDay.date, score: bestDay.productivityScore } : null,
    dailyBreakdown,
    burnoutAnalysis: burnoutRisk,
    achievements: generateAchievements(sessions, tasks, user),
    nextWeekGoals: generateNextWeekGoals(sessions, tasks)
  };
}

function generateAchievements(sessions, tasks, user) {
  const achievements = [];
  if (tasks.length >= 10) achievements.push({ icon: '🏆', title: 'Task Champion', desc: `Completed ${tasks.length} tasks this week` });
  if (sessions.some(s => s.productivityScore >= 90)) achievements.push({ icon: '⚡', title: 'Peak Performer', desc: 'Achieved 90+ productivity score' });
  if (sessions.length >= 5) achievements.push({ icon: '📅', title: 'Consistent Worker', desc: 'Worked 5+ days this week' });
  const avgFocus = sessions.reduce((a, s) => a + (s.focusScore || 0), 0) / (sessions.length || 1);
  if (avgFocus >= 80) achievements.push({ icon: '🎯', title: 'Focus Master', desc: 'Maintained 80+ focus score' });
  return achievements;
}

function generateNextWeekGoals(sessions, tasks) {
  const goals = [];
  const avgWork = sessions.reduce((a, s) => a + s.totalWorkMinutes, 0) / (sessions.length * 60 || 1);
  if (avgWork > 9) goals.push('Aim to finish work by 6 PM every day');
  if (tasks.length < 5) goals.push('Complete at least 5 meaningful tasks');
  goals.push('Take a 15-minute break every 90 minutes');
  goals.push('Log your mood and energy levels daily for better insights');
  return goals;
}

/**
 * Calculate productivity score from session data
 */
function calculateProductivityScore(sessionData) {
  const { totalWorkMinutes, totalBreakMinutes, tasksCompleted, focusScore, stressLevel, energyLevel } = sessionData;
  let score = 50;

  // Work hours contribution (ideal: 7-8h)
  const workHours = totalWorkMinutes / 60;
  if (workHours >= 7 && workHours <= 8) score += 20;
  else if (workHours >= 6 && workHours < 7) score += 10;
  else if (workHours > 8 && workHours <= 9) score += 10;
  else if (workHours > 9) score -= 10;

  // Break contribution
  const breakRatio = totalBreakMinutes / (totalWorkMinutes || 1);
  if (breakRatio >= 0.1 && breakRatio <= 0.2) score += 10;
  else if (breakRatio < 0.05) score -= 15;

  // Task completion
  score += Math.min(tasksCompleted * 3, 15);

  // Focus score
  if (focusScore) score += (focusScore - 50) * 0.2;

  // Wellness factors
  if (energyLevel) score += (energyLevel - 3) * 3;
  if (stressLevel) score -= (stressLevel - 3) * 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = {
  analyzeBurnoutRisk,
  generateInsights,
  analyzeWorkPatterns,
  generateWeeklyReport,
  calculateProductivityScore
};
