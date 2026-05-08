const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'learning', 'creative', 'other'],
    default: 'work'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  dueDate: { type: Date },
  estimatedDuration: { type: Number, default: 60 }, // in minutes
  actualDuration: { type: Number, default: 0 },
  tags: [{ type: String }],
  completedAt: { type: Date },
  focusScore: { type: Number, min: 0, max: 100, default: 0 },
  distractions: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }]
}, { timestamps: true });

taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
