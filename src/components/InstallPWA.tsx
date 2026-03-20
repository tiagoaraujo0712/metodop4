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
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-pb">
      <div className="max-w-md mx-auto p-4 rounded-2xl bg-card border border-border shadow-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-sm">Instalar Método P4</p>
            <p className="text-xs text-muted-foreground">Acesse como app nativo no seu celular.</p>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 active:scale-[0.9] transition-transform">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {isIOS ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Share className="w-4 h-4 shrink-0" />
            <p>Toque em <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong></p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-10 active:scale-[0.97] transition-transform">
            <Download className="w-4 h-4 mr-2" /> Instalar App
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Use o menu do navegador → "Adicionar à tela inicial"
          </p>
        )}
      </div>
    </div>
  );
}
