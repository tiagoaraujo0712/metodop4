import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import {
  DISCProfile,
  EnergySlot,
  EnergyLevel,
  P4Blockage,
  getDISCDescription,
  getP4BlockageDescription,
  getFullDiagnosis,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Flame, CheckCircle2 } from "lucide-react";

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" } as any,
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  exit: { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.3 } },
};

// 16 perguntas DISC clássicas
const discQuestions: { q: string; options: { label: string; profile: DISCProfile }[] }[] = [
  {
    q: "Quando surge um problema, qual é sua primeira reação?",
    options: [
      { label: "Resolvo na hora, sem esperar", profile: "D" },
      { label: "Converso com alguém sobre isso", profile: "I" },
      { label: "Analiso com calma antes de agir", profile: "S" },
      { label: "Pesquiso todas as opções possíveis", profile: "C" },
    ],
  },
  {
    q: "Como você prefere trabalhar?",
    options: [
      { label: "Sozinho, com total controle", profile: "D" },
      { label: "Em equipe, com troca de ideias", profile: "I" },
      { label: "Em ambiente tranquilo e previsível", profile: "S" },
      { label: "Com regras claras e organização", profile: "C" },
    ],
  },
  {
    q: "O que mais te incomoda?",
    options: [
      { label: "Perder tempo com coisas sem resultado", profile: "D" },
      { label: "Ficar isolado sem interação", profile: "I" },
      { label: "Mudanças bruscas e inesperadas", profile: "S" },
      { label: "Falta de planejamento e desorganização", profile: "C" },
    ],
  },
  {
    q: "Quando alguém te pede ajuda, você...",
    options: [
      { label: "Dou a solução direto", profile: "D" },
      { label: "Escuto e motivo a pessoa", profile: "I" },
      { label: "Ajudo com paciência, no tempo da pessoa", profile: "S" },
      { label: "Analiso o problema e sugiro passos", profile: "C" },
    ],
  },
  {
    q: "Num grupo, as pessoas te veem como...",
    options: [
      { label: "Decidido e firme", profile: "D" },
      { label: "Animado e comunicativo", profile: "I" },
      { label: "Calmo e confiável", profile: "S" },
      { label: "Organizado e detalhista", profile: "C" },
    ],
  },
  {
    q: "Quando precisa tomar uma decisão importante, você...",
    options: [
      { label: "Decido rápido e ajusto depois", profile: "D" },
      { label: "Peço opinião de pessoas que confio", profile: "I" },
      { label: "Espero até ter certeza", profile: "S" },
      { label: "Faço uma lista de prós e contras", profile: "C" },
    ],
  },
  {
    q: "O que te motiva mais?",
    options: [
      { label: "Resultados e conquistas", profile: "D" },
      { label: "Reconhecimento e conexão", profile: "I" },
      { label: "Estabilidade e segurança", profile: "S" },
      { label: "Qualidade e precisão", profile: "C" },
    ],
  },
  {
    q: "Quando está sob pressão, você...",
    options: [
      { label: "Fico mais focado e agressivo", profile: "D" },
      { label: "Fico ansioso mas busco apoio", profile: "I" },
      { label: "Me retraio e evito conflito", profile: "S" },
      { label: "Fico mais crítico e detalhista", profile: "C" },
    ],
  },
  {
    q: "Como você lida com prazos apertados?",
    options: [
      { label: "Entrego rápido, mesmo que imperfeito", profile: "D" },
      { label: "Me motivo sob pressão, mas é caótico", profile: "I" },
      { label: "Fico ansioso e evito começar", profile: "S" },
      { label: "Sinto que preciso de mais tempo pra fazer direito", profile: "C" },
    ],
  },
  {
    q: "Em reuniões ou conversas, você tende a...",
    options: [
      { label: "Ir direto ao ponto", profile: "D" },
      { label: "Falar bastante e contar histórias", profile: "I" },
      { label: "Ouvir mais do que falar", profile: "S" },
      { label: "Fazer perguntas detalhadas", profile: "C" },
    ],
  },
  {
    q: "Quando algo não sai como planejado, você...",
    options: [
      { label: "Mudo a estratégia e continuo", profile: "D" },
      { label: "Busco uma saída criativa", profile: "I" },
      { label: "Fico frustrado mas aceito", profile: "S" },
      { label: "Analiso o que deu errado em detalhe", profile: "C" },
    ],
  },
  {
    q: "O que te descreveria melhor?",
    options: [
      { label: "Determinado e direto", profile: "D" },
      { label: "Entusiasmado e sociável", profile: "I" },
      { label: "Paciente e leal", profile: "S" },
      { label: "Preciso e cauteloso", profile: "C" },
    ],
  },
  {
    q: "Quando recebe uma tarefa nova, você...",
    options: [
      { label: "Começo imediatamente", profile: "D" },
      { label: "Fico empolgado e já imagino o resultado", profile: "I" },
      { label: "Espero instruções claras antes de começar", profile: "S" },
      { label: "Leio tudo e planejo cada passo", profile: "C" },
    ],
  },
  {
    q: "Qual é o seu maior medo profissional?",
    options: [
      { label: "Perder o controle da situação", profile: "D" },
      { label: "Ser ignorado ou rejeitado", profile: "I" },
      { label: "Perder estabilidade e segurança", profile: "S" },
      { label: "Cometer erros que poderiam ser evitados", profile: "C" },
    ],
  },
  {
    q: "Quando precisa aprender algo novo, você...",
    options: [
      { label: "Aprendo fazendo, na prática", profile: "D" },
      { label: "Aprendo conversando com quem já sabe", profile: "I" },
      { label: "Aprendo no meu ritmo, sem pressa", profile: "S" },
      { label: "Leio e estudo todo o material disponível", profile: "C" },
    ],
  },
  {
    q: "Como você lida com críticas?",
    options: [
      { label: "Ouço rápido e sigo em frente", profile: "D" },
      { label: "Levo para o pessoal mas supero", profile: "I" },
      { label: "Fico pensando naquilo por um tempo", profile: "S" },
      { label: "Analiso se a crítica tem fundamento", profile: "C" },
    ],
  },
];

