import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { getDISCDescription } from "@/lib/store";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Local Coach P4 — responds based on DISC profile and P4 principles
function getCoachResponse(input: string, discProfile: string, userName: string): string {
  const lc = input.toLowerCase();
  const disc = getDISCDescription(discProfile as any);

  // Pattern matching for common inputs
  if (lc.includes("travado") || lc.includes("paralisado") || lc.includes("não consigo")) {
    if (discProfile === "D") return `${userName}, você age rápido mas sem rumo. Para. Qual é a única coisa que importa agora? Define e executa. Sem pensar mais.`;
    if (discProfile === "I") return `Você começou algo e parou, certo? O problema não é a tarefa. É a consistência. Volte pra onde parou. Faça 2 minutos. Só 2.`;
    if (discProfile === "S") return `Você sabe o que fazer. O problema é que está esperando o momento perfeito. Ele não existe. Decida agora. A ação cura.`;
    return `Você está pensando demais. Fecha a análise. Abre o que precisa fazer. 2 minutos. Vai.`;
  }

  if (lc.includes("cansado") || lc.includes("sem energia") || lc.includes("exausto")) {
    return `Energia baixa não é desculpa. É informação. Faça o mínimo: uma micro-tarefa. Abra o caderno. Escreva uma frase. Só isso. Descansar depois é método, não é fracasso.`;
  }

  if (lc.includes("procrastinando") || lc.includes("adiando") || lc.includes("procrastina")) {
    return `Procrastinação não é preguiça. É um padrão automático. Qual dos 4 pilares está falhando?\n\n• Não parou pra respirar? → PARAR\n• Não tem clareza? → PENSAR\n• Não decidiu? → DECIDIR\n• Decidiu e não fez? → AGIR\n\nIdentifique e corrija. Agora.`;
  }

  if (lc.includes("desculpa") || lc.includes("amanhã") || lc.includes("depois")) {
    return `"Amanhã" é a mentira mais usada por quem não quer enfrentar o hoje. Você vai continuar mentindo pra si mesmo ou vai agir? A escolha é binária.`;
  }

  if (lc.includes("motivação") || lc.includes("motivado")) {
    return `Motivação é uma mentira que te vende a ideia de que você precisa sentir vontade pra agir. Não precisa. Precisa de direção. O que você deveria estar fazendo agora?`;
  }

  if (lc.includes("obrigado") || lc.includes("valeu")) {
    return `Gratidão é bom. Ação é melhor. Vai executar?`;
  }

  // Default based on DISC
  return `${userName}, direto ao ponto: ${disc.description} Seu foco deve ser: ${disc.focus}. Não complique. O que você precisa fazer agora? Me diz e eu te dou o caminho.`;
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

    // Simulate thinking delay
    setTimeout(() => {
      const response = getCoachResponse(
        userMsg.content,
        state.user?.discProfile || "C",
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
