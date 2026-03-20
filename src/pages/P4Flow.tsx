import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { getTodayKey, EnergyLevel } from "@/lib/store";
import { getP4FlowCopy, getEnergyTaskSuggestion } from "@/lib/personalization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pause, Brain, Crosshair, Rocket, Plus, X, Check } from "lucide-react";

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" } as any,
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.3 } },
};

const steps = [
  { key: "parar", icon: Pause, label: "PARAR", color: "text-red-400" },
  { key: "pensar", icon: Brain, label: "PENSAR", color: "text-blue-400" },
  { key: "decidir", icon: Crosshair, label: "DECIDIR", color: "text-amber-400" },
  { key: "agir", icon: Rocket, label: "AGIR", color: "text-primary" },
];

export default function P4Flow() {
  const { state, update } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [breathCount, setBreathCount] = useState(60);
  const [breathing, setBreathing] = useState(false);
  const [task, setTask] = useState("");
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Energia do dia
  const todayEntry = state.dailyEntries.find((e) => e.date === getTodayKey());
  const energy: EnergyLevel = todayEntry?.energyLevel || "medium";

  // Breathing timer
  useEffect(() => {
    if (!breathing) return;
    if (breathCount <= 0) {
      setBreathing(false);
      return;
    }
    const t = setTimeout(() => setBreathCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [breathing, breathCount]);

  // Focus timer
  useEffect(() => {
    if (!focusRunning) return;
    timerRef.current = setInterval(() => {
      setFocusTime((t) => {
        if (t <= 1) {
          setFocusRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [focusRunning]);

  // Ajustar tempo de foco baseado na energia
  useEffect(() => {
    if (energy === "low") setFocusTime(10 * 60);
    else if (energy === "high") setFocusTime(25 * 60);
    else setFocusTime(15 * 60);
  }, [energy]);

  function addMicroStep() {
    if (!newStep.trim()) return;
    setMicroSteps((p) => [...p, newStep.trim()]);
    setNewStep("");
  }

  function completeP4() {
    update((s) => {
      const entries = s.dailyEntries.filter((e) => e.date !== getTodayKey());
      const existing = s.dailyEntries.find((e) => e.date === getTodayKey());
      const initialTime = energy === "low" ? 10 * 60 : energy === "high" ? 25 * 60 : 15 * 60;
      return {
        ...s,
        dailyEntries: [
          ...entries,
          {
            ...existing,
            date: getTodayKey(),
            energyLevel: existing?.energyLevel || "medium",
            p4Completed: true,
            task,
            microSteps,
            focusMinutes: Math.round((initialTime - focusTime) / 60),
            completedAt: new Date().toISOString(),
          },
        ],
      };
    });
    navigate("/dashboard");
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Textos adaptados pela energia
  const pararCopy = getP4FlowCopy(energy, "parar") || "Acelerar quando você está perdido só te faz bater na parede mais rápido. Respire e zere o ruído.";
  const pensarCopy = getP4FlowCopy(energy, "pensar") || "Trabalho cego traz confusão. Qual é a única tarefa que move o ponteiro de verdade hoje?";
  const decidirCopy = getP4FlowCopy(energy, "decidir") || "O caos pune. A estrutura salva. O que exatamente você vai fazer?";
  const agirCopy = getP4FlowCopy(energy, "agir") || "Você não precisa de motivação. Precisa de movimento.";
  const taskSuggestion = getEnergyTaskSuggestion(energy);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 active:scale-[0.95] transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              P{i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <AnimatePresence mode="wait">
          {/* P1: PARAR */}
          {step === 0 && (
            <motion.div key="parar" {...fadeSlide} className="max-w-md w-full text-center space-y-8">
              <div>
                <Pause className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold tracking-tight leading-[1.1]">PARAR</h2>
                <p className="text-muted-foreground text-sm mt-2">Interrompa o padrão automático.</p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <p className="text-sm text-foreground/70 text-balance">{pararCopy}</p>

                {!breathing && breathCount === 60 ? (
                  <Button
                    onClick={() => setBreathing(true)}
                    variant="outline"
                    className="w-full h-12 active:scale-[0.97] transition-transform"
                  >
                    Iniciar Pausa — 1 minuto
                  </Button>
                ) : breathing ? (
                  <div className="space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full border-2 border-primary/40 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-10 h-10 rounded-full bg-primary/20"
                      />
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{breathCount}s</p>
                    <p className="text-xs text-muted-foreground">Respire. Solte. Presente.</p>
                  </div>
                ) : (
                  <Button
                    onClick={() => setStep(1)}
                    className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
                  >
                    Pronto. Avançar.
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* P2: PENSAR */}
          {step === 1 && (
            <motion.div key="pensar" {...fadeSlide} className="max-w-md w-full space-y-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold tracking-tight leading-[1.1]">PENSAR</h2>
                <p className="text-muted-foreground text-sm mt-2">Clareza antes da ação.</p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <p className="text-sm text-foreground/70 text-balance">{pensarCopy}</p>
                <p className="text-xs text-primary/80 italic">{taskSuggestion}</p>
                <Input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Minha prioridade real hoje é..."
                  className="h-12 text-base bg-background"
                  autoFocus
                />
                <Button
                  onClick={() => setStep(2)}
                  disabled={!task.trim()}
                  className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
                >
                  Definido. Avançar.
                </Button>
              </div>
            </motion.div>
          )}

          {/* P3: DECIDIR */}
          {step === 2 && (
            <motion.div key="decidir" {...fadeSlide} className="max-w-md w-full space-y-6">
              <div className="text-center">
                <Crosshair className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold tracking-tight leading-[1.1]">DECIDIR</h2>
                <p className="text-muted-foreground text-sm mt-2">Estruture a execução.</p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <p className="text-sm text-foreground/70 text-balance">{decidirCopy}</p>

                <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                  <span className="text-muted-foreground">Tarefa: </span>
                  <span className="font-medium">{task}</span>
                </div>

                <div className="space-y-2">
                  {microSteps.map((ms, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm flex-1">{ms}</span>
                      <button onClick={() => setMicroSteps((p) => p.filter((_, j) => j !== i))}>
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    placeholder="Micro-etapa (ex: Abrir o documento)"
                    className="h-10 text-sm bg-background"
                    onKeyDown={(e) => e.key === "Enter" && addMicroStep()}
                  />
                  <Button onClick={addMicroStep} size="icon" variant="outline" className="shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => setStep(3)}
                  disabled={microSteps.length === 0}
                  className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
                >
                  Eu decido agir
                </Button>
              </div>
            </motion.div>
          )}

          {/* P4: AGIR */}
          {step === 3 && (
            <motion.div key="agir" {...fadeSlide} className="max-w-md w-full text-center space-y-8">
              <div>
                <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold tracking-tight leading-[1.1]">AGIR</h2>
                <p className="text-muted-foreground text-sm mt-2">{agirCopy}</p>
              </div>

              <div className="space-y-4">
                <div className="text-6xl font-bold tabular-nums text-primary">
                  {formatTime(focusTime)}
                </div>

                <p className="text-sm text-muted-foreground">{task}</p>

                {energy === "low" && (
                  <p className="text-xs text-primary/70 italic">Sessão reduzida — 10 min. Faça o mínimo.</p>
                )}

                {!focusRunning && focusTime === (energy === "low" ? 10 * 60 : energy === "high" ? 25 * 60 : 15 * 60) ? (
                  <Button
                    onClick={() => setFocusRunning(true)}
                    className="w-full h-14 text-lg font-bold active:scale-[0.97] transition-transform"
                  >
                    🚀 Começar Foco
                  </Button>
                ) : focusRunning ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Foco absoluto. Sem menus extras.</p>
                    <Button
                      onClick={() => {
                        setFocusRunning(false);
                        completeP4();
                      }}
                      variant="outline"
                      className="w-full h-12 active:scale-[0.97] transition-transform"
                    >
                      ✓ Concluir Sessão
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={completeP4}
                    className="w-full h-14 text-lg font-bold active:scale-[0.97] transition-transform"
                  >
                    ✓ Sessão Concluída
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
