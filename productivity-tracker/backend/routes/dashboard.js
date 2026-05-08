const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkSession = require('../models/WorkSession');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// Get full dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      todaySession,
      taskStats,
      recentActivities,
      weekSessions,
      unreadNotifications,
      appUsage
    ] = await Promise.all([
      WorkSession.findOne({ user: req.user._id, date: today }),
      Task.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Activity.find({ user: req.user._id }).sort({ startTime: -1 }).limit(10),
      WorkSession.find({ user: req.user._id, date: { $gte: weekAgo } }).sort({ date: 1 }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
      Activity.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'app_usage',
            startTime: { $gte: today }
          }
        },
        {
          $group: {
            _id: '$name',
            totalDuration: { $sum: '$duration' },
            category: { $first: '$category' }
          }
        },
        { $sort: { totalDuration: -1 } },
        { $limit: 5 }
      ])
    ]);

    const taskSummary = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
    taskStats.forEach(t => { taskSummary[t._id] = t.count; });

    const weeklyData = weekSessions.map(s => ({
      date: s.date,
      productivity: s.productivityScore,
      focus: s.focusScore,
      hours: parseFloat((s.totalWorkMinutes / 60).toFixed(1)),
      burnout: s.burnoutScore
    }));

    res.json({
      user: req.user,
      todaySession,
      taskSummary,
      recentActivities,
      weeklyData,
      unreadNotifications,
      appUsage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
