import { useCallback, useMemo } from "react";
import type { NarrationLang } from "../types/game";

const supported = typeof window !== "undefined" && "speechSynthesis" in window;

/** Optional narration (pt-BR or en-US) via SpeechSynthesis. Never blocks the game if unavailable. */
export function useNarration(enabled: boolean) {
  const speak = useCallback(
    (text: string, lang: NarrationLang = "pt-BR") => {
      if (!enabled || !supported) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Narration is a nice-to-have; failures must never affect gameplay.
      }
    },
    [enabled],
  );

  return useMemo(() => ({ speak, supported }), [speak]);
}
