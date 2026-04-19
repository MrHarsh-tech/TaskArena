const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/quick-play', require('./routes/quickPlay'));
app.use('/api/learning-paths', require('./routes/paths'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

const path = require('path');

// --------------------------
// Default Error Handler
// --------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

// --------------------------
// Serve Frontend in Production
// --------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskarena')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
