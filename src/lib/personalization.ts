// Motor de Personalização — DISC + P4 + Energia

import { DISCProfile, P4Blockage, EnergyLevel } from "./store";

export interface PersonalizedPlan {
  profileLabel: string;
  interpretation: string;
  taskType: string;
  intensity: string;
  approach: string;
  actions: string[];
  coachTip: string;
}

// Gera rótulo combinado: "Influente (I), travado em AGIR, com energia baixa"
export function getProfileLabel(
  disc: DISCProfile,
  blockage: P4Blockage,
  energy: EnergyLevel
): string {
  const discNames: Record<DISCProfile, string> = {
    D: "Dominante",
    I: "Influente",
    S: "Estável",
    C: "Conformidade",
  };
  const blockNames: Record<P4Blockage, string> = {
    parar: "PARAR",
    pensar: "PENSAR",
    decidir: "DECIDIR",
    agir: "AGIR",
  };
  const energyNames: Record<EnergyLevel, string> = {
    high: "alta",
    medium: "média",
    low: "baixa",
  };
  return `${discNames[disc]} (${disc}), travado em ${blockNames[blockage]}, com energia ${energyNames[energy]}`;
}

// Interpretação humana do perfil combinado
export function getHumanInterpretation(
  disc: DISCProfile,
  blockage: P4Blockage,
  energy: EnergyLevel
): string {
  const discTraits: Record<DISCProfile, string> = {
    D: "Você age rápido e gosta de resolver tudo na hora",
    I: "Você começa fácil e se empolga com novidades",
    S: "Você é cauteloso e espera o momento certo",
    C: "Você pensa muito e quer tudo perfeito",
  };

  const blockTraits: Record<P4Blockage, string> = {
    parar: "mas vive no automático sem perceber",
    pensar: "mas não tem clareza do que realmente importa",
    decidir: "mas trava na hora de escolher",
    agir: "mas paralisa na hora de executar",
  };

  const energyTraits: Record<EnergyLevel, string> = {
    high: "Sua energia está alta — aproveite para enfrentar o que é difícil.",
    medium: "Sua energia está estável — foque em executar sem complicar.",
    low: "Sua energia está baixa — não force. Faça apenas o essencial.",
  };

  return `${discTraits[disc]}, ${blockTraits[blockage]}.\n\n${energyTraits[energy]}`;
}

// Plano personalizado completo
export function getPersonalizedPlan(
  disc: DISCProfile,
  blockage: P4Blockage,
  energy: EnergyLevel
): PersonalizedPlan {
  const profileLabel = getProfileLabel(disc, blockage, energy);
  const interpretation = getHumanInterpretation(disc, blockage, energy);

  // Tipo de tarefa baseado na energia
  const taskTypeMap: Record<EnergyLevel, string> = {
    high: "Tarefas complexas e desafiadoras",
    medium: "Execução operacional e organização",
    low: "Tarefas simples e de baixo esforço",
  };

  // Intensidade baseada em energia + DISC
  const intensityMap: Record<EnergyLevel, Record<DISCProfile, string>> = {
    high: {
      D: "Máxima — vá com tudo, mas com direção",
      I: "Alta — canalize sua empolgação em uma coisa só",
      S: "Moderada-alta — este é o momento de decidir e agir",
      C: "Moderada-alta — menos planejamento, mais execução",
    },
    medium: {
      D: "Moderada — foque em terminar, não em começar coisas novas",
      I: "Moderada — mantenha o foco no que já começou",
      S: "Moderada — avance no seu ritmo, mas avance",
      C: "Moderada — execute o plano que já existe",
    },
    low: {
      D: "Baixa — faça o mínimo com qualidade",
      I: "Baixa — uma micro-tarefa e descanse",
      S: "Mínima — cuide de você e faça só o essencial",
      C: "Mínima — organize uma coisa pequena e pare",
    },
  };

  // Abordagem comportamental por combinação DISC + P4
  const approachMap: Record<DISCProfile, Record<P4Blockage, string>> = {
    D: {
      parar: "Pare antes de agir impulsivamente. Respire 30 segundos antes de qualquer decisão.",
      pensar: "Você executa sem pensar. Escreva o objetivo antes de começar.",
      decidir: "Você decide rápido demais e muda. Escolha uma vez e mantenha por 25 minutos.",
      agir: "Sua energia está no lugar errado. Direcione para a tarefa principal.",
    },
    I: {
      parar: "Pare de buscar novidades. Volte ao que já começou.",
      pensar: "Muitas ideias, pouca clareza. Escolha uma e descarte o resto.",
      decidir: "Algo mais interessante sempre aparece. Comprometa-se com uma decisão.",
      agir: "Você não precisa de mais inspiração. Precisa terminar o que começou.",
    },
    S: {
      parar: "Você para demais. Menos pausa, mais movimento pequeno.",
      pensar: "Você entende o problema. Pare de esperar se sentir pronto.",
      decidir: "O momento perfeito não existe. Decida em 2 minutos ou menos.",
      agir: "Você já decidiu. Agora execute, mesmo que imperfeito.",
    },
    C: {
      parar: "Simplifique. Pare de analisar cada cenário possível.",
      pensar: "Você já pensou o suficiente. Mais análise é procrastinação disfarçada.",
      decidir: "A decisão boa feita agora vale mais que a perfeita feita nunca.",
      agir: "Seu plano está pronto. Execute com imperfeição. Ajuste depois.",
    },
  };

  // Ações personalizadas
  const baseActions = getPersonalizedActions(disc, blockage, energy);

  // Dica do coach
  const coachTips: Record<DISCProfile, Record<EnergyLevel, string>> = {
    D: {
      high: "Energia alta + perfil executor = hora de atacar o mais difícil. Sem desculpas.",
      medium: "Mantenha o ritmo. Termine o que começou antes de iniciar algo novo.",
      low: "Desacelere. Fazer o mínimo com direção é melhor que forçar e travar.",
    },
    I: {
      high: "Canalize essa energia. Uma tarefa. Do início ao fim. Sem distrações.",
      medium: "Foque. Termine uma coisa antes de se empolgar com outra.",
      low: "Sua energia está baixa. Uma micro-ação de 2 minutos. Só isso.",
    },
    S: {
      high: "Raro momento de energia alta. Use para tomar aquela decisão que está adiando.",
      medium: "Ritmo constante. Faça uma coisa de cada vez, sem pressa mas sem parar.",
      low: "Está tudo bem. Faça algo pequeno e descanse sem culpa.",
    },
    C: {
      high: "Pare de planejar. Execute. Sua energia permite imperfeição produtiva agora.",
      medium: "O plano já existe. Execute o próximo passo. Sem repensar.",
      low: "Organize uma coisa pequena. Isso já conta como progresso.",
    },
  };

  return {
    profileLabel,
    interpretation,
    taskType: taskTypeMap[energy],
    intensity: intensityMap[energy][disc],
    approach: approachMap[disc][blockage],
    actions: baseActions,
    coachTip: coachTips[disc][energy],
  };
}

