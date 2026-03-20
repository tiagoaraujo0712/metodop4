import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const REMINDER_KEY = "p4_reminder_time";
const NOTIF_GRANTED_KEY = "p4_notif_granted";

export default function ReminderSetup() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(() => localStorage.getItem(REMINDER_KEY) || "09:00");
  const [enabled, setEnabled] = useState(() => localStorage.getItem(REMINDER_KEY) !== null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function scheduleNext() {
      const [h, m] = time.split(":").map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const ms = target.getTime() - now.getTime();

      return setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("Método P4", {
            body: "Hora da sua sessão P4. A ação cura. 🔥",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          });
        }
        // Reschedule for next day
        scheduleNext();
      }, ms);
    }

    const tid = scheduleNext();
    return () => clearTimeout(tid);
  }, [enabled, time]);

  async function handleEnable() {
    if (!("Notification" in window)) {
      toast.error("Notificações não suportadas neste navegador.");
      return;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === "granted") {
      localStorage.setItem(REMINDER_KEY, time);
      localStorage.setItem(NOTIF_GRANTED_KEY, "true");
      setEnabled(true);
      toast.success(`Lembrete definido para ${time}`);
      setOpen(false);
    } else {
      toast.error("Permissão de notificação negada.");
    }
  }

  function handleDisable() {
    localStorage.removeItem(REMINDER_KEY);
    setEnabled(false);
    toast("Lembrete desativado");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-200 active:scale-[0.97] text-left w-full"
      >
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Lembrete diário</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enabled ? `Ativo às ${time}` : "Configurar horário"}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-xs text-primary font-medium tracking-widest uppercase">Lembrete</p>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground active:scale-[0.9] transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-foreground/80">Escolha o horário do lembrete diário para sua sessão P4.</p>

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex gap-3">
        <Button onClick={handleEnable} className="flex-1 h-10 text-sm active:scale-[0.97] transition-transform">
          {enabled ? "Atualizar" : "Ativar"}
        </Button>
        {enabled && (
          <Button onClick={handleDisable} variant="outline" className="h-10 text-sm active:scale-[0.97] transition-transform">
            Desativar
          </Button>
        )}
      </div>
    </div>
  );
}
