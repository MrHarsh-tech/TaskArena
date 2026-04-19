const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  text: { type: String, required: true },
  explanation: { type: String, default: null },
  orderIndex: { type: Number, default: 0 },
  questionType: { type: String, enum: ['MCQ', 'FILL_IN_BLANK'], default: 'MCQ' },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  acceptedAnswers: { type: [String], default: [] },
  isCaseSensitive: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', QuestionSchema);
