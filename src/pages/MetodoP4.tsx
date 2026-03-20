import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { getP4BlockageDescription } from "@/lib/store";
import { ArrowLeft, Pause, Brain, Crosshair, Rocket, ChevronRight } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" } as any,
  animate: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

const pillars = [
  {
    key: "parar",
    icon: Pause,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
    title: "PARAR",
    subtitle: "Interrompa o automático",
    description: "Antes de qualquer coisa, pare. Respire. Saia do modo automático. Sem pausa, não existe mudança.",
    practice: "Faça 3 respirações profundas antes de iniciar qualquer tarefa.",
  },
  {
    key: "pensar",
    icon: Brain,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    title: "PENSAR",
    subtitle: "Ganhe clareza",
    description: "Pense com direção. Não é sobre pensar mais — é sobre pensar certo. Qual é a prioridade real?",
    practice: "Escreva em uma frase: o que preciso fazer agora?",
  },
  {
    key: "decidir",
    icon: Crosshair,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    title: "DECIDIR",
    subtitle: "Escolha e comprometa",
    description: "Decidir é eliminar opções. Escolha uma coisa. Estruture em micro-etapas. Comprometa-se.",
    practice: "Defina 3 micro-passos para sua tarefa principal.",
  },
  {
    key: "agir",
    icon: Rocket,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    title: "AGIR",
    subtitle: "Execute sem esperar",
    description: "Ação imperfeita supera planejamento perfeito. Comece pelos primeiros 2 minutos. O resto vem.",
    practice: "Comece agora. Sem esperar vontade, motivação ou momento perfeito.",
  },
];

export default function MetodoP4() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const user = state.user;
  const block = user ? getP4BlockageDescription(user.p4Blockage) : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 active:scale-[0.95] transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Método P4</h1>
          <p className="text-xs text-muted-foreground">Parar · Pensar · Decidir · Agir</p>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Intro */}
        <motion.div
          variants={reveal}
          initial="initial"
          animate="animate"
          custom={0}
          className="p-5 rounded-xl bg-card border border-border space-y-3"
        >
          <p className="text-sm text-foreground/80 leading-relaxed">
            O Método P4 é um sistema de quebra de padrões. Não é produtividade. É comportamento.
          </p>
          <p className="text-sm text-foreground/60">
            Cada vez que você trava, está preso em um dos 4 pilares. Identifique onde e desbloqueie.
          </p>
        </motion.div>

        {/* 4 Pilares */}
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          const isUserBlockage = user?.p4Blockage === pillar.key;
          return (
            <motion.div
              key={pillar.key}
              variants={reveal}
              initial="initial"
              animate="animate"
              custom={i + 1}
              className={`p-5 rounded-xl bg-card border space-y-3 ${
                isUserBlockage ? `${pillar.borderColor} gold-glow` : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${pillar.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${pillar.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-base font-bold ${pillar.color}`}>{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground">{pillar.subtitle}</p>
                </div>
                {isUserBlockage && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-medium uppercase tracking-wider">
                    Seu ponto
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{pillar.description}</p>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Na prática:</p>
                <p className="text-sm text-foreground/80">{pillar.practice}</p>
              </div>
            </motion.div>
          );
        })}

        {/* Ponto de travamento do usuário */}
        {block && (
          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            custom={5}
            className="p-5 rounded-xl bg-card border border-primary/20 gold-glow space-y-3"
          >
            <p className="text-xs text-primary font-medium tracking-widest uppercase">Onde você trava</p>
            <h3 className="text-lg font-bold">{block.title}</h3>
            <p className="text-sm text-muted-foreground">{block.description}</p>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Ação recomendada: <span className="text-primary font-medium">{block.action}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          variants={reveal}
          initial="initial"
          animate="animate"
          custom={6}
        >
          <button
            onClick={() => navigate("/p4")}
            className="w-full p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Iniciar Sessão P4</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pratique o método agora</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </motion.div>

        {/* Micro-conteúdo */}
        <motion.div
          variants={reveal}
          initial="initial"
          animate="animate"
          custom={7}
          className="pt-4"
        >
          <p className="text-xs text-muted-foreground italic">
            "O método não é sobre fazer mais. É sobre fazer o certo, no momento certo."
          </p>
        </motion.div>
      </div>
    </div>
  );
}
