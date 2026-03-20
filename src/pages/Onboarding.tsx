import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { DISCProfile, EnergySlot, EnergyLevel } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, Brain, Target, Flame } from "lucide-react";

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" } as any,
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.3 } },
};

// DISC test questions
const discQuestions = [
  {
    q: "Quando você tem uma tarefa importante, o que acontece primeiro?",
    options: [
      { label: "Começo imediatamente, sem pensar muito", profile: "D" as DISCProfile },
      { label: "Fico empolgado e planejo grande, mas perco o foco", profile: "I" as DISCProfile },
      { label: "Sei o que fazer, mas fico esperando o momento certo", profile: "S" as DISCProfile },
      { label: "Pesquiso tudo antes de dar o primeiro passo", profile: "C" as DISCProfile },
    ],
  },
  {
    q: "O que mais te trava no dia a dia?",
    options: [
      { label: "Falta de direção — faço muito, mas sem foco", profile: "D" as DISCProfile },
      { label: "Falta de consistência — começo e paro", profile: "I" as DISCProfile },
      { label: "Medo de errar — preciso de segurança", profile: "S" as DISCProfile },
      { label: "Pensar demais — fico preso na análise", profile: "C" as DISCProfile },
    ],
  },
  {
    q: "Como você reage quando se sente sobrecarregado?",
    options: [
      { label: "Faço qualquer coisa pra sair desse estado", profile: "D" as DISCProfile },
      { label: "Busco distração ou conversa com alguém", profile: "I" as DISCProfile },
      { label: "Paro e espero passar", profile: "S" as DISCProfile },
      { label: "Tento organizar tudo mentalmente", profile: "C" as DISCProfile },
    ],
  },
  {
    q: "Como você lida com prazos apertados?",
    options: [
      { label: "Entrego rápido, mesmo que imperfeito", profile: "D" as DISCProfile },
      { label: "Me motivo sob pressão, mas é caótico", profile: "I" as DISCProfile },
      { label: "Fico ansioso e evito começar", profile: "S" as DISCProfile },
      { label: "Sinto que preciso de mais tempo pra fazer direito", profile: "C" as DISCProfile },
    ],
  },
  {
    q: "O que te descreveria melhor?",
    options: [
      { label: "Ação sem planejamento", profile: "D" as DISCProfile },
      { label: "Entusiasmo sem constância", profile: "I" as DISCProfile },
      { label: "Cautela sem decisão", profile: "S" as DISCProfile },
      { label: "Análise sem execução", profile: "C" as DISCProfile },
    ],
  },
];

const periods = [
  { key: "morning" as const, label: "Manhã", icon: "☀️" },
  { key: "afternoon" as const, label: "Tarde", icon: "🌤️" },
  { key: "evening" as const, label: "Noite", icon: "🌙" },
  { key: "night" as const, label: "Madrugada", icon: "🌑" },
];

