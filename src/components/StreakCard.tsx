import { motion } from "framer-motion";
import { Badge } from "@/lib/gamification";
import { Flame, Trophy } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  totalSessions: number;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  badges,
  totalSessions,
}: StreakCardProps) {
  const recentBadges = badges.slice(-3); // Show 3 most recent badges

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      }}
      className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 space-y-4"
    >
      {/* Streak Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-widest">
            Sequência Ativa
          </span>
        </div>
        {currentStreak > 0 && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/20 text-primary">
            {currentStreak} dias 🔥
          </span>
        )}
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-2xl font-bold text-primary">{currentStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">Dias consecutivos</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-2xl font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">Melhor sequência</p>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-muted-foreground">
              {badges.length} Conquista{badges.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {recentBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-2 rounded-lg bg-background/50 border border-border text-center hover:border-primary/40 transition-colors cursor-default"
                title={badge.description}
              >
                <div className="text-2xl">{badge.icon}</div>
                <p className="text-xs font-semibold mt-1 line-clamp-2">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
          {badges.length > 3 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{badges.length - 3} mais
            </p>
          )}
        </div>
      )}

      {/* Motivational Message */}
      <div className="pt-2 border-t border-border/50">
        {currentStreak === 0 ? (
          <p className="text-xs text-muted-foreground">
            Comece hoje! Cada sessão P4 conta. 🚀
          </p>
        ) : currentStreak < 7 ? (
          <p className="text-xs text-muted-foreground">
            Você está no caminho! {7 - currentStreak} dias para a badge "Guerreiro da Semana". 💪
          </p>
        ) : currentStreak < 30 ? (
          <p className="text-xs text-muted-foreground">
            Incrível! {30 - currentStreak} dias para "Mestre do Mês". 🎯
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Você é uma lenda! Consistência é sua superpotência. 👑
          </p>
        )}
      </div>
    </motion.div>
  );
}
