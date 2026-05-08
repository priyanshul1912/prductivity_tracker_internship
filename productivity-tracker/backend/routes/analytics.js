const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkSession = require('../models/WorkSession');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const aiAnalytics = require('../services/aiAnalyticsService');

// Get productivity trends
router.get('/trends', auth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '30d' ? 30 : period === '14d' ? 14 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sessions = await WorkSession.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const trends = sessions.map(s => ({
      date: s.date,
      productivityScore: s.productivityScore,
      focusScore: s.focusScore,
      workHours: s.totalWorkMinutes / 60,
      breakMinutes: s.totalBreakMinutes,
      tasksCompleted: s.tasksCompleted,
      burnoutRisk: s.burnoutRisk,
      burnoutScore: s.burnoutScore,
      mood: s.moodRating,
      energy: s.energyLevel,
      stress: s.stressLevel
    }));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get burnout analysis
router.get('/burnout', auth, async (req, res) => {
  try {
    const sessions = await WorkSession.find({ user: req.user._id })
      .sort({ date: -1 }).limit(14);

    const analysis = aiAnalytics.analyzeBurnoutRisk(sessions);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get productivity insights
router.get('/insights', auth, async (req, res) => {
  try {
    const sessions = await WorkSession.find({ user: req.user._id })
      .sort({ date: -1 }).limit(30);
    const tasks = await Task.find({ user: req.user._id, status: 'completed' })
      .sort({ completedAt: -1 }).limit(50);

    const insights = aiAnalytics.generateInsights(sessions, tasks, req.user);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get work pattern analysis
router.get('/patterns', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ startTime: -1 }).limit(500);

    const patterns = aiAnalytics.analyzeWorkPatterns(activities);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get weekly report
router.get('/weekly-report', auth, async (req, res) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [sessions, tasks] = await Promise.all([
      WorkSession.find({ user: req.user._id, date: { $gte: startOfWeek } }),
      Task.find({ user: req.user._id, completedAt: { $gte: startOfWeek } })
    ]);

    const report = aiAnalytics.generateWeeklyReport(sessions, tasks, req.user);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
