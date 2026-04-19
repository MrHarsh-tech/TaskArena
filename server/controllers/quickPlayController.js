const Challenge = require('../models/Challenge');

const getMysteryChallenge = async (req, res) => {
  try {
    const count = await Challenge.countDocuments({ isPublished: true });
    
    if (count === 0) {
      return res.status(404).json({ message: 'No active challenges found for Quick Play.' });
    }

    const random = Math.floor(Math.random() * count);
    const challenge = await Challenge.findOne({ isPublished: true }).skip(random).populate('creator', 'name avatarUrl');
    
    res.json(challenge);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMysteryChallenge
};
