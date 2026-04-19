const Bookmark = require('../models/Bookmark');
const Challenge = require('../models/Challenge');

const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'challenge',
        populate: { path: 'creator', select: 'name avatarUrl' }
      })
      .sort({ createdAt: -1 });
    
    // Extract just the challenges for the response to match the shape the frontend expects
    const challenges = bookmarks.map(b => b.challenge).filter(c => c !== null);
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookmarkStatuses = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).select('challenge');
    const bookmarkedChallengeIds = bookmarks.map(b => b.challenge.toString());
    res.json(bookmarkedChallengeIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const existingBookmark = await Bookmark.findOne({ user: userId, challenge: challengeId });

    if (existingBookmark) {
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      res.json({ message: 'Bookmark removed', isBookmarked: false });
    } else {
      await Bookmark.create({ user: userId, challenge: challengeId });
      res.status(201).json({ message: 'Bookmark added', isBookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBookmarks, toggleBookmark, getBookmarkStatuses };
