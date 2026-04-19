import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/challenges/[id] — get single challenge with questions
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            options: {
              select: { id: true, body: true },
            },
          },
        },
        _count: { select: { attempts: true, bookmarks: true } },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // For fill-in-blank questions, don't expose accepted answers to the client
    const sanitizedQuestions = challenge.questions.map((q) => ({
      ...q,
      acceptedAnswers: [], // Hide correct answers from client
    }));

    return NextResponse.json({
      ...challenge,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error("GET /api/challenges/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}

// PUT /api/challenges/[id] — update challenge
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (
      challenge.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.challenge.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        difficulty: body.difficulty,
        tags: body.tags,
        isPublished: body.isPublished,
        categoryId: body.categoryId,
        coverImageUrl: body.coverImageUrl,
        timeLimit: body.timeLimit,
        maxAttempts: body.maxAttempts,
        estimatedMinutes: body.estimatedMinutes,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/challenges/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges/[id] — soft-delete challenge
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (
      challenge.creatorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft-delete instead of hard delete
    await prisma.challenge.update({
      where: { id: params.id },
      data: { archivedAt: new Date(), isPublished: false },
    });

    return NextResponse.json({ message: "Challenge archived" });
  } catch (error) {
    console.error("DELETE /api/challenges/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to archive challenge" },
      { status: 500 }
    );
  }
}