export default function Onboarding() {
  const { update } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [discAnswers, setDiscAnswers] = useState<DISCProfile[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [energySlots, setEnergySlots] = useState<EnergySlot[]>([]);
  const [procLevel, setProcLevel] = useState(5);

  // Steps: 0=intro, 1=name, 2=disc test, 3=procrastination, 4=energy, 5=result
  const totalSteps = 6;

  function handleDiscAnswer(profile: DISCProfile) {
    const next = [...discAnswers, profile];
    setDiscAnswers(next);
    if (currentQuestion < discQuestions.length - 1) {
      setCurrentQuestion((p) => p + 1);
    } else {
      setStep(3);
    }
  }

  function getDominantProfile(): DISCProfile {
    const counts: Record<DISCProfile, number> = { D: 0, I: 0, S: 0, C: 0 };
    discAnswers.forEach((a) => counts[a]++);
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as DISCProfile);
  }

  function handleEnergySelect(period: EnergySlot["period"], level: EnergyLevel) {
    setEnergySlots((prev) => {
      const filtered = prev.filter((s) => s.period !== period);
      return [...filtered, { period, level }];
    });
  }

  function finishOnboarding() {
    const profile = getDominantProfile();
    update((state) => ({
      ...state,
      user: {
        name,
        discProfile: profile,
        procrastinationLevel: procLevel,
        energySlots,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      },
    }));
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Intro */}
        {step === 0 && (
          <motion.div key="intro" {...fadeSlide} className="max-w-md w-full text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-balance leading-[1.1]">
                Método <span className="text-gold">P4</span>
              </h1>
              <p className="text-muted-foreground text-sm tracking-widest uppercase">
                Parar · Pensar · Decidir · Agir
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">
                  Esse não é mais um app de produtividade. É um sistema de quebra de padrões.
                </p>
              </div>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">
                  Vamos identificar o que te trava e criar um caminho claro para ação.
                </p>
              </div>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">
                  Você não precisa de motivação. Precisa de direção.
                </p>
              </div>
            </div>

            <p className="text-primary font-medium text-sm italic">
              "A ação cura. A inação adoece."
            </p>

            <Button onClick={() => setStep(1)} className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform">
              Começar <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 1: Name */}
        {step === 1 && (
          <motion.div key="name" {...fadeSlide} className="max-w-md w-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Como posso te chamar?</h2>
              <p className="text-muted-foreground text-sm">Sem formalidades. Só o seu nome.</p>
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="h-12 text-base bg-card"
              autoFocus
            />
            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
            >
              Continuar <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 2: DISC Test */}
        {step === 2 && (
          <motion.div key={`disc-${currentQuestion}`} {...fadeSlide} className="max-w-md w-full space-y-6">
            <div className="space-y-2">
              <p className="text-primary text-xs font-medium tracking-widest uppercase">
                Teste Comportamental · {currentQuestion + 1}/{discQuestions.length}
              </p>
              <h2 className="text-xl font-bold text-balance leading-snug">
                {discQuestions[currentQuestion].q}
              </h2>
            </div>
            <div className="space-y-3">
              {discQuestions[currentQuestion].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleDiscAnswer(opt.profile)}
                  className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all duration-200 active:scale-[0.97] text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Procrastination Level */}
        {step === 3 && (
          <motion.div key="proc" {...fadeSlide} className="max-w-md w-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Nível de Procrastinação</h2>
              <p className="text-muted-foreground text-sm">
                De 1 a 10, quanto você se considera procrastinador?
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setProcLevel(n)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm border transition-all duration-200 active:scale-[0.95] ${
                    procLevel === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-center text-muted-foreground text-xs">
              {procLevel <= 3 ? "Bom. Você tem base. Vamos afiná-la." :
               procLevel <= 6 ? "Honesto. Vamos quebrar esse padrão." :
               "Coragem de admitir. Esse é o primeiro passo."}
            </p>
            <Button onClick={() => setStep(4)} className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform">
              Continuar <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 4: Energy Mapping */}
        {step === 4 && (
          <motion.div key="energy" {...fadeSlide} className="max-w-md w-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Mapa de Energia</h2>
              <p className="text-muted-foreground text-sm">
                Em que período do dia sua energia é mais alta?
              </p>
            </div>
            <div className="space-y-3">
              {periods.map((p) => {
                const current = energySlots.find((s) => s.period === p.key);
                return (
                  <div key={p.key} className="p-4 rounded-xl bg-card border border-border space-y-3">
                    <p className="font-medium text-sm">{p.icon} {p.label}</p>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as EnergyLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleEnergySelect(p.key, lvl)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-200 active:scale-[0.95] ${
                            current?.level === lvl
                              ? lvl === "high"
                                ? "bg-primary text-primary-foreground border-primary"
                                : lvl === "medium"
                                ? "bg-amber-600/20 text-amber-400 border-amber-600/40"
                                : "bg-secondary text-muted-foreground border-border"
                              : "bg-card border-border hover:border-primary/30"
                          }`}
                        >
                          {lvl === "high" ? "Alta" : lvl === "medium" ? "Média" : "Baixa"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              onClick={() => setStep(5)}
              disabled={energySlots.length < 2}
              className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
            >
              Ver meu perfil <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 5: Result */}
        {step === 5 && (
          <motion.div key="result" {...fadeSlide} className="max-w-md w-full space-y-6 text-center">
            <Flame className="w-10 h-10 text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {name}, seu perfil está pronto.
              </h2>
              <p className="text-muted-foreground text-sm">
                Agora o sistema se adapta a você.
              </p>
            </div>

            {discAnswers.length > 0 && (() => {
              const profile = getDominantProfile();
              const { title, description, focus } = (() => {
                const map: Record<DISCProfile, { title: string; description: string; focus: string }> = {
                  D: { title: "Executor Impulsivo", description: "Age rápido, sem direção.", focus: "Pensar antes de agir" },
                  I: { title: "Iniciador Inconsistente", description: "Começa, mas não sustenta.", focus: "Completar o que começou" },
                  S: { title: "Prudente Travado", description: "Sabe o que fazer, mas não decide.", focus: "Decidir e comprometer" },
                  C: { title: "Analista Paralisado", description: "Pensa demais, age de menos.", focus: "Agir imediatamente" },
                };
                return map[profile];
              })();

              return (
                <div className="p-5 rounded-xl bg-card border border-primary/20 gold-glow text-left space-y-3">
                  <p className="text-xs text-primary font-medium tracking-widest uppercase">Seu perfil</p>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Foco do seu treinamento:</p>
                    <p className="text-sm font-medium text-primary">{focus}</p>
                  </div>
                </div>
              );
            })()}

            <Button onClick={finishOnboarding} className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform">
              Entrar no Método P4 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
