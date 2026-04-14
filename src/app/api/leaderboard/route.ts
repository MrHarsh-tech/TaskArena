import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/leaderboard — global or per-challenge leaderboard
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (challengeId) {
      // Per-challenge leaderboard — best score per user
      const attempts = await prisma.attempt.findMany({
        where: { challengeId, completedAt: { not: null } },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: [{ percentage: "desc" }, { completedAt: "asc" }],
      });

      // Deduplicate: keep best attempt per user
      const bestByUser = new Map<string, typeof attempts[0]>();
      for (const attempt of attempts) {
        const existing = bestByUser.get(attempt.userId);
        if (!existing || attempt.percentage > existing.percentage) {
          bestByUser.set(attempt.userId, attempt);
        }
      }

      const leaderboard = Array.from(bestByUser.values())
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, limit)
        .map((attempt, index) => ({
          rank: index + 1,
          user: attempt.user,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          completedAt: attempt.completedAt,
        }));

      return NextResponse.json(leaderboard);
    } else {
      // Global leaderboard — by average score from Progress
      const progress = await prisma.progress.findMany({
        where: { totalAttempts: { gt: 0 } },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, role: true, level: true, xpPoints: true } },
        },
        orderBy: [{ averageScore: "desc" }, { challengesCompleted: "desc" }],
        take: limit,
      });

      const leaderboard = progress.map((p, index) => ({
        rank: index + 1,
        user: p.user,
        avgScore: Math.round(p.averageScore * 10) / 10,
        totalAttempts: p.totalAttempts,
        challengesCompleted: p.challengesCompleted,
      }));

      return NextResponse.json(leaderboard);
    }
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
