import { useCallback, useEffect, useRef } from "react";

export type SoundName = "grow" | "shrink" | "multiply" | "divide" | "powerOfTen" | "cosmic" | "error";

interface ToneStep {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
}

const SOUND_RECIPES: Record<SoundName, ToneStep[]> = {
  grow: [{ frequency: 440, duration: 0.09, type: "sine" }, { frequency: 660, duration: 0.12, type: "sine", delay: 0.07 }],
  shrink: [{ frequency: 520, duration: 0.09, type: "sine" }, { frequency: 340, duration: 0.12, type: "sine", delay: 0.07 }],
  multiply: [
    { frequency: 523, duration: 0.07, type: "triangle" },
    { frequency: 659, duration: 0.07, type: "triangle", delay: 0.06 },
    { frequency: 784, duration: 0.1, type: "triangle", delay: 0.12 },
  ],
  divide: [
    { frequency: 784, duration: 0.07, type: "triangle" },
    { frequency: 659, duration: 0.07, type: "triangle", delay: 0.06 },
    { frequency: 523, duration: 0.1, type: "triangle", delay: 0.12 },
  ],
  powerOfTen: [
    { frequency: 392, duration: 0.1, type: "square" },
    { frequency: 523, duration: 0.1, type: "square", delay: 0.09 },
    { frequency: 659, duration: 0.16, type: "square", delay: 0.18 },
  ],
  cosmic: [
    { frequency: 220, duration: 0.25, type: "sine" },
    { frequency: 440, duration: 0.25, type: "sine", delay: 0.15 },
    { frequency: 880, duration: 0.35, type: "sine", delay: 0.3 },
  ],
  error: [{ frequency: 180, duration: 0.18, type: "sawtooth" }],
};

/**
 * Web Audio based sound effects with no external audio files. The
 * AudioContext is created lazily on the first user gesture, matching
 * Safari/iOS autoplay restrictions.
 */
export function useSound(enabled: boolean, volume: number) {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(volume);
  enabledRef.current = enabled;
  volumeRef.current = volume;

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;
    if (!contextRef.current) {
      contextRef.current = new AudioContextCtor();
    }
    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
    return contextRef.current;
  }, []);

  useEffect(() => {
    const unlock = () => ensureContext();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureContext]);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabledRef.current) return;
      const ctx = ensureContext();
      if (!ctx) return;
      const steps = SOUND_RECIPES[name];
      const now = ctx.currentTime;
      const gainScale = Math.max(0, Math.min(1, volumeRef.current)) * 0.18;

      for (const step of steps) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = step.type ?? "sine";
        oscillator.frequency.value = step.frequency;
        const startTime = now + (step.delay ?? 0);
        const endTime = startTime + step.duration;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gainScale, startTime + 0.015);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(endTime + 0.02);
      }
    },
    [ensureContext],
  );

  return { play };
}
