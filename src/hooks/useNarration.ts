import { useCallback, useMemo } from "react";

const supported = typeof window !== "undefined" && "speechSynthesis" in window;

/** Optional pt-BR narration via SpeechSynthesis. Never blocks the game if unavailable. */
export function useNarration(enabled: boolean) {
  const speak = useCallback(
    (text: string) => {
      if (!enabled || !supported) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
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
