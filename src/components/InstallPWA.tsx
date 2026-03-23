import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

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

  // Only show when browser supports install prompt and not already installed
  if (isInstalled || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="p-3 rounded-xl bg-card border border-border shadow-lg flex items-center gap-3 max-w-xs">
        <button onClick={() => setDismissed(true)} className="p-0.5 active:scale-[0.9] transition-transform shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <Button onClick={handleInstall} size="sm" className="h-8 text-xs font-medium active:scale-[0.97] transition-transform gap-1.5">
          <Download className="w-3.5 h-3.5" /> Instalar App
        </Button>
      </div>
    </div>
  );
}
