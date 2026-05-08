const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['break_reminder', 'burnout_alert', 'goal_achieved', 'streak_milestone',
           'daily_digest', 'task_due', 'productivity_tip', 'focus_suggestion', 'wellness_check'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  isActioned: { type: Boolean, default: false },
  actionType: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  scheduledFor: { type: Date },
  sentAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