function getPersonalizedActions(
  disc: DISCProfile,
  blockage: P4Blockage,
  energy: EnergyLevel
): string[] {
  const actions: string[] = [];

  // Ação baseada no travamento
  const blockActions: Record<P4Blockage, string> = {
    parar: "Faça 3 respirações antes de iniciar qualquer tarefa",
    pensar: "Escreva em uma frase: o que preciso fazer agora?",
    decidir: "Defina um prazo de 2 minutos para sua próxima decisão",
    agir: "Comece pelos primeiros 2 minutos — só isso",
  };
  actions.push(blockActions[blockage]);

  // Ação baseada no DISC
  const discActions: Record<DISCProfile, string> = {
    D: "Antes de agir, escreva o objetivo em uma frase",
    I: "Escolha apenas UMA tarefa e ignore o resto",
    S: "Não espere se sentir pronto — comece agora",
    C: "Limite seu planejamento a 3 itens no máximo",
  };
  actions.push(discActions[disc]);

  // Ação baseada na energia
  const energyActions: Record<EnergyLevel, string> = {
    high: "Enfrente a tarefa mais difícil da sua lista agora",
    medium: "Foque em execução simples — sem tarefas complexas",
    low: "Faça apenas o mínimo necessário e descanse",
  };
  actions.push(energyActions[energy]);

  // Ação combinada DISC + energia
  if (energy === "low" && disc === "D") {
    actions.push("Desacelerar não é fraqueza. É estratégia.");
  } else if (energy === "high" && disc === "C") {
    actions.push("Menos análise, mais ação. Sua energia permite errar e corrigir.");
  } else if (energy === "low" && disc === "I") {
    actions.push("Sem energia pra empolgação. Use os 2 minutos e pare.");
  } else if (energy === "high" && disc === "S") {
    actions.push("Momento raro de energia alta. Tome uma decisão importante agora.");
  } else {
    actions.push("Use o fluxo P4 todos os dias — consistência é o método");
  }

  return actions;
}

// Sugestão de tarefa baseada na energia (para P4 Flow)
export function getEnergyTaskSuggestion(energy: EnergyLevel): string {
  switch (energy) {
    case "high":
      return "Energia alta. Escolha a tarefa mais difícil e importante.";
    case "medium":
      return "Energia média. Foque em execução — algo que você já sabe fazer.";
    case "low":
      return "Energia baixa. Escolha algo pequeno. Organizar uma gaveta já conta.";
  }
}

// Copy do P4 Flow adaptada por energia
export function getP4FlowCopy(energy: EnergyLevel, step: "parar" | "pensar" | "decidir" | "agir"): string {
  if (energy === "low") {
    const copies: Record<string, string> = {
      parar: "Respire. Você está com pouca energia. Tudo bem. Faça o mínimo hoje.",
      pensar: "Qual é a coisa mais simples que você pode fazer agora? Só uma.",
      decidir: "Não precisa ser perfeito. Escolha a tarefa mais fácil e pronto.",
      agir: "2 minutos. Só isso. Depois pode parar.",
    };
    return copies[step];
  }
  if (energy === "high") {
    const copies: Record<string, string> = {
      parar: "Respire antes de atacar. Direção antes da velocidade.",
      pensar: "Você tem energia. Use para a tarefa que mais importa. Qual é?",
      decidir: "Estruture com ambição. Você tem energia para micro-etapas maiores hoje.",
      agir: "Energia alta. Foco absoluto. Vá com tudo.",
    };
    return copies[step];
  }
  // medium — default
  return "";
}
