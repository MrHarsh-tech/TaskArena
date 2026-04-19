import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [progress, recentAttempts, activePaths] = await Promise.all([
      prisma.progress.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.attempt.findMany({
        where: { userId: session.user.id },
        include: {
          challenge: { select: { id: true, title: true, difficulty: true } },
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      }),
      prisma.userPathProgress.findMany({
        where: { userId: session.user.id, isCompleted: false },
        include: {
          path: {
            select: { id: true, title: true, color: true, iconEmoji: true, _count: { select: { steps: true } } }
          }
        },
        orderBy: { startedAt: "desc" },
        take: 3,
      }),
    ]);

    return NextResponse.json({ progress, recentAttempts, activePaths });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
