import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { getDISCDescription, getP4BlockageDescription, DISCProfile, P4Blockage } from "@/lib/store";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getCoachResponse(input: string, discProfile: DISCProfile, blockage: P4Blockage, userName: string): string {
  const lc = input.toLowerCase();
  const disc = getDISCDescription(discProfile);
  const block = getP4BlockageDescription(blockage);

  // Tonalidade conforme DISC
  const tone = disc.coachTone;

  if (lc.includes("travado") || lc.includes("paralisado") || lc.includes("não consigo") || lc.includes("nao consigo")) {
    if (discProfile === "D") return `${userName}, pare de tentar resolver tudo ao mesmo tempo. Escolha uma coisa. Execute. Agora.`;
    if (discProfile === "I") return `${userName}, vamos começar pequeno e ganhar ritmo. Qual é a menor coisa que você pode fazer agora? Faz ela.`;
    if (discProfile === "S") return `${userName}, vamos no seu ritmo, mas com consistência. Você não precisa do momento perfeito. Precisa de movimento.`;
    return `${userName}, vamos organizar isso em passos simples. Qual é o primeiro passo? Só o primeiro. Nada mais.`;
  }

  if (lc.includes("cansado") || lc.includes("sem energia") || lc.includes("exausto")) {
    if (discProfile === "D") return `Energia baixa não é desculpa pra parar. É informação. Faça o mínimo. Uma coisa. Vai.`;
    if (discProfile === "I") return `Tá cansado? Normal. Mas uma micro-tarefa muda tudo. 2 minutos. Só pra não zerar o dia.`;
    if (discProfile === "S") return `Tudo bem estar cansado. Faça algo pequeno no seu ritmo. Consistência importa mais que intensidade.`;
    return `Energia baixa é dado, não sentença. Faça a menor tarefa possível. Organizar um item já conta.`;
  }

  if (lc.includes("procrastinando") || lc.includes("adiando") || lc.includes("procrastina")) {
    return `Procrastinação não é preguiça. É um padrão automático. Seu ponto de travamento é "${block.title}".\n\n${block.description}\n\n👉 ${block.action}`;
  }

  if (lc.includes("desculpa") || lc.includes("amanhã") || lc.includes("depois")) {
    if (discProfile === "D") return `"Amanhã" é a mentira mais usada. Pare de pensar e execute. Agora.`;
    if (discProfile === "I") return `Empolgação sem ação é só imaginação. O que você vai fazer agora? Escolha e comece.`;
    if (discProfile === "S") return `Adiar te dá conforto temporário, mas rouba seu progresso. Faça uma coisa pequena agora.`;
    return `Você está usando "depois" como escudo contra o medo de errar. Mas feito imperfeito vale mais que perfeito adiado.`;
  }

  if (lc.includes("motivação") || lc.includes("motivado")) {
    return `Motivação é uma mentira que te vende a ideia de que você precisa sentir vontade pra agir. Não precisa. Precisa de direção. O que você deveria estar fazendo agora?`;
  }

  if (lc.includes("obrigado") || lc.includes("valeu")) {
    return `Gratidão é bom. Ação é melhor. Vai executar?`;
  }

  if (lc.includes("medo") || lc.includes("ansiedade") || lc.includes("ansioso")) {
    if (discProfile === "D") return `Medo é sinal de que é importante. Age através dele.`;
    if (discProfile === "I") return `A ansiedade diminui quando você age. Comece com algo tão pequeno que não dá pra falhar.`;
    if (discProfile === "S") return `Seu medo é de errar. Mas errar faz parte. Começar imperfeito é melhor que não começar.`;
    return `Você está tentando prever todos os cenários. Impossível. Aceite a imperfeição e dê o primeiro passo.`;
  }

  // Default baseado no DISC + blockage
  const blockAdvice: Record<P4Blockage, string> = {
    parar: "Primeiro, pare o que está fazendo. Respire. Depois me diz: o que você está evitando?",
    pensar: "Você precisa de clareza. Me diz em uma frase: qual é a tarefa mais importante agora?",
    decidir: "Você já sabe o que fazer. Decida agora. Me diz: o que você vai fazer nos próximos 15 minutos?",
    agir: "Chega de planejar. O que é a menor ação possível? Faz por 2 minutos. Só isso.",
  };

  const discIntro: Record<DISCProfile, string> = {
    D: `${userName}, direto ao ponto.`,
    I: `${userName}, vamos focar.`,
    S: `${userName}, com calma mas com direção.`,
    C: `${userName}, vamos simplificar.`,
  };

  return `${discIntro[discProfile]} ${blockAdvice[blockage]}`;
}

export default function Coach() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `${state.user?.name || "Ei"}. Sou o Coach P4. Não vou te motivar. Vou te dar direção. O que está te travando agora?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getCoachResponse(
        userMsg.content,
        state.user?.discProfile || "C",
        state.user?.p4Blockage || "agir",
        state.user?.name?.split(" ")[0] || ""
      );
      setMessages((p) => [...p, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 active:scale-[0.95] transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">Coach P4</h1>
          <p className="text-xs text-muted-foreground">Direto. Sem enrolação.</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="O que está te travando?"
            className="flex-1 h-12 px-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-[0.95] transition-transform disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
