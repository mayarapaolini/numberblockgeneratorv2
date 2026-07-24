import { useEffect, useRef } from "react";
import { serializeHugeNumber, deserializeHugeNumber } from "../engine/HugeNumber";
import type { GameState } from "../types/game";

const STORAGE_KEY = "numberlab.state.v1";
const SAVE_DEBOUNCE_MS = 400;
const PERSISTED_HISTORY_LIMIT = 10;

interface PersistedState {
  version: 1;
  value: string;
  mode: GameState["mode"];
  exponent: string;
  settings: GameState["settings"];
  auto: {
    operation: GameState["auto"]["operation"];
    step: string;
    speed: number;
    limit: string | null;
    repeat: boolean;
  };
  history: string[];
  planetIndex: number;
}

export function loadPersistedState(): Partial<GameState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return {
      value: deserializeHugeNumber(parsed.value),
      mode: parsed.mode,
      exponent: BigInt(parsed.exponent),
      settings: parsed.settings,
      auto: { ...parsed.auto, running: false },
      history: parsed.history.map(deserializeHugeNumber),
      future: [],
      planetIndex: parsed.planetIndex,
    };
  } catch {
    return null;
  }
}

function persist(state: GameState) {
  try {
    const payload: PersistedState = {
      version: 1,
      value: serializeHugeNumber(state.value),
      mode: state.mode,
      exponent: state.exponent.toString(),
      settings: state.settings,
      auto: {
        operation: state.auto.operation,
        step: state.auto.step,
        speed: state.auto.speed,
        limit: state.auto.limit,
        repeat: state.auto.repeat,
      },
      history: state.history.slice(-PERSISTED_HISTORY_LIMIT).map(serializeHugeNumber),
      planetIndex: state.planetIndex,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can fail (quota, private mode) - the game must keep working without it.
  }
}

/** Debounced auto-save of game state to localStorage. */
export function usePersistence(state: GameState) {
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => persist(state), SAVE_DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
    };
  }, [state]);
}

export function clearPersistedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
