import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{ backgroundColor: "#0a0a0a" }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              }}
              className="text-5xl font-bold tracking-tight"
            >
              <span className="text-foreground">Método</span>{" "}
              <span className="text-gold">P4</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 0.5,
                y: 0,
                transition: { delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              }}
              className="text-xs text-muted-foreground mt-3 tracking-widest uppercase"
            >
              Ação gera transformação
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
