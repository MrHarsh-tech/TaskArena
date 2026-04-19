const LearningPath = require('../models/LearningPath');

const getLearningPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ isPublished: true })
      .populate('creator', 'name avatarUrl')
      .populate('steps.challenge', 'title difficulty')
      .sort({ createdAt: -1 });
      
    res.json(paths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPathById = async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id)
      .populate('creator', 'name avatarUrl')
      .populate('steps.challenge', 'title difficulty description maxAttempts');
      
    if (!path) {
      return res.status(404).json({ message: 'Learning Path not found' });
    }
    
    res.json(path);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLearningPaths,
  getPathById
};
