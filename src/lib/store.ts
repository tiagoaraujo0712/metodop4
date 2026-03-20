// Persistent local state manager for P4 app

export type DISCProfile = "D" | "I" | "S" | "C";
export type EnergyLevel = "high" | "medium" | "low";
export type P4Blockage = "parar" | "pensar" | "decidir" | "agir";

export interface EnergySlot {
  period: "morning" | "afternoon" | "evening" | "night";
  level: EnergyLevel;
}

export interface UserProfile {
  name: string;
  discProfile: DISCProfile;
  p4Blockage: P4Blockage;
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

// DISC clássico — nomes tradicionais em português
export function getDISCDescription(profile: DISCProfile): {
  title: string;
  subtitle: string;
  description: string;
  traits: string[];
  weaknesses: string[];
  focus: string;
  coachTone: string;
} {
  const map: Record<DISCProfile, ReturnType<typeof getDISCDescription>> = {
    D: {
      title: "Dominante",
      subtitle: "Perfil D",
      description: "Você é uma pessoa que gosta de agir rápido, tomar decisões e ir direto ao ponto. Tem energia para executar, mas às vezes atropela o processo.",
      traits: [
        "Age rápido e com determinação",
        "Toma decisões sem hesitar",
        "Gosta de desafios e resultados",
        "Prefere liderar a seguir",
      ],
      weaknesses: [
        "Tendência a agir sem pensar",
        "Pode ignorar detalhes importantes",
        "Dificuldade em manter constância",
        "Impaciente com processos lentos",
      ],
      focus: "Reduzir impulsividade e aumentar consistência",
      coachTone: "direto",
    },
    I: {
      title: "Influente",
      subtitle: "Perfil I",
      description: "Você é uma pessoa comunicativa, entusiasmada e cheia de ideias. Começa com empolgação, mas tende a perder o foco no meio do caminho.",
      traits: [
        "Começa com entusiasmo e energia",
        "Criativo e cheio de ideias",
        "Gosta de interagir e se expressar",
        "Motivado por reconhecimento",
      ],
      weaknesses: [
        "Perde o foco facilmente",
        "Começa muito e termina pouco",
        "Dispersa com novidades",
        "Dificuldade em manter rotina",
      ],
      focus: "Manter foco e terminar o que começou",
      coachTone: "motivador",
    },
    S: {
      title: "Estável",
      subtitle: "Perfil S",
      description: "Você é uma pessoa calma, ponderada e que valoriza segurança. Sabe o que precisa fazer, mas evita tomar decisões por medo de errar.",
      traits: [
        "Calmo e ponderado",
        "Confiável e consistente",
        "Bom ouvinte e observador",
        "Valoriza harmonia e segurança",
      ],
      weaknesses: [
        "Evita tomar decisões",
        "Espera o momento perfeito",
        "Medo de mudanças",
        "Dificuldade em dizer não",
      ],
      focus: "Decidir mais rápido e agir sem esperar",
      coachTone: "acolhedor",
    },
    C: {
      title: "Conformidade",
      subtitle: "Perfil C",
      description: "Você é uma pessoa analítica, organizada e que busca perfeição. Pensa demais antes de agir, o que muitas vezes paralisa a execução.",
      traits: [
        "Analítico e detalhista",
        "Organizado e metódico",
        "Busca qualidade e precisão",
        "Gosta de planejar antes de agir",
      ],
      weaknesses: [
        "Pensa demais, age de menos",
        "Excesso de planejamento",
        "Medo de errar paralisa",
        "Dificuldade em aceitar imperfeição",
      ],
      focus: "Agir mais e pensar menos",
      coachTone: "lógico",
    },
  };
  return map[profile];
}

// Descrição do ponto de travamento P4
export function getP4BlockageDescription(blockage: P4Blockage): {
  title: string;
  description: string;
  action: string;
} {
  const map: Record<P4Blockage, ReturnType<typeof getP4BlockageDescription>> = {
    parar: {
      title: "Travado no PARAR",
      description: "Você vive no automático. Não consegue interromper os padrões que te prejudicam.",
      action: "Pratique pausas conscientes antes de qualquer decisão",
    },
    pensar: {
      title: "Travado no PENSAR",
      description: "Você não entende o que sente ou por que trava. Falta clareza sobre o problema real.",
      action: "Reserve 5 minutos para escrever o que está sentindo antes de agir",
    },
    decidir: {
      title: "Travado no DECIDIR",
      description: "Você sabe o que precisa fazer, mas não decide. A indecisão é o seu maior inimigo.",
      action: "Defina prazos curtos para cada decisão — máximo 2 minutos",
    },
    agir: {
      title: "Travado no AGIR",
      description: "Você planeja, decide, mas na hora de executar, paralisa. O problema está na ação.",
      action: "Use a regra dos 2 minutos: comece com a menor ação possível",
    },
  };
  return map[blockage];
}

// Diagnóstico completo integrado
export function getFullDiagnosis(profile: DISCProfile, blockage: P4Blockage, energySlots: EnergySlot[]): {
  summary: string;
  problem: string;
  actions: string[];
} {
  const disc = getDISCDescription(profile);
  const block = getP4BlockageDescription(blockage);

  const peakSlot = energySlots.reduce<EnergySlot | null>((best, slot) => {
    const levels: Record<EnergyLevel, number> = { high: 3, medium: 2, low: 1 };
    if (!best || levels[slot.level] > levels[best.level]) return slot;
    return best;
  }, null);

  const periodNames: Record<string, string> = {
    morning: "pela manhã",
    afternoon: "à tarde",
    evening: "à noite",
    night: "de madrugada",
  };
  const peakName = peakSlot ? periodNames[peakSlot.period] || "" : "";

  const summary = `Você é ${disc.title} (${profile}), com dificuldade em ${blockage.toUpperCase()}${peakName ? `, e maior energia ${peakName}` : ""}.`;

  const problemMap: Record<DISCProfile, Record<P4Blockage, string>> = {
    D: {
      parar: "Você age no impulso sem parar pra pensar. Precisa frear antes de atropelar.",
      pensar: "Você executa rápido mas sem clareza. Precisa entender o problema antes de resolver.",
      decidir: "Você decide rápido demais e muda de ideia. Precisa de firmeza na escolha.",
      agir: "Você tem energia mas desperdiça em coisas erradas. Precisa direcionar a ação.",
    },
    I: {
      parar: "Você se empolga e não para pra avaliar. Precisa de pausas antes de começar algo novo.",
      pensar: "Você tem muitas ideias mas nenhuma clareza. Precisa focar antes de criar.",
      decidir: "Você adia decisões porque algo mais interessante aparece. Precisa de compromisso.",
      agir: "Você não precisa de mais ideias. Precisa terminar o que começou.",
    },
    S: {
      parar: "Você para demais e não sai do lugar. Precisa de menos pausa e mais movimento.",
      pensar: "Você entende o que precisa fazer mas não se sente pronto. A prontidão é uma ilusão.",
      decidir: "Você sabe o que fazer mas espera o momento perfeito. Ele não existe.",
      agir: "Você decide mas não executa. Precisa de ação imediata, mesmo imperfeita.",
    },
    C: {
      parar: "Você analisa em excesso antes de parar. Precisa simplificar o processo.",
      pensar: "Você já pensou o suficiente. Mais análise só aumenta a paralisia.",
      decidir: "Você quer a decisão perfeita. Mas uma decisão boa feita agora vale mais que a perfeita feita nunca.",
      agir: "Você planeja tudo e não executa nada. Precisa agir com imperfeição.",
    },
  };

  const problem = problemMap[profile][blockage];

  const baseActions: string[] = [block.action];

  const discActions: Record<DISCProfile, string> = {
    D: "Antes de agir, escreva o objetivo em uma frase",
    I: "Escolha apenas UMA tarefa por vez",
    S: "Defina um prazo máximo de 5 minutos para decidir",
    C: "Limite seu planejamento a 3 itens no máximo",
  };

  const blockActions: Record<P4Blockage, string> = {
    parar: "Faça 3 respirações profundas antes de cada sessão",
    pensar: "Escreva em uma frase: qual é o problema real?",
    decidir: "Diga em voz alta: eu escolho fazer isso agora",
    agir: "Comece pelos primeiros 2 minutos — só isso",
  };

  const actions = [
    ...baseActions,
    discActions[profile],
    blockActions[blockage],
    peakName ? `Priorize suas tarefas mais difíceis ${peakName}` : "Identifique seu horário de pico de energia",
    "Use o fluxo P4 todos os dias — consistência é o método",
  ];

  return { summary, problem, actions };
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
