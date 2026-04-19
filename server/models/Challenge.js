const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  tags: { type: [String], default: [] },
  isPublished: { type: Boolean, default: false },
  deadline: { type: Date, default: null },
  coverImageUrl: { type: String, default: null },
  timeLimit: { type: Number, default: null },
  maxAttempts: { type: Number, default: null },
  estimatedMinutes: { type: Number, default: null },
  archivedAt: { type: Date, default: null },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
