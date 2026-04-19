const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  challengesCompleted: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalTimeSpentSeconds: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', ProgressSchema);
