// Reward Service to handle randomized XP multipliers
const calculateReward = (baseXp) => {
  const roll = Math.random();
  let multiplier = 1;
  let message = null;

  if (roll > 0.99) { // 1% chance for 3x
    multiplier = 3;
    message = 'LEGENDARY DISCOVERY! 3x XP Multiplier!';
  } else if (roll > 0.95) { // 4% chance for 2x
    multiplier = 2;
    message = 'RARE FIND! 2x XP Multiplier!';
  } else if (roll > 0.85) { // 10% chance for 1.5x
    multiplier = 1.5;
    message = 'GREAT WORK! 1.5x XP Multiplier!';
  }

  const finalXp = Math.round(baseXp * multiplier);
  
  return {
    baseXp,
    multiplier,
    finalXp,
    bonusXp: finalXp - baseXp,
    message
  };
};

module.exports = { calculateReward };
