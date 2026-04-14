import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rollForReward, grantReward } from "@/lib/mystery-rewards";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string().optional().nullable(),
      textResponse: z.string().optional().nullable(),
    })
  ),
  timeTakenSeconds: z.number().optional().nullable(),
  isQuickPlay: z.boolean().optional(),
});

// POST /api/challenges/[id]/attempt — submit a challenge attempt
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify challenge exists and is published
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!challenge || !challenge.isPublished) {
      return NextResponse.json(
        { error: "Challenge not found or not published" },
        { status: 404 }
      );
    }

    // Check max attempts
    if (challenge.maxAttempts) {
      const existingAttempts = await prisma.attempt.count({
        where: { userId: session.user.id, challengeId: params.id },
      });
      if (existingAttempts >= challenge.maxAttempts) {
        return NextResponse.json(
          { error: `Maximum ${challenge.maxAttempts} attempts allowed` },
          { status: 400 }
        );
      }
    }

    // Grade the answers
    const { answers, timeTakenSeconds } = parsed.data;
    let correctCount = 0;

    const gradedAnswers = answers.map((answer) => {
      const question = challenge.questions.find(
        (q) => q.id === answer.questionId
      );

      if (!question) {
        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId || null,
          textResponse: answer.textResponse || null,
          isCorrect: false,
        };
      }

      let isCorrect = false;

      if (question.questionType === "FILL_IN_BLANK") {
        // Grade fill-in-the-blank
        const userAnswer = (answer.textResponse || "").trim();
        if (userAnswer) {
          isCorrect = question.acceptedAnswers.some((accepted) => {
            if (question.isCaseSensitive) {
              return accepted.trim() === userAnswer;
            }
            return accepted.trim().toLowerCase() === userAnswer.toLowerCase();
          });
        }
      } else {
        // Grade MCQ
        const selectedOption = question.options.find(
          (o) => o.id === answer.selectedOptionId
        );
        isCorrect = selectedOption?.isCorrect || false;
      }

      if (isCorrect) correctCount++;

      return {
        questionId: answer.questionId,
        selectedOptionId: question.questionType === "MCQ" ? (answer.selectedOptionId || null) : null,
        textResponse: question.questionType === "FILL_IN_BLANK" ? (answer.textResponse || null) : null,
        isCorrect,
      };
    });

    const totalQuestions = challenge.questions.length;
    const percentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Create attempt with answers
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        challengeId: params.id,
        score: correctCount,
        totalQuestions,
        percentage,
        completedAt: new Date(),
        timeTakenSeconds: timeTakenSeconds || null,
        answers: {
          create: gradedAnswers,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });

    // Update user progress
    const allAttempts = await prisma.attempt.findMany({
      where: { userId: session.user.id, completedAt: { not: null } },
    });

    const totalAttempts = allAttempts.length;
    const avgScore =
      allAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts;
    const challengesCompleted = new Set(allAttempts.map((a) => a.challengeId))
      .size;

    // Calculate time spent
    const totalTimeSpent = allAttempts.reduce(
      (sum, a) => sum + (a.timeTakenSeconds || 0),
      0
    );

    // Get current streak for mystery reward check
    const currentProgress = await prisma.progress.findUnique({
      where: { userId: session.user.id },
    });
    const currentStreak = (currentProgress?.currentStreak || 0) + 1;

    const updatedProgress = await prisma.progress.upsert({
      where: { userId: session.user.id },
      update: {
        totalAttempts,
        averageScore: avgScore,
        challengesCompleted,
        totalTimeSpentSeconds: totalTimeSpent,
        currentStreak,
        longestStreak: Math.max(currentStreak, currentProgress?.longestStreak || 0),
        lastActiveAt: new Date(),
      },
      create: {
        userId: session.user.id,
        totalAttempts,
        averageScore: avgScore,
        challengesCompleted,
        totalTimeSpentSeconds: totalTimeSpent,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveAt: new Date(),
      },
    });

    // ============ LEARNING PATH PROGRESS ============
    let pathExtraXp = 0;
    if (percentage >= 60) {
      const activePaths = await prisma.userPathProgress.findMany({
        where: { userId: session.user.id, isCompleted: false },
        include: {
          path: { include: { steps: { orderBy: { orderIndex: "asc" } } } }
        }
      });

      for (const userPath of activePaths) {
        const nextStep = userPath.path.steps[userPath.currentStepIndex];
        if (nextStep && nextStep.challengeId === params.id) {
          const nextStepIndex = userPath.currentStepIndex + 1;
          const isCompleted = nextStepIndex >= userPath.path.steps.length;

          await prisma.userPathProgress.update({
            where: { id: userPath.id },
            data: {
              currentStepIndex: Math.min(nextStepIndex, userPath.path.steps.length - 1),
              completedSteps: nextStepIndex,
              isCompleted,
              completedAt: isCompleted ? new Date() : null,
            }
          });
          
          if (nextStep.xpBonus > 0) {
             pathExtraXp += nextStep.xpBonus;
          }
        }
      }
    }

    // ============ MYSTERY REWARD ENGINE ============
    const rewardRoll = rollForReward(percentage, currentStreak);
    let mysteryReward = null;

    // Award XP: base 10 XP per attempt + bonus for high scores
    let xpEarned = 10;
    if (percentage >= 80) xpEarned += 20;
    if (percentage === 100) xpEarned += 30;

    // Apply XP multiplier from mystery reward
    xpEarned = xpEarned * rewardRoll.xpMultiplier;
    
    // Add path extra xp (not multiplied by mystery reward since it's a fixed bonus)
    xpEarned += pathExtraXp;

    if (rewardRoll.shouldReward && rewardRoll.rewardDef) {
      mysteryReward = await grantReward(
        session.user.id,
        rewardRoll.rewardDef,
        rewardRoll.source
      );
    }

    // Update XP and level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xpPoints: true },
    });
    const newXp = (user?.xpPoints || 0) + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1; // Level up every 100 XP

    await prisma.user.update({
      where: { id: session.user.id },
      data: { xpPoints: newXp, level: newLevel, lastLoginAt: new Date() },
    });

    return NextResponse.json(
      {
        ...attempt,
        xpEarned,
        xpMultiplier: rewardRoll.xpMultiplier,
        newXp,
        newLevel,
        mysteryReward: mysteryReward
          ? {
              id: mysteryReward.id,
              source: mysteryReward.source,
              reward: mysteryReward.reward,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/challenges/[id]/attempt error:", error);
    return NextResponse.json(
      { error: "Failed to submit attempt" },
      { status: 500 }
    );
  }
}

// GET /api/challenges/[id]/attempt — get user's attempts for this challenge
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        challengeId: params.id,
        userId: session.user.id,
      },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("GET /api/challenges/[id]/attempt error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
