// Coach P4 — Sistema de Memória e Detecção de Padrões

import { DISCProfile, P4Blockage, AppState, getTodayKey } from "./store";

export interface CoachInteraction {
  date: string;
  timestamp: string;
  userMessage: string;
  coachResponse: string;
  detectedTopic?: string;
}

export interface CoachInsight {
  type: "pattern" | "streak" | "improvement" | "warning";
  message: string;
  date: string;
}

export interface CoachMemory {
  interactions: CoachInteraction[];
  insights: CoachInsight[];
  failedTaskCount: number;
  repeatedTopics: Record<string, number>;
  lastActiveDate: string;
  consecutiveInactiveDays: number;
}

const COACH_MEMORY_KEY = "metodo-p4-coach-memory";

function defaultMemory(): CoachMemory {
  return {
    interactions: [],
    insights: [],
    failedTaskCount: 0,
    repeatedTopics: {},
    lastActiveDate: "",
    consecutiveInactiveDays: 0,
  };
}

export function loadCoachMemory(): CoachMemory {
  try {
    const raw = localStorage.getItem(COACH_MEMORY_KEY);
    if (!raw) return defaultMemory();
    return JSON.parse(raw);
  } catch {
    return defaultMemory();
  }
}

export function saveCoachMemory(memory: CoachMemory): void {
  localStorage.setItem(COACH_MEMORY_KEY, JSON.stringify(memory));
}

export function addInteraction(
  userMessage: string,
  coachResponse: string,
  topic?: string
): void {
  const memory = loadCoachMemory();
  const now = new Date();
  memory.interactions.push({
    date: getTodayKey(),
    timestamp: now.toISOString(),
    userMessage,
    coachResponse,
    detectedTopic: topic,
  });

  // Manter últimas 100 interações
  if (memory.interactions.length > 100) {
    memory.interactions = memory.interactions.slice(-100);
  }

  // Rastrear tópicos repetidos
  if (topic) {
    memory.repeatedTopics[topic] = (memory.repeatedTopics[topic] || 0) + 1;
  }

  memory.lastActiveDate = getTodayKey();
  saveCoachMemory(memory);
}

// Detectar tópico da mensagem do usuário
export function detectTopic(input: string): string {
  const lc = input.toLowerCase();
  if (lc.includes("travado") || lc.includes("paralisado") || lc.includes("não consigo") || lc.includes("nao consigo")) return "travamento";
  if (lc.includes("cansado") || lc.includes("sem energia") || lc.includes("exausto")) return "energia_baixa";
  if (lc.includes("procrastinando") || lc.includes("adiando") || lc.includes("procrastina")) return "procrastinacao";
  if (lc.includes("desculpa") || lc.includes("amanhã") || lc.includes("depois")) return "adiamento";
  if (lc.includes("motivação") || lc.includes("motivado")) return "motivacao";
  if (lc.includes("medo") || lc.includes("ansiedade") || lc.includes("ansioso")) return "medo";
  if (lc.includes("foco") || lc.includes("concentr")) return "foco";
  if (lc.includes("desist") || lc.includes("largar")) return "desistencia";
  if (lc.includes("confuso") || lc.includes("perdido") || lc.includes("não sei")) return "confusao";
  if (lc.includes("conquist") || lc.includes("consegui") || lc.includes("fiz")) return "conquista";
  return "geral";
}

// Detectar padrões de comportamento
export function detectPatterns(memory: CoachMemory, appState: AppState): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const today = getTodayKey();

  // Padrão: mesmo tópico aparecendo muitas vezes
  Object.entries(memory.repeatedTopics).forEach(([topic, count]) => {
    if (count >= 3) {
      const topicLabels: Record<string, string> = {
        travamento: "travamento",
        energia_baixa: "falta de energia",
        procrastinacao: "procrastinação",
        adiamento: "adiamento",
        medo: "medo",
        foco: "falta de foco",
        desistencia: "vontade de desistir",
        confusao: "confusão",
      };
      const label = topicLabels[topic] || topic;
      insights.push({
        type: "pattern",
        message: `Você já mencionou "${label}" ${count} vezes. Isso é um padrão, não um acidente.`,
        date: today,
      });
    }
  });

  // Padrão: dias sem usar o app
  const entries = appState.dailyEntries;
  const lastEntry = entries.length > 0
    ? entries.sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;
  if (lastEntry) {
    const lastDate = new Date(lastEntry.date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 2) {
      insights.push({
        type: "warning",
        message: `Você está há ${diffDays} dias sem completar uma sessão P4. Consistência importa mais que intensidade.`,
        date: today,
      });
    }
  }

  // Padrão: sessões P4 sem completar
  const incompleteDays = entries.filter((e) => !e.p4Completed).length;
  if (incompleteDays >= 3) {
    insights.push({
      type: "warning",
      message: `Você iniciou ${incompleteDays} sessões sem concluir. Está repetindo o padrão de começar sem terminar.`,
      date: today,
    });
  }

  // Melhora: streak crescente
  const completedDays = entries.filter((e) => e.p4Completed).length;
  if (completedDays >= 3 && completedDays % 3 === 0) {
    insights.push({
      type: "improvement",
      message: `Você já completou ${completedDays} sessões. Está construindo um padrão de execução.`,
      date: today,
    });
  }

  return insights;
}

