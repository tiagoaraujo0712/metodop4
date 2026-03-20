// Persistent local state manager for P4 app

export type DISCProfile = "D" | "I" | "S" | "C";
export type EnergyLevel = "high" | "medium" | "low";

export interface EnergySlot {
  period: "morning" | "afternoon" | "evening" | "night";
  level: EnergyLevel;
}

export interface UserProfile {
  name: string;
  discProfile: DISCProfile;
  procrastinationLevel: number; // 1-10
  energySlots: EnergySlot[];
  onboardingComplete: boolean;
  createdAt: string;
}

export interface DailyEntry {
  date: string;
  energyLevel: EnergyLevel;
  p4Completed: boolean;
  task?: string;
  microSteps?: string[];
  focusMinutes?: number;
  completedAt?: string;
}

export interface AppState {
  user: UserProfile | null;
  dailyEntries: DailyEntry[];
  streak: number;
  totalDaysActive: number;
}

const STORAGE_KEY = "metodo-p4-state";

const defaultState: AppState = {
  user: null,
  dailyEntries: [],
  streak: 0,
  totalDaysActive: 0,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(updater: (state: AppState) => AppState): AppState {
  const current = loadState();
  const next = updater(current);
  saveState(next);
  return next;
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayEntry(): DailyEntry | undefined {
  const state = loadState();
  return state.dailyEntries.find((e) => e.date === getTodayKey());
}

export function calculateStreak(entries: DailyEntry[]): number {
  const sorted = [...entries].filter((e) => e.p4Completed).sort((a, b) => b.date.localeCompare(a.date));
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

export function getDISCDescription(profile: DISCProfile): { title: string; description: string; weakness: string; focus: string } {
  const map: Record<DISCProfile, { title: string; description: string; weakness: string; focus: string }> = {
    D: {
      title: "Executor Impulsivo",
      description: "Age rápido, sem direção. Precisa de mais clareza antes de agir.",
      weakness: "Falta de planejamento",
      focus: "Pensar antes de agir",
    },
    I: {
      title: "Iniciador Inconsistente",
      description: "Começa com entusiasmo, mas não sustenta. Precisa de consistência.",
      weakness: "Falta de constância",
      focus: "Completar o que começou",
    },
    S: {
      title: "Prudente Travado",
      description: "Sabe o que fazer, mas não decide. Precisa de ação decisiva.",
      weakness: "Paralisia por análise",
      focus: "Decidir e comprometer",
    },
    C: {
      title: "Analista Paralisado",
      description: "Pensa demais, age de menos. Precisa encurtar o planejamento.",
      weakness: "Excesso de análise",
      focus: "Agir imediatamente",
    },
  };
  return map[profile];
}

export function getEnergyRecommendation(level: EnergyLevel): string {
  switch (level) {
    case "high":
      return "Energia alta detectada. Enfrente a tarefa mais difícil agora.";
    case "medium":
      return "Energia média. Foque em execução operacional.";
    case "low":
      return "Energia baixa. Faça apenas o mínimo necessário. Descansar também é método.";
  }
}
