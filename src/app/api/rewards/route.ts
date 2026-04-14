import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/rewards — get current user's earned rewards
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRewards = await prisma.userReward.findMany({
      where: { userId: session.user.id },
      include: { reward: true },
      orderBy: { earnedAt: "desc" },
      take: 50,
    });

    return NextResponse.json(userRewards);
  } catch (error) {
    console.error("GET /api/rewards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}
