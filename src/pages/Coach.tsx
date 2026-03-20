import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";
import { getDISCDescription, getP4BlockageDescription, DISCProfile, P4Blockage } from "@/lib/store";
import {
  loadCoachMemory,
  addInteraction,
  detectTopic,
  detectPatterns,
  getProactiveMessages,
  getIdentityReinforcement,
  getHistorySummary,
  getTodayCoachSessions,
} from "@/lib/coachMemory";
import { ArrowLeft, Send, Brain, TrendingUp, AlertTriangle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "normal" | "proactive" | "insight" | "identity";
}

function getCoachResponse(
  input: string,
  discProfile: DISCProfile,
  blockage: P4Blockage,
  userName: string,
  sessionCount: number
): { response: string; topic: string } {
  const lc = input.toLowerCase();
  const disc = getDISCDescription(discProfile);
  const block = getP4BlockageDescription(blockage);
  const topic = detectTopic(input);

  // Respostas para conquistas (reforço de identidade)
  if (topic === "conquista") {
    const responses: Record<DISCProfile, string> = {
      D: `${userName}, resultado. É isso que importa. O que vem a seguir?`,
      I: `${userName}, você não só imaginou — executou. Essa é a diferença. Qual o próximo passo?`,
      S: `${userName}, cada passo que você dá constrói confiança real. Continue.`,
      C: `${userName}, execução imperfeita supera planejamento perfeito. Você provou isso. Continue.`,
    };
    return { response: responses[discProfile], topic };
  }

  if (topic === "travamento") {
    const memory = loadCoachMemory();
    const travCount = memory.repeatedTopics["travamento"] || 0;

    if (travCount >= 3) {
      return {
        response: `${userName}, essa é a ${travCount + 1}ª vez que você menciona travamento. Isso não é coincidência — é um padrão.\n\nSeu ponto de bloqueio é "${block.title}". ${block.description}\n\n👉 ${block.action}\n\nChega de reconhecer o problema. Hora de mudar a resposta.`,
        topic,
      };
    }

    const responses: Record<DISCProfile, string> = {
      D: `${userName}, pare de tentar resolver tudo ao mesmo tempo. Escolha uma coisa. Execute. Agora.`,
      I: `${userName}, vamos começar pequeno e ganhar ritmo. Qual é a menor coisa que você pode fazer agora? Faz ela.`,
      S: `${userName}, vamos no seu ritmo, mas com consistência. Você não precisa do momento perfeito. Precisa de movimento.`,
      C: `${userName}, vamos organizar isso em passos simples. Qual é o primeiro passo? Só o primeiro. Nada mais.`,
    };
    return { response: responses[discProfile], topic };
  }

  if (topic === "energia_baixa") {
    const responses: Record<DISCProfile, string> = {
      D: "Energia baixa não é desculpa pra parar. É informação. Faça o mínimo. Uma coisa. Vai.",
      I: "Tá cansado? Normal. Mas uma micro-tarefa muda tudo. 2 minutos. Só pra não zerar o dia.",
      S: "Tudo bem estar cansado. Faça algo pequeno no seu ritmo. Consistência importa mais que intensidade.",
      C: "Energia baixa é dado, não sentença. Faça a menor tarefa possível. Organizar um item já conta.",
    };
    return { response: responses[discProfile], topic };
  }

  if (topic === "procrastinacao") {
    const memory = loadCoachMemory();
    const procCount = memory.repeatedTopics["procrastinacao"] || 0;
    let extra = "";
    if (procCount >= 2) {
      extra = `\n\n⚠️ Você já trouxe esse tema ${procCount + 1} vezes. Reconhecer o padrão sem mudar a resposta é só outra forma de procrastinar.`;
    }
    return {
      response: `Procrastinação não é preguiça. É um padrão automático. Seu ponto de travamento é "${block.title}".\n\n${block.description}\n\n👉 ${block.action}${extra}`,
      topic,
    };
  }

  if (topic === "adiamento") {
    const responses: Record<DISCProfile, string> = {
      D: `"Amanhã" é a mentira mais usada. Pare de pensar e execute. Agora.`,
      I: `Empolgação sem ação é só imaginação. O que você vai fazer agora? Escolha e comece.`,
      S: `Adiar te dá conforto temporário, mas rouba seu progresso. Faça uma coisa pequena agora.`,
      C: `Você está usando "depois" como escudo contra o medo de errar. Mas feito imperfeito vale mais que perfeito adiado.`,
    };
    return { response: responses[discProfile], topic };
  }

  if (topic === "motivacao") {
    return {
      response: "Motivação é uma mentira que te vende a ideia de que você precisa sentir vontade pra agir. Não precisa. Precisa de direção. O que você deveria estar fazendo agora?",
      topic,
    };
  }

  if (topic === "medo") {
    const responses: Record<DISCProfile, string> = {
      D: `Medo é sinal de que é importante. Age através dele.`,
      I: `A ansiedade diminui quando você age. Comece com algo tão pequeno que não dá pra falhar.`,
      S: `Seu medo é de errar. Mas errar faz parte. Começar imperfeito é melhor que não começar.`,
      C: `Você está tentando prever todos os cenários. Impossível. Aceite a imperfeição e dê o primeiro passo.`,
    };
    return { response: responses[discProfile], topic };
  }

  if (topic === "desistencia") {
    const memory = loadCoachMemory();
    const completedDays = memory.interactions.length;
    const responses: Record<DISCProfile, string> = {
      D: `Desistir é o caminho mais fácil. Você é melhor que o fácil. O que falta pra executar?`,
      I: `Você já começou ${completedDays} conversas comigo. Isso mostra que algo em você quer mudança. Não jogue isso fora.`,
      S: `A vontade de desistir é temporária. O arrependimento de não ter tentado é permanente. Faça uma coisa hoje. Só uma.`,
      C: `Desistir parece lógico quando você analisa demais. Mas os dados mostram que pessoas que persistem vencem. Faça o mínimo.`,
    };
    return { response: responses[discProfile], topic };
  }

  if (topic === "confusao") {
    return {
      response: `Confusão é sinal de excesso de opções, não de incapacidade.\n\nVamos simplificar:\n1. O que é a coisa MAIS importante agora?\n2. Qual é o MENOR passo pra começar?\n\nResponde essas duas e o caminho aparece.`,
      topic,
    };
  }

  if (lc.includes("obrigado") || lc.includes("valeu")) {
    return {
      response: "Gratidão é bom. Ação é melhor. Vai executar?",
      topic: "geral",
    };
  }

  // Default baseado no DISC + blockage com contexto de sessão
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

  let extra = "";
  if (sessionCount > 5) {
    extra = "\n\nA propósito — conversar comigo não é ação. O que você vai FAZER quando sair daqui?";
  }

  return {
    response: `${discIntro[discProfile]} ${blockAdvice[blockage]}${extra}`,
    topic,
  };
}

