import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";

interface AppAccessButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AppAccessButton({
  variant = "primary",
  size = "md",
  className = "",
}: AppAccessButtonProps) {
  const appUrl = "https://metodop4.lovable.app";

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border",
  };

  return (
    <motion.a
      href={appUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <LogIn className="w-5 h-5" />
      <span>Acessar o App</span>
      <ArrowRight className="w-4 h-4" />
    </motion.a>
  );
}

/**
 * Componente para integração na Landing Page
 * Pode ser inserido em qualquer seção como CTA
 */
export function AppAccessBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full py-8 px-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl text-center space-y-4"
    >
      <div>
        <h3 className="text-xl font-bold">Pronto para começar?</h3>
        <p className="text-muted-foreground mt-2">
          Acesse o aplicativo Método P4 e inicie sua transformação agora mesmo.
        </p>
      </div>
      <AppAccessButton size="lg" />
    </motion.div>
  );
}
