import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

interface P4Stats {
  parar: number;
  pensar: number;
  decidir: number;
  agir: number;
}

interface EvolutionDashboardProps {
  stats: P4Stats;
  totalSessions: number;
}

export function EvolutionDashboard({
  stats,
  totalSessions,
}: EvolutionDashboardProps) {
  const total = stats.parar + stats.pensar + stats.decidir + stats.agir;
  const maxValue = Math.max(stats.parar, stats.pensar, stats.decidir, stats.agir, 1);

  const phases = [
    { key: "parar", label: "Parar", color: "bg-blue-500", icon: "🧘" },
    { key: "pensar", label: "Pensar", color: "bg-yellow-500", icon: "💡" },
    { key: "decidir", label: "Decidir", color: "bg-purple-500", icon: "⚡" },
    { key: "agir", label: "Agir", color: "bg-green-500", icon: "🎯" },
  ] as const;

  const getPercentage = (value: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const getBlockagePhase = (): string => {
    const entries = Object.entries(stats);
    const minEntry = entries.reduce((min, curr) =>
      curr[1] < min[1] ? curr : min
    );
    return minEntry[0];
  };

  const blockagePhase = getBlockagePhase();
  const blockageLabel = phases.find((p) => p.key === blockagePhase)?.label || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      }}
      className="p-5 rounded-xl bg-card border border-border space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <span className="text-xs font-medium text-primary uppercase tracking-widest">
          Evolução
        </span>
      </div>

      {/* Insight */}
      {total > 0 && (
        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
          <p className="text-sm font-semibold">
            Você trava mais em <span className="text-primary">{blockageLabel}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats[blockagePhase as keyof P4Stats]} de {total} sessões ({getPercentage(stats[blockagePhase as keyof P4Stats]).toFixed(0)}%)
          </p>
        </div>
      )}

      {/* Bar Chart */}
      <div className="space-y-3">
        {phases.map(({ key, label, color, icon }) => {
          const value = stats[key];
          const percentage = getPercentage(value);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {value}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      {total > 0 && (
        <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total de Sessões</p>
            <p className="text-lg font-bold mt-1">{total}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Média por Fase</p>
            <p className="text-lg font-bold mt-1">
              {(total / 4).toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {total === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Comece uma sessão P4 para ver sua evolução aqui
          </p>
        </div>
      )}
    </motion.div>
  );
}
