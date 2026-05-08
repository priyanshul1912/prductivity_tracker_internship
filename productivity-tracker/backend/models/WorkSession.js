const mongoose = require('mongoose');

const workSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  totalWorkMinutes: { type: Number, default: 0 },
  totalBreakMinutes: { type: Number, default: 0 },
  totalIdleMinutes: { type: Number, default: 0 },
  focusScore: { type: Number, min: 0, max: 100, default: 0 },
  productivityScore: { type: Number, min: 0, max: 100, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number,
    type: { type: String, enum: ['short', 'long', 'lunch'], default: 'short' }
  }],
  moodRating: { type: Number, min: 1, max: 5 },
  energyLevel: { type: Number, min: 1, max: 5 },
  stressLevel: { type: Number, min: 1, max: 5 },
  notes: { type: String, default: '' },
  burnoutRisk: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low' },
  burnoutScore: { type: Number, min: 0, max: 100, default: 0 },
  appUsage: [{
    appName: String,
    duration: Number,
    category: { type: String, enum: ['productive', 'neutral', 'distracting'] }
  }]
}, { timestamps: true });

workSessionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WorkSession', workSessionSchema);
