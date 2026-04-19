const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], default: 'STUDENT' },
  avatarUrl: { type: String, default: null },
  bio: { type: String, default: null },
  xpPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastLoginAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
