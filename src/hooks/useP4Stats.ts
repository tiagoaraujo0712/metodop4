import { useMemo } from "react";
import { DailyEntry, P4Blockage } from "@/lib/store";

export interface P4Stats {
  parar: number;
  pensar: number;
  decidir: number;
  agir: number;
}

export interface P4Analysis {
  stats: P4Stats;
  blockagePhase: P4Blockage;
  blockagePercentage: number;
  totalSessions: number;
  averagePerPhase: number;
  trend: "improving" | "stable" | "declining";
}

/**
 * Hook para calcular estatísticas dos 4 Ps baseado no histórico de entradas diárias
 */
export function useP4Stats(entries: DailyEntry[]): P4Analysis {
  return useMemo(() => {
    const stats: P4Stats = {
      parar: 0,
      pensar: 0,
      decidir: 0,
      agir: 0,
    };

    // Contar sessões por fase
    entries.forEach((entry) => {
      if (entry.task) {
        const task = entry.task.toLowerCase();

        // Lógica de detecção de fase baseada em palavras-chave
        if (
          task.includes("parar") ||
          task.includes("pause") ||
          task.includes("respirar")
        ) {
          stats.parar++;
        } else if (
          task.includes("pensar") ||
          task.includes("think") ||
          task.includes("refletir") ||
          task.includes("clareza")
        ) {
          stats.pensar++;
        } else if (
          task.includes("decidir") ||
          task.includes("decide") ||
          task.includes("decisão")
        ) {
          stats.decidir++;
        } else if (
          task.includes("agir") ||
          task.includes("act") ||
          task.includes("ação")
        ) {
          stats.agir++;
        }
      }
    });

    const total = stats.parar + stats.pensar + stats.decidir + stats.agir;
    const entries_array = Object.entries(stats);
    const [blockageKey, blockageValue] = entries_array.reduce((min, curr) =>
      curr[1] < min[1] ? curr : min
    );

    // Calcular tendência (últimas 10 vs anteriores)
    const recentEntries = entries.slice(-10);
    const olderEntries = entries.slice(0, Math.max(0, entries.length - 10));

    let recentTotal = 0;
    let olderTotal = 0;

    recentEntries.forEach((entry) => {
      if (entry.p4Completed) recentTotal++;
    });

    olderEntries.forEach((entry) => {
      if (entry.p4Completed) olderTotal++;
    });

    let trend: "improving" | "stable" | "declining" = "stable";
    if (recentTotal > olderTotal * 1.1) {
      trend = "improving";
    } else if (recentTotal < olderTotal * 0.9) {
      trend = "declining";
    }

    return {
      stats,
      blockagePhase: blockageKey as P4Blockage,
      blockagePercentage: total > 0 ? (blockageValue / total) * 100 : 0,
      totalSessions: total,
      averagePerPhase: total > 0 ? total / 4 : 0,
      trend,
    };
  }, [entries]);
}

/**
 * Hook para obter insights personalizados baseado no padrão de bloqueio
 */
export function useP4Insights(analysis: P4Analysis): string {
  return useMemo(() => {
    const { blockagePhase, blockagePercentage, trend } = analysis;

    const insights: Record<P4Blockage, string> = {
      parar: `Você trava em PARAR. Dica: Pratique pausas de 2 minutos antes de decisões importantes. Respiração consciente é sua ferramenta.`,
      pensar: `Você trava em PENSAR. Dica: Não precisa de clareza perfeita. Decida com 70% de informação. Ação gera aprendizado.`,
      decidir: `Você trava em DECIDIR. Dica: Escolha entre 2-3 opções máximo. Indecisão é uma decisão também.`,
      agir: `Você trava em AGIR. Dica: Comece pequeno. Um passo de 1% é melhor que nenhum. O momentum vem da ação.`,
    };

    let insight = insights[blockagePhase];

    if (trend === "improving") {
      insight += " 📈 E você está melhorando!";
    } else if (trend === "declining") {
      insight += " ⚠️ Mas você pode melhorar. Volte aos fundamentos.";
    }

    return insight;
  }, [analysis]);
}

/**
 * Hook para calcular recomendações de prática
 */
export function useP4Recommendations(
  analysis: P4Analysis,
  userBlockage: P4Blockage
): string[] {
  return useMemo(() => {
    const recommendations: string[] = [];

    // Recomendação baseada no bloqueio geral do usuário
    if (userBlockage === "parar") {
      recommendations.push("Agende pausas no seu calendário");
      recommendations.push("Use técnica Pomodoro (25 min + 5 min pausa)");
    } else if (userBlockage === "pensar") {
      recommendations.push("Limite tempo de análise a 10 minutos");
      recommendations.push("Use a regra 70%: decida com 70% de informação");
    } else if (userBlockage === "decidir") {
      recommendations.push("Reduza opções: máximo 3 alternativas");
      recommendations.push("Use critério: qual opção dá mais aprendizado?");
    } else if (userBlockage === "agir") {
      recommendations.push("Defina ação mínima: o que é 1% de progresso?");
      recommendations.push("Comprometa-se publicamente com alguém");
    }

    // Recomendação baseada no padrão atual
    if (analysis.blockagePercentage > 40) {
      recommendations.push(
        `Foco: ${analysis.blockagePhase.toUpperCase()}. Você trava aqui ${Math.round(analysis.blockagePercentage)}% das vezes.`
      );
    }

    return recommendations;
  }, [analysis, userBlockage]);
}
