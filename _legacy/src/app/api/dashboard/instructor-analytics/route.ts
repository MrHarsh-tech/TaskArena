import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/instructor-analytics — detailed instructor analytics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const instructorId = session.user.id;

    // Get all challenges by this instructor
    const challenges = await prisma.challenge.findMany({
      where: { creatorId: instructorId, archivedAt: null },
      include: {
        questions: {
          include: {
            answers: { select: { isCorrect: true, textResponse: true } },
          },
        },
        attempts: {
          where: { completedAt: { not: null } },
          select: {
            id: true,
            userId: true,
            percentage: true,
            completedAt: true,
            startedAt: true,
            timeTakenSeconds: true,
          },
        },
      },
    });

    // Overview
    const totalChallenges = challenges.length;
    const allAttempts = challenges.flatMap((c) => c.attempts);
    const totalAttemptsReceived = allAttempts.length;
    const uniqueStudents = new Set(allAttempts.map((a) => a.userId));
    const totalStudentsReached = uniqueStudents.size;
    const passingAttempts = allAttempts.filter((a) => a.percentage >= 60).length;
    const averagePassRate =
      totalAttemptsReceived > 0
        ? Math.round((passingAttempts / totalAttemptsReceived) * 1000) / 10
        : 0;

    // Challenge Performance
    const challengePerformance = challenges.map((c) => {
      const attempts = c.attempts;
      const avgScore =
        attempts.length > 0
          ? Math.round(
              (attempts.reduce((s, a) => s + a.percentage, 0) /
                attempts.length) *
                10
            ) / 10
          : 0;
      const passRate =
        attempts.length > 0
          ? Math.round(
              (attempts.filter((a) => a.percentage >= 60).length /
                attempts.length) *
                1000
            ) / 10
          : 0;

      // Find hardest question
      let hardestQuestion = { body: "N/A", correctRate: 100 };
      for (const q of c.questions) {
        if (q.answers.length > 0) {
          const correct = q.answers.filter((a) => a.isCorrect).length;
          const rate = Math.round((correct / q.answers.length) * 1000) / 10;
          if (rate < hardestQuestion.correctRate) {
            hardestQuestion = { body: q.body.slice(0, 80), correctRate: rate };
          }
        }
      }

      return {
        id: c.id,
        title: c.title,
        attempts: attempts.length,
        avgScore,
        passRate,
        hardestQuestion,
      };
    });

    // Score Distribution (buckets: 0-20, 20-40, 40-60, 60-80, 80-100)
    const buckets = ["0-20", "20-40", "40-60", "60-80", "80-100"];
    const scoreDistribution = buckets.map((bucket) => {
      const [min, max] = bucket.split("-").map(Number);
      const count = allAttempts.filter(
        (a) => a.percentage >= min && a.percentage < (max === 100 ? 101 : max)
      ).length;
      return { bucket, count };
    });

    // Question Difficulty
    const questionDifficulty = challenges.flatMap((c) =>
      c.questions.map((q) => {
        const total = q.answers.length;
        const correct = q.answers.filter((a) => a.isCorrect).length;
        return {
          challengeId: c.id,
          challengeTitle: c.title,
          questionId: q.id,
          body: q.body.slice(0, 100),
          correctRate: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0,
          totalAnswers: total,
        };
      })
    );

    // Completion Funnel
    const completionFunnel = await Promise.all(
      challenges.map(async (c) => {
        const allAttemptsForChallenge = await prisma.attempt.findMany({
          where: { challengeId: c.id },
          select: { completedAt: true },
        });
        const started = allAttemptsForChallenge.length;
        const completed = allAttemptsForChallenge.filter(
          (a) => a.completedAt !== null
        ).length;
        return { challengeId: c.id, title: c.title, started, completed };
      })
    );

    // Engagement Timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timelineMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      timelineMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const a of allAttempts) {
      if (a.startedAt >= thirtyDaysAgo) {
        const key = a.startedAt.toISOString().slice(0, 10);
        timelineMap.set(key, (timelineMap.get(key) || 0) + 1);
      }
    }
    const engagementTimeline = Array.from(timelineMap.entries())
      .map(([date, attempts]) => ({ date, attempts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Hardest Questions (top 5 lowest correct rate with >0 answers)
    const hardestQuestions = questionDifficulty
      .filter((q) => q.totalAnswers > 0)
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 5)
      .map((q) => ({
        body: q.body,
        correctRate: q.correctRate,
        challengeTitle: q.challengeTitle,
      }));

    // Fill-in-Blank Answer Analysis
    const blankQuestions = challenges.flatMap((c) =>
      c.questions.filter((q) => q.questionType === "FILL_IN_BLANK")
    );
    const blankAnswerAnalysis = blankQuestions.map((q) => {
      const incorrectAnswers = q.answers
        .filter((a) => !a.isCorrect && a.textResponse)
        .reduce((acc, a) => {
          const text = a.textResponse!.trim().toLowerCase();
          acc.set(text, (acc.get(text) || 0) + 1);
          return acc;
        }, new Map<string, number>());

      return {
        questionBody: q.body.slice(0, 100),
        incorrectAnswers: Array.from(incorrectAnswers.entries())
          .map(([text, count]) => ({ text, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      };
    });

    return NextResponse.json({
      overview: {
        totalChallenges,
        totalStudentsReached,
        averagePassRate,
        totalAttemptsReceived,
      },
      challengePerformance,
      scoreDistribution,
      questionDifficulty,
      completionFunnel,
      engagementTimeline,
      hardestQuestions,
      blankAnswerAnalysis,
    });
  } catch (error) {
    console.error("GET /api/dashboard/instructor-analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructor analytics" },
      { status: 500 }
    );
  }
}
