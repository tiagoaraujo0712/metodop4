import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import {
  EnergyLevel,
  getEnergyRecommendation,
  getDISCDescription,
  getP4BlockageDescription,
  getTodayKey,
} from "@/lib/store";
import { getPersonalizedPlan } from "@/lib/personalization";
import { Button } from "@/components/ui/button";
import { Zap, Target, ChevronRight, BookOpen, Lock, User } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" } as any,
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
};

const microInsights = [
  "A ação cura. A inação adoece.",
  "Consistência vence talento todos os dias.",
  "Feito é melhor que perfeito.",
  "Você não precisa de motivação. Precisa de direção.",
  "O primeiro passo não precisa ser grande. Precisa existir.",
];

export default function Guest() {
  const { state, update } = useAppState();
  const navigate = useNavigate();
  const [todayEnergy, setTodayEnergy] = useState<EnergyLevel | null>(null);

  // Se não tem perfil, usar padrão para visitante
  const user = state.user || {
    name: "Visitante",
    discProfile: "C" as const,
    p4Blockage: "agir" as const,
    procrastinationLevel: 5,
    energySlots: [],
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };

  const disc = getDISCDescription(user.discProfile);
  const hasSetEnergy = todayEnergy !== null;
  const currentEnergy = todayEnergy;
  const plan = currentEnergy
    ? getPersonalizedPlan(user.discProfile, user.p4Blockage, currentEnergy)
    : null;

  const dayIndex = new Date().getDate() % microInsights.length;
  const dailyInsight = microInsights[dayIndex];

  function handleEnergySelect(level: EnergyLevel) {
    setTodayEnergy(level);
  }

  function getCurrentPeriod() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Manhã";
    if (h >= 12 && h < 18) return "Tarde";
    if (h >= 18 && h < 22) return "Noite";
    return "Madrugada";
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Guest banner */}
      <motion.div {...reveal} className="px-6 pt-10 pb-2">
        <button
          onClick={() => navigate("/auth")}
          className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 active:scale-[0.97] transition-transform"
        >
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-primary font-medium flex-1 text-left">
            Modo visitante — Crie sua conta para salvar seu progresso
          </p>
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
        </button>
      </motion.div>

      <motion.div {...reveal} custom={0} className="px-6 pt-4 pb-6">
        <p className="text-muted-foreground text-sm">{getCurrentPeriod()}</p>
        <h1 className="text-2xl font-bold mt-1">
          Visitante
          <span className="text-muted-foreground font-normal">, explore o método.</span>
        </h1>
      </motion.div>

      <div className="px-6 space-y-4">
        {/* Energy Setup */}
        {!hasSetEnergy ? (
          <motion.div {...reveal} custom={2} className="p-5 rounded-xl bg-card border border-border space-y-4">
            <div>
              <p className="text-xs text-primary font-medium tracking-widest uppercase">Experimente</p>
              <h2 className="text-lg font-bold mt-1">Como está sua energia agora?</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { level: "low" as EnergyLevel, label: "Baixa", emoji: "🔋" },
                { level: "medium" as EnergyLevel, label: "Média", emoji: "⚡" },
                { level: "high" as EnergyLevel, label: "Alta", emoji: "🔥" },
              ]).map(({ level, label, emoji }) => (
                <button
                  key={level}
                  onClick={() => handleEnergySelect(level)}
                  className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.95] text-left"
                >
                  <span className="text-2xl">{emoji}</span>
                  <p className="text-xs font-medium mt-2">{label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : plan ? (
          <>
            <motion.div {...reveal} custom={2} className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary font-medium tracking-widest uppercase">Exemplo de perfil</p>
              </div>
              <p className="text-sm font-medium text-foreground">{plan.profileLabel}</p>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{plan.interpretation}</p>
            </motion.div>

            <motion.div {...reveal} custom={2.5} className="p-5 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary font-medium tracking-widest uppercase">Recomendação</p>
              </div>
              <p className="text-sm text-foreground/80">{plan.approach}</p>
            </motion.div>
          </>
        ) : null}

        {/* Método P4 */}
        <motion.div {...reveal} custom={3}>
          <button
            onClick={() => navigate("/metodo")}
            className="w-full p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Conheça o Método P4</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Parar · Pensar · Decidir · Agir</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </motion.div>

        {/* CTA criar conta */}
        <motion.div {...reveal} custom={4}>
          <Button
            onClick={() => navigate("/auth")}
            className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
          >
            Criar minha conta gratuita
          </Button>
        </motion.div>

        <motion.div {...reveal} custom={5} className="pt-2">
          <p className="text-xs text-muted-foreground italic text-center">
            "{dailyInsight}"
          </p>
        </motion.div>
      </div>
    </div>
  );
}
