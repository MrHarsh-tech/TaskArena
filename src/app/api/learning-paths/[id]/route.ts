import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/learning-paths/[id] — get a specific learning path
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const path = await prisma.learningPath.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        steps: {
          orderBy: { orderIndex: "asc" },
          include: {
            challenge: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                description: true,
                _count: { select: { questions: true } }
              }
            }
          }
        },
      },
    });

    if (!path) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    // If user is logged in, attach their progress
    let userProgress = null;
    if (userId) {
      userProgress = await prisma.userPathProgress.findUnique({
        where: { userId_pathId: { userId, pathId: params.id } },
      });
      
      // Also get their attempts for the challenges in the path
      const challengeIds = path.steps.map(s => s.challengeId);
      const attempts = await prisma.attempt.findMany({
        where: {
          userId,
          challengeId: { in: challengeIds },
        },
        orderBy: { completedAt: "desc" },
      });
      
      // We can append the best score for each challenge to the step
      path.steps = path.steps.map(step => {
        const stepAttempts = attempts.filter(a => a.challengeId === step.challengeId);
        const bestAttempt = stepAttempts.length > 0 
          ? stepAttempts.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current) 
          : null;
          
        return {
          ...step,
          userAttempt: bestAttempt,
        };
      });
    }

    return NextResponse.json({ path, userProgress });
  } catch (error) {
    console.error("GET /api/learning-paths/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning path" },
      { status: 500 }
    );
  }
}
