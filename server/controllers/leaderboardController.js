const User = require('../models/User');
const Progress = require('../models/Progress');
const Attempt = require('../models/Attempt');

const getLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.query;

    if (challengeId) {
      // Per-challenge leaderboard: get best attempt per user for this challenge
      const attempts = await Attempt.find({ challenge: challengeId, completedAt: { $ne: null } })
        .populate('user', 'name avatarUrl xpPoints level')
        .sort({ percentage: -1, timeTakenSeconds: 1 })
        .lean();

      // Deduplicate: keep only the highest score per user
      const dedupedMap = new Map();
      for (const a of attempts) {
        const uid = a.user._id.toString();
        if (!dedupedMap.has(uid) || a.percentage > dedupedMap.get(uid).percentage) {
          dedupedMap.set(uid, a);
        }
      }

      const leaderboard = Array.from(dedupedMap.values())
        .map((a, i) => ({
          rank: i + 1,
          userId: a.user._id,
          name: a.user.name,
          avatarUrl: a.user.avatarUrl,
          level: a.user.level,
          xpPoints: a.user.xpPoints,
          score: a.percentage,
          timeTaken: a.timeTakenSeconds,
        }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        })
        .slice(0, 50);

      // Re-apply ranks after sorting
      res.json(leaderboard.map((lb, i) => ({ ...lb, rank: i + 1 })));

    } else {
      // Global Leaderboard
      const progresses = await Progress.find()
        .populate('user', 'name avatarUrl xpPoints level isActive')
        .lean();

      const activeUsers = progresses.filter(p => p.user && p.user.isActive);

      const leaderboard = activeUsers.map(p => ({
        userId: p.user._id,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl,
        level: p.user.level,
        xpPoints: p.user.xpPoints,
        challengesCompleted: p.challengesCompleted || 0,
        averageScore: p.averageScore || 0,
        currentStreak: p.currentStreak || 0,
      }))
      .sort((a, b) => b.xpPoints - a.xpPoints)
      .map((user, i) => ({ ...user, rank: i + 1 }))
      .slice(0, 50);

      res.json(leaderboard);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaderboard
};