export default function Coach() {
  const { state } = useAppState();
  const navigate = useNavigate();
  const memory = loadCoachMemory();
  const userName = state.user?.name?.split(" ")[0] || "";
  const discProfile = state.user?.discProfile || "C";
  const blockage = state.user?.p4Blockage || "agir";

  // Construir mensagem inicial com contexto
  const buildInitialMessages = (): Message[] => {
    const msgs: Message[] = [];
    const historySummary = getHistorySummary(memory);
    const identity = getIdentityReinforcement(state, discProfile);
    const proactive = getProactiveMessages(state, memory, discProfile, blockage);
    const patterns = detectPatterns(memory, state);

    // Saudação contextual
    const isReturning = memory.interactions.length > 0;
    const greeting = isReturning
      ? `${userName}. ${historySummary}`
      : `${userName}. Sou o Coach P4. Não vou te motivar. Vou te dar direção.`;

    msgs.push({ role: "assistant", content: greeting, type: "normal" });

    // Reforço de identidade (se completou sessão hoje)
    if (identity) {
      msgs.push({ role: "assistant", content: identity, type: "identity" });
    }

    // Mensagens proativas
    proactive.forEach((msg) => {
      msgs.push({ role: "assistant", content: msg, type: "proactive" });
    });

    // Insights de padrões (máximo 1 para não sobrecarregar)
    if (patterns.length > 0) {
      msgs.push({ role: "assistant", content: patterns[0].message, type: "insight" });
    }

    // CTA final
    if (!identity) {
      msgs.push({
        role: "assistant",
        content: "O que está te travando agora?",
        type: "normal",
      });
    }

    return msgs;
  };

  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);
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
      const sessionCount = getTodayCoachSessions(memory);
      const { response, topic } = getCoachResponse(
        userMsg.content,
        discProfile,
        blockage,
        userName,
        sessionCount
      );

      // Salvar interação na memória
      addInteraction(userMsg.content, response, topic);

      setMessages((p) => [...p, { role: "assistant", content: response, type: "normal" }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }

  function getMessageStyle(msg: Message) {
    if (msg.role === "user") return "bg-primary text-primary-foreground rounded-br-md";
    switch (msg.type) {
      case "proactive":
        return "bg-amber-950/30 border border-amber-700/30 rounded-bl-md";
      case "insight":
        return "bg-red-950/20 border border-red-700/20 rounded-bl-md";
      case "identity":
        return "bg-emerald-950/20 border border-emerald-700/20 rounded-bl-md";
      default:
        return "bg-card border border-border rounded-bl-md";
    }
  }

  function getMessageIcon(msg: Message) {
    if (msg.role === "user") return null;
    switch (msg.type) {
      case "proactive":
        return <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-1" />;
      case "insight":
        return <Brain className="w-3 h-3 text-red-400 shrink-0 mt-1" />;
      case "identity":
        return <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0 mt-1" />;
      default:
        return null;
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/dashboard")} className="p-2 -ml-2 active:scale-[0.95] transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Coach P4</h1>
          <p className="text-xs text-muted-foreground">Direto. Sem enrolação.</p>
        </div>
        {memory.interactions.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{memory.interactions.length} conversas</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: msg.role === "assistant" && i < 5 ? i * 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${getMessageStyle(msg)}`}>
              <div className="flex gap-2">
                {getMessageIcon(msg)}
                <span>{msg.content}</span>
              </div>
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
