import { type HugeNumber, orderOfMagnitude } from "../engine/HugeNumber";

export interface ElongationScale {
  /** Visual scale factor applied to the character, clamped to keep it on-screen. */
  scaleFactor: number;
  /** 0..1 progress within the current visual tier, for smooth camera easing. */
  progress: number;
}

/**
 * Maps a number's order of magnitude to a bounded visual scale so the
 * character keeps growing without ever leaving the visible stage.
 */
export function computeElongationScale(value: HugeNumber): ElongationScale {
  const magnitude = orderOfMagnitude(value);
  const magnitudeNumber = magnitude > 40n ? 40 : magnitude < -3n ? -3 : Number(magnitude);
  // Logistic-style compression: fast growth for small numbers, asymptotic beyond magnitude 6.
  const raw = 1 + Math.log2(1 + Math.max(0, magnitudeNumber + 3)) * 0.55;
  const scaleFactor = Math.min(2.6, Math.max(0.4, raw));
  const progress = Math.min(1, Math.max(0, (magnitudeNumber + 3) / 10));
  return { scaleFactor, progress };
}