// Mensagens proativas baseadas no estado
export function getProactiveMessages(
  appState: AppState,
  memory: CoachMemory,
  discProfile: DISCProfile,
  blockage: P4Blockage
): string[] {
  const messages: string[] = [];
  const today = getTodayKey();
  const todayEntry = appState.dailyEntries.find((e) => e.date === today);

  // Não iniciou sessão hoje
  if (!todayEntry?.p4Completed) {
    const hour = new Date().getHours();
    if (hour >= 10) {
      messages.push("Você ainda não iniciou sua sessão P4 hoje.");
    }
  }

  // Horário de pico de energia
  const hour = new Date().getHours();
  const currentPeriod = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : hour >= 18 && hour < 22 ? "evening" : "night";
  const peakSlot = appState.user?.energySlots.find((s) => s.level === "high");
  if (peakSlot && peakSlot.period === currentPeriod) {
    messages.push("Esse é seu horário de maior energia. Use para a tarefa mais difícil.");
  }

  // Inatividade prolongada
  const lastInteraction = memory.interactions[memory.interactions.length - 1];
  if (lastInteraction) {
    const lastDate = new Date(lastInteraction.timestamp);
    const hoursSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
    if (hoursSince > 48) {
      messages.push("Você está há muito tempo sem executar. Padrões se reforçam com inação.");
    }
  }

  // Baseado no DISC
  if (discProfile === "I" && memory.repeatedTopics["procrastinacao"] && memory.repeatedTopics["procrastinacao"] >= 2) {
    messages.push("Você é bom em começar, mas precisa terminar. Foque em uma coisa só.");
  }
  if (discProfile === "C" && memory.repeatedTopics["travamento"] && memory.repeatedTopics["travamento"] >= 2) {
    messages.push("Você está analisando demais. O plano já existe. Execute.");
  }

  return messages;
}

// Reforço de identidade após ações
export function getIdentityReinforcement(
  appState: AppState,
  discProfile: DISCProfile
): string | null {
  const todayEntry = appState.dailyEntries.find((e) => e.date === getTodayKey());
  if (!todayEntry?.p4Completed) return null;

  const completedTotal = appState.dailyEntries.filter((e) => e.p4Completed).length;

  const reinforcements: Record<DISCProfile, string[]> = {
    D: [
      "Você executou. É assim que resultados aparecem.",
      "Decisão + ação. Sem enrolação. Seu perfil em ação.",
      "Mais um dia de execução. Continue nessa direção.",
    ],
    I: [
      "Você não só começou — terminou. Isso é evolução real.",
      "Sua energia virou resultado hoje. Consistência constrói legado.",
      "Você agiu mesmo sem estar 100% motivado. Isso é maturidade.",
    ],
    S: [
      "Você decidiu e agiu. No seu ritmo, mas sem parar. Isso importa.",
      "Segurança vem de ação, não de espera. Você provou isso hoje.",
      "Mais um dia que você escolheu se mover. Isso constrói confiança.",
    ],
    C: [
      "Agiu sem esperar a perfeição. Isso é progresso real.",
      "Feito é melhor que perfeito. E você fez.",
      "Menos análise, mais execução. Você está quebrando o padrão.",
    ],
  };

  const options = reinforcements[discProfile];
  const idx = completedTotal % options.length;
  return options[idx];
}

// Contagem de sessões do coach hoje
export function getTodayCoachSessions(memory: CoachMemory): number {
  const today = getTodayKey();
  return memory.interactions.filter((i) => i.date === today).length;
}

// Resumo do histórico para contexto
export function getHistorySummary(memory: CoachMemory): string {
  const totalSessions = memory.interactions.length;
  const topTopics = Object.entries(memory.repeatedTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);

  if (totalSessions === 0) return "Essa é sua primeira conversa com o Coach.";

  const topicLabels: Record<string, string> = {
    travamento: "travamento",
    energia_baixa: "falta de energia",
    procrastinacao: "procrastinação",
    adiamento: "adiamento",
    medo: "medo",
    foco: "foco",
    desistencia: "desistência",
    confusao: "confusão",
    conquista: "conquistas",
    motivacao: "motivação",
    geral: "geral",
  };

  const topLabels = topTopics.map((t) => topicLabels[t] || t).join(", ");
  return `Já conversamos ${totalSessions} vezes. Seus temas frequentes: ${topLabels || "variados"}.`;
}
