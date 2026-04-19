"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface MysteryRewardProps {
  reward: {
    id: string;
    source: string;
    reward: {
      name: string;
      type: string;
      rarity: string;
      iconEmoji: string;
      description: string;
      value?: string | null;
    };
  } | null;
  xpMultiplier?: number;
  onClose: () => void;
}

const rarityConfig: Record<string, { label: string; gradient: string; glow: string; border: string }> = {
  common: {
    label: "Common",
    gradient: "from-surface-400 to-surface-600",
    glow: "shadow-surface-500/30",
    border: "border-surface-400",
  },
  rare: {
    label: "Rare",
    gradient: "from-blue-400 to-cyan-500",
    glow: "shadow-cyan-500/40",
    border: "border-cyan-400",
  },
  epic: {
    label: "Epic",
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/40",
    border: "border-purple-400",
  },
  legendary: {
    label: "Legendary",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    glow: "shadow-amber-500/50",
    border: "border-amber-400",
  },
};

const sourceLabels: Record<string, string> = {
  perfect_score: "🏆 Perfect Score Bonus!",
  streak_surprise: "🔥 Streak Milestone!",
  loot_drop: "🎁 Lucky Drop!",
  lucky_answer: "⭐ Lucky Answer!",
  mystery_challenge: "❓ Mystery Challenge Reward!",
};

export function MysteryRewardToast({ reward, xpMultiplier, onClose }: MysteryRewardProps) {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; emoji: string }>>([]);

  useEffect(() => {
    if (!reward) return;

    // Generate particle effects
    const emojis = ["✨", "⭐", "💎", "🌟", "🎉", "🔥", "💫"];
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setParticles(newParticles);

    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [reward, onClose]);

  if (!reward) return null;

  const config = rarityConfig[reward.reward.rarity] || rarityConfig.common;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 500);
        }}
      />

      {/* Reward Card */}
      <div
        className={`relative pointer-events-auto transition-all duration-700 ease-out ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-8"
        }`}
      >
        {/* Particle effects */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute text-2xl animate-float pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: "2s",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          >
            {p.emoji}
          </span>
        ))}

        <div
          className={`relative mx-4 max-w-sm rounded-3xl border-2 ${config.border} bg-white p-8 text-center shadow-2xl ${config.glow} dark:bg-surface-900`}
          style={{ minWidth: "320px" }}
        >
          {/* Close button */}
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 500);
            }}
            className="absolute top-3 right-3 p-1 rounded-full text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Source label */}
          <p className="text-sm font-semibold text-surface-500 mb-3">
            {sourceLabels[reward.source] || "🎁 Reward!"}
          </p>

          {/* Emoji icon with glow */}
          <div className="relative mx-auto mb-4">
            <div
              className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-4xl shadow-xl ${config.glow} animate-bounce-in`}
            >
              {reward.reward.iconEmoji}
            </div>
            {/* Glow ring */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-xl animate-pulse-soft`}
              style={{ margin: "-8px" }}
            />
          </div>

          {/* Rarity badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${config.gradient} px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-3`}
          >
            {config.label}
          </span>

          {/* Reward name */}
          <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-1">
            {reward.reward.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-surface-500 mb-4">
            {reward.reward.description}
          </p>

          {/* XP Multiplier notice */}
          {xpMultiplier && xpMultiplier > 1 && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700 dark:from-amber-950/50 dark:to-orange-950/50 dark:border-amber-800 dark:text-amber-300">
              ⚡ {xpMultiplier}x XP Multiplier Active!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
