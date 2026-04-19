import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/dashboard/student-analytics — detailed student progress
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all completed attempts with challenge info
    const attempts = await prisma.attempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    // Score Trend (last 10 attempts)
    const scoreTrend = attempts.slice(0, 10).reverse().map((a) => ({
      date: a.completedAt?.toISOString() || a.startedAt.toISOString(),
      score: Math.round(a.percentage * 10) / 10,
      title: a.challenge.title,
    }));

    // Category Performance
    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const a of attempts) {
      const cat = a.challenge.category?.name || "Uncategorized";
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
    const difficultyMap = new Map<string, { total: number; count: number }>();
    for (const a of attempts) {
      const diff = a.challenge.difficulty;
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

    // Time Spent
    const progress = await prisma.progress.findUnique({ where: { userId } });
    const totalSeconds = progress?.totalTimeSpentSeconds || 0;
    const avgPerChallenge =
      attempts.length > 0 ? Math.round(totalSeconds / attempts.length) : 0;

    // Strengths & Weaknesses (top/bottom 3 categories)
    const sorted = [...categoryPerformance].sort(
      (a, b) => b.avgScore - a.avgScore
    );
    const strengths = sorted.slice(0, 3);
    const weaknesses = sorted.slice(-3).reverse();

    // Completion Rate
    const allAttempts = await prisma.attempt.findMany({
      where: { userId },
      select: { completedAt: true },
    });
    const completed = allAttempts.filter((a) => a.completedAt !== null).length;
    const abandoned = allAttempts.length - completed;

    // Weekly Activity (last 28 days)
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    const recentAttempts = await prisma.attempt.findMany({
      where: { userId, startedAt: { gte: twentyEightDaysAgo } },
      select: { startedAt: true },
    });

    const activityMap = new Map<string, number>();
    for (let i = 0; i < 28; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activityMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const a of recentAttempts) {
      const key = a.startedAt.toISOString().slice(0, 10);
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    }
    const weeklyActivity = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
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
    console.error("GET /api/dashboard/student-analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student analytics" },
      { status: 500 }
    );
  }
}
