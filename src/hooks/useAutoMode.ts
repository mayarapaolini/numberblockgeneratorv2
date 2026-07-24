import { useEffect, useRef } from "react";
import type { HugeNumber } from "../engine/HugeNumber";
import type { AutoModeConfig } from "../types/game";
import { computeAutoTick, intervalForSpeed } from "../modes/automaticMode";

interface UseAutoModeParams {
  active: boolean;
  value: HugeNumber;
  exponent: bigint;
  auto: AutoModeConfig;
  planetIndex: number;
  onTick: (value: HugeNumber, exponent: bigint, planetIndex?: number) => void;
  onLimitReached: () => void;
}

/**
 * Drives automatic mode with a self-canceling timeout loop (not a busy rAF
 * loop) so ticks stay off the render path and never pile up if the tab is
 * backgrounded.
 */
export function useAutoMode({
  active,
  value,
  exponent,
  auto,
  planetIndex,
  onTick,
  onLimitReached,
}: UseAutoModeParams) {
  const stateRef = useRef({ value, exponent, planetIndex });
  stateRef.current = { value, exponent, planetIndex };

  useEffect(() => {
    if (!active || !auto.running) return undefined;

    let timeoutId: number;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const current = stateRef.current;
      const result = computeAutoTick(current.value, current.exponent, auto, current.planetIndex);
      const nextPlanetIndex =
        auto.operation === "specials" ? (current.planetIndex + 1) % 1_000_000 : current.planetIndex;
      onTick(result.value, result.exponent, nextPlanetIndex);
      if (result.reachedLimit && !auto.repeat) {
        onLimitReached();
        return;
      }
      timeoutId = window.setTimeout(tick, intervalForSpeed(auto.speed));
    };

    timeoutId = window.setTimeout(tick, intervalForSpeed(auto.speed));

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, auto, onLimitReached, onTick]);
}
