const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  settings: {
    workStartTime: { type: String, default: '09:00' },
    workEndTime: { type: String, default: '17:00' },
    breakInterval: { type: Number, default: 90 },
    breakDuration: { type: Number, default: 15 },
    dailyGoalHours: { type: Number, default: 8 },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      burnoutAlerts: { type: Boolean, default: true },
      breakReminders: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: true }
    },
    timezone: { type: String, default: 'UTC' }
  },
  productivity: {
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    totalTasksCompleted: { type: Number, default: 0 },
    totalWorkHours: { type: Number, default: 0 },
    averageProductivityScore: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
