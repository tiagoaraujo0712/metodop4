import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppState, loadState, saveState, UserProfile, DailyEntry } from "@/lib/store";
import type { Json } from "@/integrations/supabase/types";

export function useSupabaseSync() {
  const { user } = useAuth();

  // Pull profile from DB into local state
  const pullProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data && data.name) {
      const state = loadState();
      const profile: UserProfile = {
        name: data.name,
        discProfile: data.disc_profile as UserProfile["discProfile"],
        p4Blockage: data.p4_blockage as UserProfile["p4Blockage"],
        procrastinationLevel: data.procrastination_level,
        energySlots: (data.energy_slots as any[]) || [],
        onboardingComplete: data.onboarding_complete,
        createdAt: data.created_at,
      };
      saveState({ ...state, user: profile });
    }
  }, [user]);

  // Pull daily entries from DB
  const pullEntries = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(90);

    if (data) {
      const state = loadState();
      const entries: DailyEntry[] = data.map((d) => ({
        date: d.date,
        energyLevel: d.energy_level as DailyEntry["energyLevel"],
        p4Completed: d.p4_completed,
        task: d.task || undefined,
        microSteps: (d.micro_steps as string[]) || undefined,
        focusMinutes: d.focus_minutes || undefined,
        completedAt: d.completed_at || undefined,
      }));
      saveState({ ...state, dailyEntries: entries });
    }
  }, [user]);

  // Push profile to DB
  const pushProfile = useCallback(async (profile: UserProfile) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        name: profile.name,
        disc_profile: profile.discProfile,
        p4_blockage: profile.p4Blockage,
        procrastination_level: profile.procrastinationLevel,
        energy_slots: profile.energySlots as unknown as Json,
        onboarding_complete: profile.onboardingComplete,
      })
      .eq("user_id", user.id);
  }, [user]);

  // Push a daily entry to DB
  const pushDailyEntry = useCallback(async (entry: DailyEntry) => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      date: entry.date,
      energy_level: entry.energyLevel,
      p4_completed: entry.p4Completed,
      task: entry.task || null,
      micro_steps: (entry.microSteps || []) as unknown as Json,
      focus_minutes: entry.focusMinutes || 0,
      completed_at: entry.completedAt || null,
    };

    // Upsert by checking existing
    const { data: existing } = await supabase
      .from("daily_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", entry.date)
      .maybeSingle();

    if (existing) {
      await supabase.from("daily_entries").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("daily_entries").insert(payload);
    }
  }, [user]);

  // Initial sync on login
  useEffect(() => {
    if (!user) return;
    pullProfile().then(() => pullEntries());
  }, [user, pullProfile, pullEntries]);

  return { pushProfile, pushDailyEntry, pullProfile, pullEntries };
}
