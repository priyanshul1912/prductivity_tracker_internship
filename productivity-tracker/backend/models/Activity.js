const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['app_usage', 'website_visit', 'task_work', 'break', 'meeting', 'idle', 'focus_session'],
    required: true
  },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['productive', 'neutral', 'distracting', 'break'],
    default: 'neutral'
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
  metadata: {
    appName: String,
    url: String,
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    windowTitle: String
  },
  productivityScore: { type: Number, min: 0, max: 100, default: 50 }
}, { timestamps: true });

activitySchema.index({ user: 1, startTime: -1 });
activitySchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
