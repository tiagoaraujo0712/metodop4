import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoP4 from "@/assets/logo-p4.png";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1800);
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
            <motion.img
              src={logoP4}
              alt="Método P4"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
              }}
              className="w-56 h-56 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
