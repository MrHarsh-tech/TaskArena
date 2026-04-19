const express = require('express');
const router = express.Router();
const { getMysteryChallenge } = require('../controllers/quickPlayController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMysteryChallenge);

module.exports = router;
