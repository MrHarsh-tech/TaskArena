import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  timeLimit: z.number().optional().nullable(),
  maxAttempts: z.number().optional().nullable(),
  estimatedMinutes: z.number().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  questions: z
    .array(
      z.object({
        body: z.string().min(1),
        explanation: z.string().optional(),
        orderIndex: z.number().default(0),
        questionType: z.enum(["MCQ", "FILL_IN_BLANK"]).default("MCQ"),
        acceptedAnswers: z.array(z.string()).default([]),
        isCaseSensitive: z.boolean().default(false),
        options: z
          .array(
            z.object({
              body: z.string().min(1),
              isCorrect: z.boolean().default(false),
            })
          )
          .default([]),
      })
    )
    .optional(),
});

// GET /api/challenges — list published challenges (or all for instructor)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const creatorId = searchParams.get("creatorId");
    const categoryId = searchParams.get("categoryId");

    const where: any = { archivedAt: null };

    // If creatorId is specified, show all (for instructor's own view)
    // Otherwise show only published
    if (creatorId) {
      where.creatorId = creatorId;
    } else {
      where.isPublished = true;
    }

    if (difficulty) where.difficulty = difficulty.toUpperCase();
    if (tag) where.tags = { has: tag };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true, color: true, iconName: true } },
        _count: { select: { questions: true, attempts: true, bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const { getDailyMysteryIndex } = await import("@/lib/mystery-rewards");
    const dailyIndex = challenges.length > 0 ? getDailyMysteryIndex(challenges.length) : -1;
    
    const challengesWithMystery = challenges.map((c, i) => ({
      ...c,
      isDailyMystery: i === dailyIndex,
    }));

    return NextResponse.json(challengesWithMystery);
  } catch (error) {
    console.error("GET /api/challenges error:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST /api/challenges — create a new challenge (instructor only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = challengeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, difficulty, tags, deadline, questions, categoryId, coverImageUrl, timeLimit, maxAttempts, estimatedMinutes } =
      parsed.data;

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        categoryId: categoryId || undefined,
        coverImageUrl,
        timeLimit,
        maxAttempts,
        estimatedMinutes,
        deadline: deadline ? new Date(deadline) : null,
        creatorId: session.user.id,
        questions: questions
          ? {
              create: questions.map((q, i) => ({
                body: q.body,
                explanation: q.explanation,
                orderIndex: q.orderIndex || i,
                questionType: q.questionType,
                acceptedAnswers: q.acceptedAnswers,
                isCaseSensitive: q.isCaseSensitive,
                options: q.questionType === "MCQ"
                  ? { create: q.options }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        questions: { include: { options: true } },
        category: true,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("POST /api/challenges error:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}
