/**
 * Run with: npx ts-node --project tsconfig.json -e "import('./scripts/fix-nan-percentages')"
 * Or simply: npx tsx scripts/fix-nan-percentages.ts
 *
 * This script:
 * 1. Fixes any Attempt records where percentage is NaN or incorrectly 0
 *    (by recalculating from score/totalQuestions)
 * 2. Recalculates and upserts all Progress records for every student
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Fetching all attempts...");

  // Step 1: Fix attempts with NaN or 0 percentage where score > 0
  const attempts = await prisma.attempt.findMany({
    where: { completedAt: { not: null } },
  });

  let fixedCount = 0;
  for (const a of attempts) {
    const recalculated =
      a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0;
    const isNaNPercentage = isNaN(a.percentage) || !isFinite(a.percentage);
    const wrongZero = a.percentage === 0 && a.score > 0;
    if (isNaNPercentage || wrongZero) {
      await prisma.attempt.update({
        where: { id: a.id },
        data: { percentage: recalculated },
      });
      console.log(
        `  ✅ Fixed attempt ${a.id}: ${a.percentage} → ${recalculated}`
      );
      fixedCount++;
    }
  }
  console.log(`Fixed ${fixedCount} attempt(s).`);

  // Step 2: Recalculate Progress for all users who have attempts
  const userIds = Array.from(new Set(attempts.map((a) => a.userId)));
  console.log(`\n🔄 Recalculating Progress for ${userIds.length} user(s)...`);

  for (const userId of userIds) {
    const userAttempts = await prisma.attempt.findMany({
      where: { userId, completedAt: { not: null } },
    });
    const totalAttempts = userAttempts.length;
    const sumPct = userAttempts.reduce(
      (s, a) => s + (isNaN(a.percentage) ? 0 : a.percentage),
      0
    );
    const avgScore = totalAttempts > 0 ? sumPct / totalAttempts : 0;
    const challengesCompleted = new Set(userAttempts.map((a) => a.challengeId))
      .size;
    const totalTimeSpent = userAttempts.reduce(
      (s, a) => s + (a.timeTakenSeconds || 0),
      0
    );

    await prisma.progress.upsert({
      where: { userId },
      update: {
        totalAttempts,
        averageScore: avgScore,
        challengesCompleted,
        totalTimeSpentSeconds: totalTimeSpent,
        lastActiveAt: new Date(),
      },
      create: {
        userId,
        totalAttempts,
        averageScore: avgScore,
        challengesCompleted,
        totalTimeSpentSeconds: totalTimeSpent,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveAt: new Date(),
      },
    });
    console.log(
      `  👤 User ${userId}: ${totalAttempts} attempts, avgScore=${avgScore.toFixed(1)}%, ${challengesCompleted} unique challenges`
    );
  }

  console.log("\n✅ All done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
