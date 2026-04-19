import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get 5 random questions from any published challenge
    // In PostgreSQL, ORDER BY RANDOM() is inefficient for huge tables, but OK for smaller sets.
    // Since Prisma doesn't have a native random sort, we can get all IDs and pick 5.
    
    // First, find published challenge IDs
    const publishedChallenges = await prisma.challenge.findMany({
      where: { isPublished: true, archivedAt: null },
      select: { id: true },
    });
    
    const challengeIds = publishedChallenges.map(c => c.id);

    if (challengeIds.length === 0) {
      return NextResponse.json({ error: "No published challenges available" }, { status: 400 });
    }

    const allQuestions = await prisma.question.findMany({
      where: { challengeId: { in: challengeIds } },
      include: { options: true },
    });
    
    if (allQuestions.length === 0) {
       return NextResponse.json({ error: "No questions available" }, { status: 400 });
    }

    // Shuffle and pick 5
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);

    // Mock a challenge object for the frontend
    const quickPlayChallenge = {
      id: "quick-play",
      title: "Daily Spark: Quick Play ⚡",
      description: "A quick fire round of 5 random questions from across all topics. Keep your mind sharp!",
      difficulty: "MIXED",
      timeLimit: 300, // 5 minutes
      isQuickPlay: true,
      questions: selectedQuestions.map((q, i) => ({
        ...q,
        orderIndex: i, // Force order
      })),
      creator: { name: "TaskArena" },
      _count: { attempts: 0 },
    };

    return NextResponse.json(quickPlayChallenge);
  } catch (error) {
    console.error("GET /api/quick-play error:", error);
    return NextResponse.json(
      { error: "Failed to generate quick play" },
      { status: 500 }
    );
  }
}
