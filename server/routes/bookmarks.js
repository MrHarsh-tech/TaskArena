const express = require('express');
const router = express.Router();
const { getBookmarks, getBookmarkStatuses, toggleBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBookmarks);
router.get('/statuses', protect, getBookmarkStatuses);
router.post('/:challengeId', protect, toggleBookmark);

module.exports = router;
