import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const path = await prisma.learningPath.findUnique({
      where: { id: params.id },
    });

    if (!path) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.userPathProgress.findUnique({
      where: {
        userId_pathId: {
          userId: session.user.id,
          pathId: params.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    const progress = await prisma.userPathProgress.create({
      data: {
        userId: session.user.id,
        pathId: params.id,
        currentStepIndex: 0,
        completedSteps: 0,
        isCompleted: false,
      },
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error("POST /api/learning-paths/[id]/enroll error:", error);
    return NextResponse.json(
      { error: "Failed to enroll" },
      { status: 500 }
    );
  }
}
