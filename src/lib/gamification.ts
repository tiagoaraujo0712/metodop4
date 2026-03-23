// Gamification System for Sistema P4
// Manages streaks, badges, and achievement tracking

export type BadgeType = 
  | "first_session"
  | "week_warrior"
  | "master_pause"
  | "clarity_seeker"
  | "decision_maker"
  | "action_hero"
  | "perfect_week"
  | "month_master"
  | "consistency_king";

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  lastSessionDate: string | null;
  badges: Badge[];
}

// Badge definitions
export const BADGES: Record<BadgeType, Omit<Badge, "unlockedAt">> = {
  first_session: {
    id: "first_session",
    name: "Primeiro Passo",
    description: "Complete sua primeira sessão P4",
    icon: "🚀",
    rarity: "common",
  },
  week_warrior: {
    id: "week_warrior",
    name: "Guerreiro da Semana",
    description: "7 dias consecutivos de prática",
    icon: "⚔️",
    rarity: "rare",
  },
  master_pause: {
    id: "master_pause",
    name: "Mestre da Pausa",
    description: "Complete 10 sessões focadas em PARAR",
    icon: "🧘",
    rarity: "rare",
  },
  clarity_seeker: {
    id: "clarity_seeker",
    name: "Buscador de Clareza",
    description: "Complete 10 sessões focadas em PENSAR",
    icon: "💡",
    rarity: "rare",
  },
  decision_maker: {
    id: "decision_maker",
    name: "Decisor Implacável",
    description: "Complete 10 sessões focadas em DECIDIR",
    icon: "⚡",
    rarity: "rare",
  },
  action_hero: {
    id: "action_hero",
    name: "Herói da Ação",
    description: "Complete 10 sessões focadas em AGIR",
    icon: "🎯",
    rarity: "rare",
  },
  perfect_week: {
    id: "perfect_week",
    name: "Semana Perfeita",
    description: "7 dias com energia alta e sessão completa",
    icon: "⭐",
    rarity: "epic",
  },
  month_master: {
    id: "month_master",
    name: "Mestre do Mês",
    description: "30 dias consecutivos de prática",
    icon: "👑",
    rarity: "epic",
  },
  consistency_king: {
    id: "consistency_king",
    name: "Rei da Consistência",
    description: "100 dias consecutivos de prática",
    icon: "🏆",
    rarity: "legendary",
  },
};

// Calculate streak based on daily entries
export function calculateCurrentStreak(
  entries: Array<{ date: string; p4Completed: boolean }>
): number {
  const sorted = [...entries]
    .filter((e) => e.p4Completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedKey = expected.toISOString().slice(0, 10);

    if (sorted[i]?.date === expectedKey) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Get longest streak from all entries
export function calculateLongestStreak(
  entries: Array<{ date: string; p4Completed: boolean }>
): number {
  const completed = entries
    .filter((e) => e.p4Completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (completed.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < completed.length; i++) {
    const prevDate = new Date(completed[i - 1]!.date);
    const currDate = new Date(completed[i]!.date);
    const diffDays = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

// Check if badge should be unlocked
export function checkBadgeUnlock(
  badgeId: BadgeType,
  entries: Array<{ date: string; p4Completed: boolean; task?: string }>,
  currentBadges: Badge[]
): boolean {
  // Don't unlock if already unlocked
  if (currentBadges.some((b) => b.id === badgeId)) {
    return false;
  }

  const streak = calculateCurrentStreak(entries);
  const totalSessions = entries.filter((e) => e.p4Completed).length;

  switch (badgeId) {
    case "first_session":
      return totalSessions >= 1;

    case "week_warrior":
      return streak >= 7;

    case "month_master":
      return streak >= 30;

    case "consistency_king":
      return streak >= 100;

    case "perfect_week":
      // Check if last 7 days have all sessions with high energy
      const lastSevenDays = entries
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7);
      return (
        lastSevenDays.length === 7 &&
        lastSevenDays.every((e) => e.p4Completed)
      );

    case "master_pause":
    case "clarity_seeker":
    case "decision_maker":
    case "action_hero":
      // Count sessions for each P4 phase
      const phaseCounts = {
        parar: 0,
        pensar: 0,
        decidir: 0,
        agir: 0,
      };

      entries.forEach((entry) => {
        if (entry.task) {
          // Parse task to determine phase (simplified logic)
          const task = entry.task.toLowerCase();
          if (task.includes("parar") || task.includes("pause")) phaseCounts.parar++;
          else if (task.includes("pensar") || task.includes("think"))
            phaseCounts.pensar++;
          else if (task.includes("decidir") || task.includes("decide"))
            phaseCounts.decidir++;
          else if (task.includes("agir") || task.includes("act"))
            phaseCounts.agir++;
        }
      });

      const phaseMap = {
        master_pause: "parar",
        clarity_seeker: "pensar",
        decision_maker: "decidir",
        action_hero: "agir",
      } as const;

      const phase = phaseMap[badgeId];
      return phaseCounts[phase as keyof typeof phaseCounts] >= 10;

    default:
      return false;
  }
}

// Get all unlockable badges
export function getUnlockedBadges(
  entries: Array<{ date: string; p4Completed: boolean; task?: string }>,
  currentBadges: Badge[]
): Badge[] {
  const newBadges = [...currentBadges];

  Object.keys(BADGES).forEach((badgeId) => {
    if (
      checkBadgeUnlock(
        badgeId as BadgeType,
        entries,
        newBadges
      )
    ) {
      const badgeTemplate = BADGES[badgeId as BadgeType];
      newBadges.push({
        ...badgeTemplate,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  return newBadges;
}

// Format streak display
export function formatStreakDisplay(streak: number): string {
  if (streak === 0) return "Comece hoje!";
  if (streak === 1) return "1 dia 🔥";
  if (streak < 7) return `${streak} dias 🔥`;
  if (streak < 30) return `${Math.floor(streak / 7)} semanas 🔥`;
  if (streak < 365) return `${Math.floor(streak / 30)} meses 🔥`;
  return `${Math.floor(streak / 365)} anos 🏆`;
}