// Perguntas para detectar travamento P4
const p4Questions: { q: string; options: { label: string; blockage: P4Blockage }[] }[] = [
  {
    q: "Quando você procrastina, o que acontece normalmente?",
    options: [
      { label: "Fico no automático, fazendo coisas sem pensar (redes sociais, etc.)", blockage: "parar" },
      { label: "Não sei exatamente o que deveria estar fazendo", blockage: "pensar" },
      { label: "Sei o que fazer, mas não consigo me decidir", blockage: "decidir" },
      { label: "Já decidi, mas simplesmente não começo", blockage: "agir" },
    ],
  },
  {
    q: "Qual frase mais combina com você?",
    options: [
      { label: "Eu nem percebo que estou desperdiçando tempo", blockage: "parar" },
      { label: "Tenho muita coisa na cabeça e não sei por onde começar", blockage: "pensar" },
      { label: "Fico entre várias opções e não escolho nenhuma", blockage: "decidir" },
      { label: "Sei exatamente o que fazer, mas travo na hora de executar", blockage: "agir" },
    ],
  },
  {
    q: "O que mais te impede de ser produtivo?",
    options: [
      { label: "Não consigo parar e refletir sobre o que importa", blockage: "parar" },
      { label: "Falta de clareza sobre o que realmente preciso fazer", blockage: "pensar" },
      { label: "Medo de fazer a escolha errada", blockage: "decidir" },
      { label: "Resistência interna na hora de agir", blockage: "agir" },
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
  const { state, update } = useAppState();
  const { pushProfile } = useSupabaseSync();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRedoDISC = searchParams.get("redo") === "disc";

  const [step, setStep] = useState(isRedoDISC ? 2 : 0);
  const [name, setName] = useState(isRedoDISC && state.user ? state.user.name : "");
  const [discAnswers, setDiscAnswers] = useState<DISCProfile[]>([]);
  const [currentDiscQ, setCurrentDiscQ] = useState(0);
  const [p4Answers, setP4Answers] = useState<P4Blockage[]>([]);
  const [currentP4Q, setCurrentP4Q] = useState(0);
  const [energySlots, setEnergySlots] = useState<EnergySlot[]>(
    isRedoDISC && state.user ? state.user.energySlots : []
  );
  const [procLevel, setProcLevel] = useState(
    isRedoDISC && state.user ? state.user.procrastinationLevel : 5
  );

  // Steps: 0=intro, 1=name, 2=disc test, 3=p4 blockage, 4=procrastination, 5=energy, 6=result
  const totalSteps = 7;

  function getDominantProfile(): DISCProfile {
    const counts: Record<DISCProfile, number> = { D: 0, I: 0, S: 0, C: 0 };
    discAnswers.forEach((a) => counts[a]++);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as DISCProfile;
  }

  function getDominantBlockage(): P4Blockage {
    const counts: Record<P4Blockage, number> = { parar: 0, pensar: 0, decidir: 0, agir: 0 };
    p4Answers.forEach((a) => counts[a]++);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as P4Blockage;
  }

  function handleDiscAnswer(profile: DISCProfile) {
    const next = [...discAnswers, profile];
    setDiscAnswers(next);
    if (currentDiscQ < discQuestions.length - 1) {
      setCurrentDiscQ((p) => p + 1);
      window.scrollTo(0, 0);
    } else {
      setStep(3);
      window.scrollTo(0, 0);
    }
  }

  function handleP4Answer(blockage: P4Blockage) {
    const next = [...p4Answers, blockage];
    setP4Answers(next);
    if (currentP4Q < p4Questions.length - 1) {
      setCurrentP4Q((p) => p + 1);
      window.scrollTo(0, 0);
    } else {
      setStep(4);
      window.scrollTo(0, 0);
    }
  }

  function handleEnergySelect(period: EnergySlot["period"], level: EnergyLevel) {
    setEnergySlots((prev) => {
      const filtered = prev.filter((s) => s.period !== period);
      return [...filtered, { period, level }];
    });
  }

  function finishOnboarding() {
    const profile = getDominantProfile();
    const blockage = getDominantBlockage();
    const userProfile = {
      name,
      discProfile: profile,
      p4Blockage: blockage,
      procrastinationLevel: procLevel,
      energySlots,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };
    update((state) => ({
      ...state,
      user: userProfile,
    }));
    pushProfile(userProfile);
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
                <span className="text-xl mt-0.5">🧠</span>
                <p className="text-sm text-foreground/80">
                  Esse não é mais um app de produtividade. É um sistema de quebra de padrões comportamentais.
                </p>
              </div>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <span className="text-xl mt-0.5">🎯</span>
                <p className="text-sm text-foreground/80">
                  Vamos identificar como você funciona, onde você trava e criar um caminho claro para ação.
                </p>
              </div>
              <div className="flex gap-3 items-start p-4 rounded-xl bg-card border border-border">
                <span className="text-xl mt-0.5">⚡</span>
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

        {/* STEP 2: DISC Test (16 questions) */}
        {step === 2 && (
          <motion.div key={`disc-${currentDiscQ}`} {...fadeSlide} className="max-w-md w-full space-y-6">
            <div className="space-y-2">
              <p className="text-primary text-xs font-medium tracking-widest uppercase">
                Perfil Comportamental · {currentDiscQ + 1}/{discQuestions.length}
              </p>
              <h2 className="text-xl font-bold text-balance leading-snug">
                {discQuestions[currentDiscQ].q}
              </h2>
            </div>
            <div className="space-y-3">
              {discQuestions[currentDiscQ].options.map((opt, i) => (
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

        {/* STEP 3: P4 Blockage Test */}
        {step === 3 && (
          <motion.div key={`p4-${currentP4Q}`} {...fadeSlide} className="max-w-md w-full space-y-6">
            <div className="space-y-2">
              <p className="text-primary text-xs font-medium tracking-widest uppercase">
                Padrão de Travamento · {currentP4Q + 1}/{p4Questions.length}
              </p>
              <h2 className="text-xl font-bold text-balance leading-snug">
                {p4Questions[currentP4Q].q}
              </h2>
            </div>
            <div className="space-y-3">
              {p4Questions[currentP4Q].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleP4Answer(opt.blockage)}
                  className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all duration-200 active:scale-[0.97] text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Procrastination Level */}
        {step === 4 && (
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
            <Button onClick={() => setStep(5)} className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform">
              Continuar <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 5: Energy Mapping */}
        {step === 5 && (
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
              onClick={() => setStep(6)}
              disabled={energySlots.length < 2}
              className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform"
            >
              Ver meu diagnóstico <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* STEP 6: Full Integrated Result */}
        {step === 6 && discAnswers.length > 0 && p4Answers.length > 0 && (() => {
          const profile = getDominantProfile();
          const blockage = getDominantBlockage();
          const disc = getDISCDescription(profile);
          const block = getP4BlockageDescription(blockage);
          const diagnosis = getFullDiagnosis(profile, blockage, energySlots);

          return (
            <motion.div key="result" {...fadeSlide} className="max-w-md w-full space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="text-center space-y-2">
                <Flame className="w-10 h-10 text-primary mx-auto" />
                <h2 className="text-2xl font-bold">
                  {name}, seu diagnóstico está pronto.
                </h2>
              </div>

              {/* Perfil completo */}
              <div className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-4">
                <p className="text-xs text-primary font-medium tracking-widest uppercase">Seu perfil completo</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{diagnosis.summary}</p>
              </div>

              {/* DISC */}
              <div className="p-5 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧩</span>
                  <p className="text-xs text-primary font-medium tracking-widest uppercase">Perfil Comportamental</p>
                </div>
                <h3 className="text-lg font-bold">{disc.title} ({profile})</h3>
                <p className="text-sm text-muted-foreground">{disc.description}</p>
                <div className="space-y-1.5 pt-2">
                  <p className="text-xs text-muted-foreground font-medium">Como você funciona:</p>
                  {disc.traits.map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-xs text-foreground/80">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium">Pontos de atenção:</p>
                  {disc.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs text-amber-400 mt-0.5 shrink-0">⚠️</span>
                      <span className="text-xs text-foreground/80">{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* P4 Blockage */}
              <div className="p-5 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <p className="text-xs text-primary font-medium tracking-widest uppercase">Onde você trava</p>
                </div>
                <h3 className="text-lg font-bold">{block.title}</h3>
                <p className="text-sm text-muted-foreground">{block.description}</p>
              </div>

              {/* Problema real */}
              <div className="p-5 rounded-xl bg-card border border-destructive/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <p className="text-xs text-destructive font-medium tracking-widest uppercase">Seu problema real</p>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{diagnosis.problem}</p>
              </div>

              {/* Plano de ação */}
              <div className="p-5 rounded-xl bg-card border border-primary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚀</span>
                  <p className="text-xs text-primary font-medium tracking-widest uppercase">Seu plano personalizado</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{disc.focus}</p>
                <div className="space-y-2">
                  {diagnosis.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <span className="text-primary font-bold text-sm mt-0.5">{i + 1}</span>
                      <span className="text-sm text-foreground/80">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={finishOnboarding} className="w-full h-12 text-base font-semibold active:scale-[0.97] transition-transform">
                Entrar no Método P4 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
