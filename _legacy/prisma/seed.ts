import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "JavaScript", slug: "javascript", color: "#f7df1e", iconName: "Code", description: "Core JavaScript concepts and syntax" },
  { name: "Python", slug: "python", color: "#3776ab", iconName: "Terminal", description: "Python programming fundamentals" },
  { name: "Data Structures", slug: "data-structures", color: "#10b981", iconName: "Network", description: "Arrays, trees, graphs, and more" },
  { name: "Algorithms", slug: "algorithms", color: "#8b5cf6", iconName: "Cpu", description: "Sorting, searching, and optimization" },
  { name: "Web Development", slug: "web-development", color: "#ef4444", iconName: "Globe", description: "HTML, CSS, and web technologies" },
  { name: "Databases", slug: "databases", color: "#06b6d4", iconName: "Database", description: "SQL, NoSQL, and data modeling" },
  { name: "Computer Science", slug: "computer-science", color: "#f59e0b", iconName: "GraduationCap", description: "Theory, OS concepts, and networking" },
  { name: "Mathematics", slug: "mathematics", color: "#ec4899", iconName: "Calculator", description: "Discrete math, linear algebra, and calculus" },
];

const achievements = [
  { name: "First Steps", description: "Complete your first challenge", iconName: "Footprints", xpReward: 50, condition: '{"type":"challenges_completed","value":1}' },
  { name: "Getting Warmed Up", description: "Complete 5 challenges", iconName: "Flame", xpReward: 100, condition: '{"type":"challenges_completed","value":5}' },
  { name: "Challenge Champion", description: "Complete 25 challenges", iconName: "Trophy", xpReward: 500, condition: '{"type":"challenges_completed","value":25}' },
  { name: "Perfect Score", description: "Score 100% on any challenge", iconName: "Star", xpReward: 200, condition: '{"type":"perfect_score","value":1}' },
  { name: "Sharpshooter", description: "Score 100% on 5 different challenges", iconName: "Target", xpReward: 500, condition: '{"type":"perfect_score","value":5}' },
  { name: "Week Warrior", description: "Maintain a 7-day streak", iconName: "Zap", xpReward: 150, condition: '{"type":"streak","value":7}' },
  { name: "Month Master", description: "Maintain a 30-day streak", iconName: "Crown", xpReward: 750, condition: '{"type":"streak","value":30}' },
  { name: "Knowledge Seeker", description: "Attempt challenges in 5 different categories", iconName: "BookOpen", xpReward: 200, condition: '{"type":"categories_attempted","value":5}' },
  { name: "Speed Demon", description: "Complete a timed challenge with over 80%", iconName: "Timer", xpReward: 150, condition: '{"type":"timed_high_score","value":80}' },
  { name: "Tenacious", description: "Make 50 total attempts", iconName: "Repeat", xpReward: 300, condition: '{"type":"total_attempts","value":50}' },
];

async function main() {
  console.log("🌱 Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`   ✓ ${categories.length} categories seeded`);

  console.log("🏆 Seeding achievements...");
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: ach,
      create: ach,
    });
  }
  console.log(`   ✓ ${achievements.length} achievements seeded`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
