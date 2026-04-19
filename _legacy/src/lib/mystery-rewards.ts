import { prisma } from "@/lib/prisma";

// Reward definitions — these get seeded or looked up at runtime
const REWARD_POOL = [
  { name: "XP Doubler", type: "xp_multiplier", rarity: "rare", iconEmoji: "⚡", description: "2x XP on this attempt!", value: "2" },
  { name: "XP Tripler", type: "xp_multiplier", rarity: "epic", iconEmoji: "🔥", description: "3x XP on this attempt!", value: "3" },
  { name: "Lucky Star", type: "title", rarity: "common", iconEmoji: "⭐", description: "You found a Lucky Star!", value: "Lucky Star" },
  { name: "Brain Wizard", type: "title", rarity: "rare", iconEmoji: "🧙", description: "Title unlocked: Brain Wizard", value: "Brain Wizard" },
  { name: "Quiz Champion", type: "title", rarity: "epic", iconEmoji: "👑", description: "Title unlocked: Quiz Champion", value: "Quiz Champion" },
  { name: "Sapphire Glow", type: "theme_color", rarity: "rare", iconEmoji: "💎", description: "Unlocked Sapphire profile glow!", value: "#06b6d4" },
  { name: "Amethyst Glow", type: "theme_color", rarity: "epic", iconEmoji: "🔮", description: "Unlocked Amethyst profile glow!", value: "#8b5cf6" },
  { name: "Rose Glow", type: "theme_color", rarity: "rare", iconEmoji: "🌹", description: "Unlocked Rose profile glow!", value: "#ec4899" },
  { name: "Golden Frame", type: "avatar_frame", rarity: "legendary", iconEmoji: "🖼️", description: "Legendary Golden Avatar Frame!", value: "golden" },
  { name: "Neon Frame", type: "avatar_frame", rarity: "epic", iconEmoji: "✨", description: "Epic Neon Avatar Frame!", value: "neon" },
];

/** Determine if a mystery reward should be granted, and which one */
export function rollForReward(percentage: number, currentStreak: number): {
  shouldReward: boolean;
  xpMultiplier: number;
  rewardDef: (typeof REWARD_POOL)[number] | null;
  source: string;
} {
  const seed = Math.random();

  // Perfect score — guaranteed rare+ reward
  if (percentage === 100) {
    const epicAndAbove = REWARD_POOL.filter(r => r.rarity === "epic" || r.rarity === "legendary");
    const pick = epicAndAbove[Math.floor(Math.random() * epicAndAbove.length)];
    const xpMult = pick.type === "xp_multiplier" ? parseInt(pick.value || "1") : 1;
    return { shouldReward: true, xpMultiplier: xpMult, rewardDef: pick, source: "perfect_score" };
  }

  // Streak milestones — reward at 3, 5, 7, 10, etc.
  if ([3, 5, 7, 10, 15, 20, 30].includes(currentStreak)) {
    const pool = REWARD_POOL.filter(r => r.rarity !== "legendary");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const xpMult = pick.type === "xp_multiplier" ? parseInt(pick.value || "1") : 1;
    return { shouldReward: true, xpMultiplier: xpMult, rewardDef: pick, source: "streak_surprise" };
  }

  // Random loot drop — 15% chance on any completion with score > 50%
  if (percentage >= 50 && seed < 0.15) {
    // Weight by rarity: common 50%, rare 30%, epic 15%, legendary 5%
    const rarityRoll = Math.random();
    let targetRarity: string;
    if (rarityRoll < 0.50) targetRarity = "common";
    else if (rarityRoll < 0.80) targetRarity = "rare";
    else if (rarityRoll < 0.95) targetRarity = "epic";
    else targetRarity = "legendary";

    const pool = REWARD_POOL.filter(r => r.rarity === targetRarity);
    if (pool.length === 0) return { shouldReward: false, xpMultiplier: 1, rewardDef: null, source: "" };
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const xpMult = pick.type === "xp_multiplier" ? parseInt(pick.value || "1") : 1;
    return { shouldReward: true, xpMultiplier: xpMult, rewardDef: pick, source: "loot_drop" };
  }

  return { shouldReward: false, xpMultiplier: 1, rewardDef: null, source: "" };
}

/** Create & persist the reward in the database */
export async function grantReward(
  userId: string,
  rewardDef: (typeof REWARD_POOL)[number],
  source: string
) {
  // Find or create the reward definition
  let reward = await prisma.reward.findFirst({
    where: { name: rewardDef.name, type: rewardDef.type },
  });

  if (!reward) {
    reward = await prisma.reward.create({
      data: {
        name: rewardDef.name,
        type: rewardDef.type,
        rarity: rewardDef.rarity,
        iconEmoji: rewardDef.iconEmoji,
        description: rewardDef.description,
        value: rewardDef.value,
      },
    });
  }

  const userReward = await prisma.userReward.create({
    data: {
      userId,
      rewardId: reward.id,
      source,
    },
    include: { reward: true },
  });

  return userReward;
}

/** Check if today's mystery challenge ID should be set */
export function getDailyMysteryIndex(totalChallenges: number): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % Math.max(totalChallenges, 1);
}
