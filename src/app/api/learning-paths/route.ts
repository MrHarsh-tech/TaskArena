import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/learning-paths — list published paths
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    const where: any = {};

    // If creatorId is specified, show all (for instructor's own view)
    // Otherwise show only published
    if (creatorId) {
      where.creatorId = creatorId;
    } else {
      where.isPublished = true;
    }

    const paths = await prisma.learningPath.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { steps: true, userProgress: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(paths);
  } catch (error) {
    console.error("GET /api/learning-paths error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 }
    );
  }
}
