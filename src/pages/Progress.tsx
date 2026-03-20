import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { calculateStreak, getDISCDescription, getP4BlockageDescription, getFullDiagnosis } from "@/lib/store";
import { ArrowLeft, Flame, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" } as any,
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
};

export default function Progress() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const user = state.user;

  if (!user) return null;

  const completedDays = state.dailyEntries.filter((e) => e.p4Completed);
  const streak = calculateStreak(state.dailyEntries);
  const disc = getDISCDescription(user.discProfile);
  const block = getP4BlockageDescription(user.p4Blockage);
  const diagnosis = getFullDiagnosis(user.discProfile, user.p4Blockage, user.energySlots);
  const totalFocusMinutes = state.dailyEntries.reduce((sum, e) => sum + (e.focusMinutes || 0), 0);

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const entry = state.dailyEntries.find((e) => e.date === key);
    return {
      day: d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3),
      completed: entry?.p4Completed || false,
      date: key,
    };
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-6 pt-12 pb-6 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 active:scale-[0.95] transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Progresso</h1>
      </div>

      <div className="px-6 space-y-4">
        {/* Main stats */}
        <motion.div {...reveal} custom={0} className="grid grid-cols-2 gap-3">
          <div className="p-5 rounded-xl bg-card border border-border">
            <Flame className="w-5 h-5 text-primary mb-2" />
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">Dias consecutivos</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-3xl font-bold">{completedDays.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Sessões completas</p>
          </div>
        </motion.div>

        <motion.div {...reveal} custom={1} className="p-5 rounded-xl bg-card border border-border">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-3xl font-bold">{totalFocusMinutes} <span className="text-lg text-muted-foreground font-normal">min</span></p>
          <p className="text-xs text-muted-foreground mt-1">Tempo total em foco</p>
        </motion.div>

        {/* Week view */}
        <motion.div {...reveal} custom={2} className="p-5 rounded-xl bg-card border border-border space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Últimos 7 dias</p>
          <div className="flex gap-2 justify-between">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    d.completed ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {d.completed ? "✓" : ""}
                </div>
                <span className="text-xs text-muted-foreground capitalize">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* DISC Profile */}
        <motion.div {...reveal} custom={3} className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Perfil Comportamental</p>
          <h3 className="text-lg font-bold">{disc.title} ({user.discProfile})</h3>
          <p className="text-sm text-muted-foreground">{disc.description}</p>
          <div className="space-y-1.5 pt-2 border-t border-border">
            {disc.traits.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-foreground/80">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* P4 Blockage */}
        <motion.div {...reveal} custom={4} className="p-5 rounded-xl bg-card border border-border space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Ponto de Travamento</p>
          <h3 className="text-lg font-bold">{block.title}</h3>
          <p className="text-sm text-muted-foreground">{block.description}</p>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Foco: <span className="text-primary font-medium">{disc.focus}</span></p>
          </div>
        </motion.div>

        {/* Diagnosis summary */}
        <motion.div {...reveal} custom={5} className="p-5 rounded-xl bg-card border border-border space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Diagnóstico Completo</p>
          <p className="text-sm text-foreground/90">{diagnosis.summary}</p>
          <p className="text-sm text-muted-foreground">{diagnosis.problem}</p>
        </motion.div>
      </div>
    </div>
  );
}
