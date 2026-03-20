import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { useAuth } from "@/hooks/useAuth";
import {
  getDISCDescription,
  getP4BlockageDescription,
  getFullDiagnosis,
  calculateStreak,
} from "@/lib/store";
import {
  ArrowLeft,
  User,
  Flame,
  Calendar,
  TrendingUp,
  RotateCcw,
  BookOpen,
  LogOut,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const reveal = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" } as any,
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

export default function Profile() {
  const { state } = useAppState();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const user = state.user;

  if (!user) return null;

  const disc = getDISCDescription(user.discProfile);
  const block = getP4BlockageDescription(user.p4Blockage);
  const diagnosis = getFullDiagnosis(user.discProfile, user.p4Blockage, user.energySlots);
  const streak = calculateStreak(state.dailyEntries);
  const completedDays = state.dailyEntries.filter((e) => e.p4Completed).length;
  const totalFocusMinutes = state.dailyEntries.reduce((sum, e) => sum + (e.focusMinutes || 0), 0);

  // Peak energy period
  const peakSlot = user.energySlots.reduce<{ period: string; level: string } | null>((best, slot) => {
    const levels: Record<string, number> = { high: 3, medium: 2, low: 1 };
    if (!best || levels[slot.level] > levels[best.level]) return slot;
    return best;
  }, null);
  const periodNames: Record<string, string> = {
    morning: "Manhã",
    afternoon: "Tarde",
    evening: "Noite",
    night: "Madrugada",
  };

  // Status message
  function getStatusMessage() {
    if (streak >= 7) return "🔥 Você está em chamas. Consistência real.";
    if (streak >= 3) return "⚡ Você está construindo consistência.";
    if (completedDays > 0) return "🌱 Começou. Agora não pare.";
    return "🎯 Seu primeiro passo começa hoje.";
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 active:scale-[0.95] transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>
        <button
          onClick={async () => { await signOut(); navigate("/auth"); }}
          className="p-2 text-muted-foreground hover:text-foreground active:scale-[0.95] transition-all"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 space-y-4">
        {/* User Card */}
        <motion.div variants={reveal} initial="initial" animate="animate" custom={0} className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{disc.title} ({user.discProfile})</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 italic">{getStatusMessage()}</p>
        </motion.div>

        {/* Diagnosis Card */}
        <motion.div variants={reveal} initial="initial" animate="animate" custom={1} className="p-5 rounded-xl bg-card border border-border space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Diagnóstico</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{diagnosis.summary}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.problem}</p>
          {peakSlot && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Pico de energia: <span className="text-primary font-medium">{periodNames[peakSlot.period] || peakSlot.period}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div variants={reveal} initial="initial" animate="animate" custom={2} className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border text-left">
            <Flame className="w-4 h-4 text-primary mb-2" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground mt-1">Sequência</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-left">
            <Calendar className="w-4 h-4 text-primary mb-2" />
            <p className="text-2xl font-bold">{completedDays}</p>
            <p className="text-xs text-muted-foreground mt-1">Dias ativos</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border text-left">
            <TrendingUp className="w-4 h-4 text-primary mb-2" />
            <p className="text-2xl font-bold">{totalFocusMinutes}</p>
            <p className="text-xs text-muted-foreground mt-1">Min foco</p>
          </div>
        </motion.div>

        {/* DISC Profile */}
        <motion.div variants={reveal} initial="initial" animate="animate" custom={3} className="p-5 rounded-xl bg-card border border-border space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Perfil Comportamental</p>
          <h3 className="text-lg font-bold">{disc.title} ({user.discProfile})</h3>
          <p className="text-sm text-muted-foreground">{disc.description}</p>
          <div className="pt-2 border-t border-border space-y-1.5">
            {disc.traits.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary text-xs mt-0.5">•</span>
                <span className="text-xs text-foreground/80">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* P4 Blockage */}
        <motion.div variants={reveal} initial="initial" animate="animate" custom={4} className="p-5 rounded-xl bg-card border border-border space-y-3">
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Ponto de Travamento</p>
          <h3 className="text-lg font-bold">{block.title}</h3>
          <p className="text-sm text-muted-foreground">{block.description}</p>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Foco: <span className="text-primary font-medium">{disc.focus}</span>
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={reveal} initial="initial" animate="animate" custom={5} className="space-y-3">
          <Button
            onClick={() => navigate("/onboarding?redo=disc")}
            variant="outline"
            className="w-full h-12 text-sm font-medium active:scale-[0.97] transition-transform gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer diagnóstico
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/metodo")}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left"
            >
              <BookOpen className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Método P4</p>
            </button>
            <button
              onClick={() => navigate("/p4")}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left"
            >
              <Target className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium">Sessão P4</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
