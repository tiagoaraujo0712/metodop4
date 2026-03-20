import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  }

  if (isInstalled || dismissed) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="p-3 rounded-xl bg-card border border-border shadow-lg flex items-center gap-3 max-w-xs">
        <button onClick={() => setDismissed(true)} className="p-0.5 active:scale-[0.9] transition-transform shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {isIOS ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Share className="w-3.5 h-3.5 shrink-0" />
            <p><strong>Compartilhar</strong> → <strong>Tela de Início</strong></p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="sm" className="h-8 text-xs font-medium active:scale-[0.97] transition-transform gap-1.5">
            <Download className="w-3.5 h-3.5" /> Instalar App
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Menu → "Adicionar à tela inicial"
          </p>
        )}
      </div>
    </div>
  );
}
