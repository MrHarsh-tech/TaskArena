const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.progress.findMany({ include: { user: true } });
  console.log("=== Progress ===");
  console.log(JSON.stringify(p, null, 2));

  const a = await prisma.attempt.findMany({ include: { user: true, challenge: true }});
  console.log("=== Attempts ===");
  console.log(JSON.stringify(a, null, 2));
}

main().finally(() => prisma.$disconnect());
