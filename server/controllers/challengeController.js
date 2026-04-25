const Challenge = require('../models/Challenge');
const Attempt = require('../models/Attempt');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Question = require('../models/Question');
const { calculateReward } = require('../services/rewardService');

const getChallenges = async (req, res) => {
  try {
    const { difficulty, search, creatorId, categoryId } = req.query;
    
    let query = { isPublished: true };
    
    if (creatorId) {
      query.creator = creatorId;
    }
    
    if (categoryId) {
      query.category = categoryId;
    }
    
    if (difficulty) {
      query.difficulty = difficulty.toUpperCase();
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const challenges = await Challenge.find(query)
      .populate('creator', 'name avatarUrl')
      .sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name avatarUrl');
      
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Also fetch questions
    const questions = await Question.find({ challenge: challenge._id }).sort({ orderIndex: 1 });
    res.json({ ...challenge.toObject(), questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createChallenge = async (req, res) => {
  try {
    const { title, description, difficulty, tags, isPublished, questions, categoryId } = req.body;
    
    // Validate
    if (!title || !description || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Must provide title, description, and at least one question.' });
    }

    const challenge = await Challenge.create({
      title,
      description,
      difficulty: difficulty || 'EASY',
      tags: tags || [],
      isPublished: true, // Auto publish for now
      creator: req.user.id,
      category: categoryId || null
    });
    
    // Format and inject question ids
    const questionsToInsert = questions.map((q, index) => ({
      challenge: challenge._id,
      text: q.text,
      questionType: q.questionType || 'MCQ',
      options: q.options || [],
      acceptedAnswers: q.acceptedAnswers || [],
      orderIndex: index
    }));

    await Question.insertMany(questionsToInsert);

    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const { answers, timeTakenSeconds } = req.body;
    const challengeId = req.params.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isPublished) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const questions = await Question.find({ challenge: challengeId });
    let correctCount = 0;

    const gradedAnswers = (answers || []).map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId.toString());
      let isCorrect = false;

      if (question) {
        if (question.questionType === 'FILL_IN_BLANK') {
          const userAnswer = (answer.textResponse || '').trim().toLowerCase();
          const accepted = question.acceptedAnswers.map(a => a.toLowerCase());
          isCorrect = accepted.includes(userAnswer);
        } else {
          const selectedOptionId = answer.selectedOptionId || null;
          if (selectedOptionId) {
            const selectedOption = question.options.find(o => o._id.toString() === selectedOptionId.toString());
            isCorrect = selectedOption?.isCorrect || false;
          }
        }
      }

      if (isCorrect) correctCount++;

      return {
        question: answer.questionId,
        isCorrect,
        textResponse: answer.textResponse || null,
        selectedOptionId: answer.selectedOptionId || null
      };
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const attempt = await Attempt.create({
      user: req.user._id,
      challenge: challengeId,
      score: correctCount,
      totalQuestions,
      percentage,
      timeTakenSeconds,
      completedAt: new Date(),
      answers: gradedAnswers
    });

    // Handle Progress
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id });
    }

    const allAttempts = await Attempt.find({ user: req.user._id, completedAt: { $ne: null } });
    const totalAttempts = allAttempts.length;
    const sumPercentages = allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
    const avgScore = totalAttempts > 0 ? sumPercentages / totalAttempts : 0;
    const uniqueChallengesSet = new Set(allAttempts.map(a => a.challenge.toString()));
    const challengesCompleted = uniqueChallengesSet.size;

    progress.totalAttempts = totalAttempts;
    progress.averageScore = avgScore;
    progress.challengesCompleted = challengesCompleted;

    // Only build streak on passing attempts (>= 50%)
    if (percentage >= 50) {
      progress.currentStreak += 1;
      if (progress.currentStreak > (progress.longestStreak || 0)) {
        progress.longestStreak = progress.currentStreak;
      }
    } else {
      progress.currentStreak = 0; // Reset streak on failed attempt
    }

    progress.lastActiveAt = new Date();
    await progress.save();

    // Give XP
    let baseXp = 10;
    if (percentage >= 80) baseXp += 20;
    if (percentage === 100) baseXp += 30;

    const reward = calculateReward(baseXp);
    const xpEarned = reward.finalXp;

    const user = await User.findById(req.user._id);
    user.xpPoints += xpEarned;
    user.level = Math.floor(user.xpPoints / 100) + 1;
    await user.save();

    res.status(201).json({
      attempt,
      xpEarned,
      newXp: user.xpPoints,
      newLevel: user.level,
      reward
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    let challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.creator.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this challenge' });
    }

    challenge = await Challenge.findByIdAndUpdate(challengeId, req.body, { new: true });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const archiveChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    let challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.creator.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this challenge' });
    }

    challenge.isPublished = false;
    challenge.archivedAt = new Date();
    await challenge.save();

    res.json({ message: 'Challenge archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
  submitAttempt,
  updateChallenge,
  archiveChallenge
};
