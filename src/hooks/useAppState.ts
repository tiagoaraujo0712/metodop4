import { useState, useCallback } from "react";
import { AppState, loadState, saveState } from "@/lib/store";

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  return { state, update };
}
