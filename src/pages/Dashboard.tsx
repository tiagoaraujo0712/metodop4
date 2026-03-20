import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { EnergyLevel, getEnergyRecommendation, getDISCDescription, getP4BlockageDescription, getTodayKey, calculateStreak } from "@/lib/store";
import { getPersonalizedPlan } from "@/lib/personalization";
import { Button } from "@/components/ui/button";
import { Zap, Target, ChevronRight, MessageCircle, BarChart3, User } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" } as any,
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
};

export default function Dashboard() {
  const { state, update } = useAppState();
  const navigate = useNavigate();
  const [todayEnergy, setTodayEnergy] = useState<EnergyLevel | null>(null);

  const user = state.user;
  const todayEntry = state.dailyEntries.find((e) => e.date === getTodayKey());
  const streak = calculateStreak(state.dailyEntries);
  const totalDays = state.dailyEntries.filter((e) => e.p4Completed).length;

  useEffect(() => {
    if (!user?.onboardingComplete) navigate("/onboarding");
  }, [user, navigate]);

  if (!user) return null;

  const disc = getDISCDescription(user.discProfile);
  const hasSetEnergy = todayEnergy !== null || !!todayEntry?.energyLevel;
  const currentEnergy = todayEnergy || todayEntry?.energyLevel;
  const plan = currentEnergy
    ? getPersonalizedPlan(user.discProfile, user.p4Blockage, currentEnergy)
    : null;

  function handleEnergySelect(level: EnergyLevel) {
    setTodayEnergy(level);
    update((s) => {
      const entries = s.dailyEntries.filter((e) => e.date !== getTodayKey());
      return {
        ...s,
        dailyEntries: [
          ...entries,
          { date: getTodayKey(), energyLevel: level, p4Completed: todayEntry?.p4Completed || false, ...todayEntry },
        ],
      };
    });
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
      {/* Header */}
      <motion.div {...reveal} custom={0} className="px-6 pt-12 pb-6">
        <p className="text-muted-foreground text-sm">{getCurrentPeriod()}</p>
        <h1 className="text-2xl font-bold mt-1">
          {user.name.split(" ")[0]}
          <span className="text-muted-foreground font-normal">, vamos.</span>
        </h1>
      </motion.div>

      <div className="px-6 space-y-4">
        {/* Stats */}
        <motion.div {...reveal} custom={1} className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">Streak</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold">{totalDays}</p>
            <p className="text-xs text-muted-foreground mt-1">Dias ativos</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <p className="text-2xl font-bold">{disc.title.slice(0, 3)}</p>
            <p className="text-xs text-muted-foreground mt-1">{disc.subtitle}</p>
          </div>
        </motion.div>

        {/* Energy Setup */}
        {!hasSetEnergy ? (
          <motion.div {...reveal} custom={2} className="p-5 rounded-xl bg-card border border-border space-y-4">
            <div>
              <p className="text-xs text-primary font-medium tracking-widest uppercase">Setup diário</p>
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
                  className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.95] text-center"
                >
                  <span className="text-2xl">{emoji}</span>
                  <p className="text-xs font-medium mt-2">{label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : plan ? (
          <>
            {/* Personalized Profile Card */}
            <motion.div {...reveal} custom={2} className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary font-medium tracking-widest uppercase">Seu perfil hoje</p>
              </div>
              <p className="text-sm font-medium text-foreground">{plan.profileLabel}</p>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{plan.interpretation}</p>
            </motion.div>

            {/* Approach + Task Type */}
            <motion.div {...reveal} custom={2.5} className="p-5 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary font-medium tracking-widest uppercase">Recomendação</p>
              </div>
              <p className="text-sm text-foreground/80">{plan.approach}</p>
              <div className="flex gap-2 pt-1">
                <span className="px-3 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">{plan.taskType}</span>
                <span className="px-3 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">{plan.intensity}</span>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div {...reveal} custom={2.7} className="p-5 rounded-xl bg-card border border-border space-y-2">
              <p className="text-xs text-primary font-medium tracking-widest uppercase">Plano de ação</p>
              {plan.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <span className="text-primary font-bold text-sm mt-0.5">{i + 1}</span>
                  <span className="text-sm text-foreground/80">{action}</span>
                </div>
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div {...reveal} custom={2} className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-xs text-primary font-medium tracking-widest uppercase">Recomendação</p>
            </div>
            <p className="text-sm text-foreground/80">
              {getEnergyRecommendation(currentEnergy!)}
            </p>
          </motion.div>
        )}

        {/* P4 CTA */}
        <motion.div {...reveal} custom={3}>
          <button
            onClick={() => navigate("/p4")}
            className={`w-full p-5 rounded-xl border transition-all duration-200 active:scale-[0.97] text-left ${
              todayEntry?.p4Completed
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  todayEntry?.p4Completed ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {todayEntry?.p4Completed ? "Sessão P4 concluída ✓" : "Iniciar Sessão P4"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Parar · Pensar · Decidir · Agir
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </motion.div>

        {/* Coach tip */}
        {plan && (
          <motion.div {...reveal} custom={3.5}>
            <button
              onClick={() => navigate("/coach")}
              className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left"
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Coach P4</p>
                  <p className="text-xs text-muted-foreground mt-1">{plan.coachTip}</p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div {...reveal} custom={4} className="grid grid-cols-2 gap-3">
          {!plan && (
            <button
              onClick={() => navigate("/coach")}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left"
            >
              <MessageCircle className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Coach P4</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fale com a IA</p>
            </button>
          )}
          <button
            onClick={() => navigate("/progress")}
            className={`p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left ${plan ? "col-span-2" : ""}`}
          >
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Progresso</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sua evolução</p>
          </button>
        </motion.div>

        {/* Daily phrase */}
        <motion.div {...reveal} custom={5} className="pt-4">
          <p className="text-center text-xs text-muted-foreground italic">
            "A ação cura. A inação adoece."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
