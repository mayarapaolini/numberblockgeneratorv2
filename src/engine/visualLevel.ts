import { type HugeNumber, abs, compare, fromSafeInteger } from "./HugeNumber";

export type VisualLevel = 1 | 2 | 3 | 4;

const LEVEL1_MAX = fromSafeInteger(100);
const LEVEL2_MAX = fromSafeInteger(20_000);

/**
 * Chooses how literally to render the character. Level 4 boundary is not
 * arbitrary: it's exactly where the engine itself switches from an exact
 * "finite" bigint representation to a rounded "scientific" one, so the
 * visuals and the math storage change tier together.
 */
export function getVisualLevel(value: HugeNumber): VisualLevel {
  const magnitude = abs(value);
  if (compare(magnitude, LEVEL1_MAX) <= 0) return 1;
  if (compare(magnitude, LEVEL2_MAX) <= 0) return 2;
  if (magnitude.kind === "finite") return 3;
  return 4;
}

/**
 * Converts a small-magnitude HugeNumber (levels 1-2, |value| <= 10000) to a
 * regular JS number for block-count visuals. Never use this for huge values.
 */
export function toSmallNumber(value: HugeNumber): number {
  if (value.kind !== "finite") return 10_000;
  const divisor = 10 ** value.scale;
  const magnitude = Number(value.coefficient) / divisor;
  return value.sign === -1 ? -magnitude : magnitude;
}

/** True for 1, 10, 100, 10^6, 10^3000003, etc. — triggers the "excited" reaction. */
export function isPowerOfTen(value: HugeNumber): boolean {
  if (value.sign !== 1) return false;
  if (value.kind === "scientific") return value.mantissaThousandths === 1000n;
  if (value.scale !== 0) return false;
  let c = value.coefficient;
  if (c === 0n) return false;
  if (c === 1n) return true;
  while (c > 1n) {
    if (c % 10n !== 0n) return false;
    c /= 10n;
  }
  return true;
}

export function isExactlyHundred(value: HugeNumber): boolean {
  return value.kind === "finite" && value.sign === 1 && value.scale === 0 && value.coefficient === 100n;
}
