const express = require('express');
const router = express.Router();
const { getLearningPaths, getPathById } = require('../controllers/pathsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getLearningPaths);
router.get('/:id', protect, getPathById);

module.exports = router;
