const Notification = require('../models/Notification');
const WorkSession = require('../models/WorkSession');
const User = require('../models/User');
const aiAnalytics = require('./aiAnalyticsService');

const TIPS = [
  'Try the Pomodoro Technique: 25 min work, 5 min break for better focus.',
  'Drinking water regularly boosts cognitive function by up to 14%.',
  'Physical movement during breaks improves focus and reduces fatigue.',
  'Clear your workspace before starting — a tidy space equals a tidy mind.',
  'The most productive people work in 90-minute focus blocks.',
  'Turn off notifications during deep work sessions for better concentration.',
  'Writing down tomorrow\'s 3 key tasks before bed improves morning productivity.',
  'Batch similar tasks together to reduce mental context-switching.',
];

async function createNotification(userId, type, title, message, priority = 'medium', metadata = {}) {
  try {
    const notification = new Notification({
      user: userId, type, title, message, priority, metadata, sentAt: new Date()
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

async function checkAndSendReminders(io) {
  try {
    const users = await User.find({ 'settings.notifications.breakReminders': true });

    for (const user of users) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const session = await WorkSession.findOne({ user: user._id, date: today });

      if (!session) continue;

      const now = new Date();
      const workMinutesSinceBreak = session.breaks.length > 0
        ? (now - new Date(session.breaks[session.breaks.length - 1].endTime)) / 60000
        : session.totalWorkMinutes;

      // Break reminder
      if (workMinutesSinceBreak >= (user.settings.breakInterval || 90)) {
        const notification = await createNotification(
          user._id, 'break_reminder',
          '🕐 Time for a Break!',
          `You've been working for ${Math.round(workMinutesSinceBreak)} minutes. Take a ${user.settings.breakDuration || 15}-minute break to recharge.`,
          'medium', { workMinutes: workMinutesSinceBreak }
        );
        if (notification && io) {
          io.to(user._id.toString()).emit('new_notification', notification);
        }
      }

      // Burnout check
      if (user.settings.notifications.burnoutAlerts) {
        const sessions = await WorkSession.find({ user: user._id }).sort({ date: -1 }).limit(7);
        const burnoutAnalysis = aiAnalytics.analyzeBurnoutRisk(sessions);

        if (burnoutAnalysis.riskLevel === 'high' || burnoutAnalysis.riskLevel === 'critical') {
          const recentBurnoutNotif = await Notification.findOne({
            user: user._id,
            type: 'burnout_alert',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          });

          if (!recentBurnoutNotif) {
            const notification = await createNotification(
              user._id, 'burnout_alert',
              `⚠️ ${burnoutAnalysis.riskLevel === 'critical' ? 'Critical' : 'High'} Burnout Risk Detected`,
              `Your burnout score is ${burnoutAnalysis.score}/100. ${burnoutAnalysis.recommendations[0]}`,
              burnoutAnalysis.riskLevel === 'critical' ? 'critical' : 'high',
              { burnoutScore: burnoutAnalysis.score, riskLevel: burnoutAnalysis.riskLevel }
            );
            if (notification && io) {
              io.to(user._id.toString()).emit('new_notification', notification);
            }
          }
        }
      }

      // Random productivity tip
      if (Math.random() < 0.1) {
        const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
        const notification = await createNotification(
          user._id, 'productivity_tip', '💡 Productivity Tip', tip, 'low'
        );
        if (notification && io) {
          io.to(user._id.toString()).emit('new_notification', notification);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}

async function sendDailyDigest(io) {
  try {
    const users = await User.find({ 'settings.notifications.dailyDigest': true });

    for (const user of users) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const session = await WorkSession.findOne({ user: user._id, date: yesterday });
      if (!session) continue;

      const message = `Yesterday: ${(session.totalWorkMinutes / 60).toFixed(1)}h worked, ` +
        `${session.tasksCompleted} tasks completed, ` +
        `Productivity: ${session.productivityScore}/100. ` +
        `Have a productive day today!`;

      const notification = await createNotification(
        user._id, 'daily_digest', '📊 Your Daily Digest', message, 'low',
        { sessionId: session._id }
      );

      if (notification && io) {
        io.to(user._id.toString()).emit('new_notification', notification);
      }
    }
  } catch (error) {
    console.error('Error in sendDailyDigest:', error);
  }
}

module.exports = { createNotification, checkAndSendReminders, sendDailyDigest };
