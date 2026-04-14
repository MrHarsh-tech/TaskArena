import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string().optional().nullable(),
      textResponse: z.string().optional().nullable(),
    })
  ),
  timeTakenSeconds: z.number().optional().nullable(),
});

export async function POST(req: Request) {
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

    const { answers, timeTakenSeconds } = parsed.data;

    // Fetch the actual questions to grade them
    const questionIds = answers.map((a) => a.questionId);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { options: true },
    });

    let correctCount = 0;

    const gradedAnswers = answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);

      if (!question) {
        return { ...answer, isCorrect: false };
      }

      let isCorrect = false;

      if (question.questionType === "FILL_IN_BLANK") {
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
        const selectedOption = question.options.find(
          (o) => o.id === answer.selectedOptionId
        );
        isCorrect = selectedOption?.isCorrect || false;
      }

      if (isCorrect) correctCount++;

      return {
        id: Math.random().toString(36).substring(7), // fake ID for frontend
        questionId: answer.questionId,
        selectedOptionId: question.questionType === "MCQ" ? (answer.selectedOptionId || null) : null,
        textResponse: question.questionType === "FILL_IN_BLANK" ? (answer.textResponse || null) : null,
        isCorrect,
        question: question,
        selectedOption: question.questionType === "MCQ" ? question.options.find(o => o.id === answer.selectedOptionId) : null,
      };
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Log the "attempt" as just stats in progress since we don't save an actual Attempt record
    await prisma.progress.update({
      where: { userId: session.user.id },
      data: {
        totalTimeSpentSeconds: { increment: timeTakenSeconds || 0 },
        lastActiveAt: new Date(),
      },
    });

    // Award XP: base 5 XP per QP attempt + 5 for perfect score
    let xpEarned = 5;
    if (percentage === 100) xpEarned += 5;

    // Update XP and level
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xpPoints: true },
    });
    const newXp = (user?.xpPoints || 0) + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { xpPoints: newXp, level: newLevel, lastLoginAt: new Date() },
    });

    // Return mock attempt object matching UI expectations
    return NextResponse.json(
      {
        id: "quick-play-" + Date.now(),
        score: correctCount,
        totalQuestions,
        percentage,
        answers: gradedAnswers,
        xpEarned,
        newXp,
        newLevel,
        mysteryReward: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/quick-play/attempt error:", error);
    return NextResponse.json(
      { error: "Failed to submit quick play attempt" },
      { status: 500 }
    );
  }
}
