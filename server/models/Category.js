const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  iconName: {
    type: String,
    default: 'Tag'
  },
  color: {
    type: String,
    default: 'slate'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
