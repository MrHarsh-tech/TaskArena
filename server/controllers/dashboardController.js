const Progress = require('../models/Progress');
const Attempt = require('../models/Attempt');
const Challenge = require('../models/Challenge');

const getDashboardStats = async (req, res) => {
  try {
    // Auto-create progress if it doesn't exist (new users)
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id });
    }

    const recentAttempts = await Attempt.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('challenge', 'title difficulty');

    res.json({
      stats: {
        xpPoints: req.user.xpPoints || 0,
        level: req.user.level || 1,
        completedChallenges: progress.challengesCompleted || 0,
        totalAttempts: progress.totalAttempts || 0,
        averageScore: Math.round((progress.averageScore || 0) * 10) / 10,
        currentStreak: progress.currentStreak || 0,
        longestStreak: progress.longestStreak || 0,
        totalTimeSpentSeconds: progress.totalTimeSpentSeconds || 0,
        lastActiveAt: progress.lastActiveAt || null,
      },
      recentAttempts
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/student-analytics
const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await Attempt.find({ user: userId, completedAt: { $ne: null } })
      .populate({
        path: 'challenge',
        select: 'title difficulty category',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ completedAt: -1 });

    // Score Trend (last 10 attempts, reversed to chronological)
    const scoreTrend = attempts.slice(0, 10).reverse().map(a => ({
      date: a.completedAt?.toISOString() || a.createdAt.toISOString(),
      score: Math.round(a.percentage * 10) / 10,
      title: a.challenge?.title || 'Unknown'
    }));

    // Category Performance
    const categoryMap = new Map();
    for (const a of attempts) {
      const cat = a.challenge?.category?.name || 'Uncategorized';
      const existing = categoryMap.get(cat) || { total: 0, count: 0 };
      existing.total += a.percentage;
      existing.count += 1;
      categoryMap.set(cat, existing);
    }
    const categoryPerformance = Array.from(categoryMap.entries()).map(
      ([category, { total, count }]) => ({
        category,
        avgScore: Math.round((total / count) * 10) / 10,
        attempts: count,
      })
    );

    // Difficulty Breakdown
    const difficultyMap = new Map();
    for (const a of attempts) {
      const diff = a.challenge?.difficulty || 'MEDIUM';
      const existing = difficultyMap.get(diff) || { total: 0, count: 0 };
      existing.total += a.percentage;
      existing.count += 1;
      difficultyMap.set(diff, existing);
    }
    const difficultyBreakdown = Array.from(difficultyMap.entries()).map(
      ([difficulty, { total, count }]) => ({
        difficulty,
        avgScore: Math.round((total / count) * 10) / 10,
        count,
      })
    );

    // Progress stats
    const progress = await Progress.findOne({ user: userId });
    const totalSeconds = progress?.totalTimeSpentSeconds || 0;
    const avgPerChallenge = attempts.length > 0 ? Math.round(totalSeconds / attempts.length) : 0;

    // Strengths & Weaknesses (top/bottom 3 categories)
    const sorted = [...categoryPerformance].sort((a, b) => b.avgScore - a.avgScore);
    const strengths = sorted.slice(0, 3);
    const weaknesses = sorted.slice(-3).reverse();

    // Completion Rate
    const allAttempts = await Attempt.find({ user: userId }).select('completedAt');
    const completed = allAttempts.filter(a => a.completedAt !== null).length;
    const abandoned = allAttempts.length - completed;

    // Weekly Activity (last 28 days)
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    const recentAttempts = await Attempt.find({
      user: userId,
      createdAt: { $gte: twentyEightDaysAgo }
    }).select('createdAt');

    const activityMap = new Map();
    for (let i = 0; i < 28; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activityMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const a of recentAttempts) {
      const key = a.createdAt.toISOString().slice(0, 10);
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    }
    const weeklyActivity = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      scoreTrend,
      categoryPerformance,
      difficultyBreakdown,
      timeSpent: { totalSeconds, avgPerChallenge },
      strengths,
      weaknesses,
      completionRate: { completed, abandoned },
      weeklyActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/instructor-analytics
const getInstructorAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized as instructor' });
    }

    const Question = require('../models/Question');
    const instructorId = req.user._id;

    const challenges = await Challenge.find({
      creator: instructorId,
      archivedAt: null
    }).lean();

    const challengeIds = challenges.map(c => c._id);

    const allAttempts = await Attempt.find({
      challenge: { $in: challengeIds },
      completedAt: { $ne: null }
    }).lean();

    const totalChallenges = challenges.length;
    const totalAttemptsReceived = allAttempts.length;
    const uniqueStudents = new Set(allAttempts.map(a => a.user.toString()));
    const totalStudentsReached = uniqueStudents.size;
    const passingAttempts = allAttempts.filter(a => a.percentage >= 60).length;
    const averagePassRate = totalAttemptsReceived > 0
      ? Math.round((passingAttempts / totalAttemptsReceived) * 1000) / 10
      : 0;

    // Challenge Performance
    const challengePerformance = await Promise.all(challenges.map(async (c) => {
      const attempts = allAttempts.filter(a => a.challenge.toString() === c._id.toString());
      const avgScore = attempts.length > 0
        ? Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) * 10) / 10
        : 0;
      const passRate = attempts.length > 0
        ? Math.round((attempts.filter(a => a.percentage >= 60).length / attempts.length) * 1000) / 10
        : 0;
      return { id: c._id, title: c.title, attempts: attempts.length, avgScore, passRate };
    }));

    // Score Distribution
    const buckets = ['0-20', '20-40', '40-60', '60-80', '80-100'];
    const scoreDistribution = buckets.map(bucket => {
      const [min, max] = bucket.split('-').map(Number);
      const count = allAttempts.filter(a =>
        a.percentage >= min && a.percentage < (max === 100 ? 101 : max)
      ).length;
      return { bucket, count };
    });

    // Engagement Timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timelineMap = new Map();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      timelineMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const a of allAttempts) {
      if (new Date(a.createdAt) >= thirtyDaysAgo) {
        const key = new Date(a.createdAt).toISOString().slice(0, 10);
        timelineMap.set(key, (timelineMap.get(key) || 0) + 1);
      }
    }
    const engagementTimeline = Array.from(timelineMap.entries())
      .map(([date, attempts]) => ({ date, attempts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      overview: { totalChallenges, totalStudentsReached, averagePassRate, totalAttemptsReceived },
      challengePerformance,
      scoreDistribution,
      engagementTimeline,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getStudentAnalytics,
  getInstructorAnalytics
};
