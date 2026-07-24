import { MAX_EXPONENT, MIN_EXPONENT } from "../engine/HugeNumber";

export const EXPONENT_STEPS = [1n, 10n, 100n, 1000n] as const;

export function clampExponent(exp: bigint): bigint {
  if (exp < MIN_EXPONENT) return MIN_EXPONENT;
  if (exp > MAX_EXPONENT) return MAX_EXPONENT;
  return exp;
}

export const EXPONENT_LANDMARKS: bigint[] = [
  0n,
  1n,
  2n,
  3n,
  6n,
  9n,
  12n,
  19n,
  20n,
  21n,
  100n,
  1000n,
  99999n,
  MAX_EXPONENT,
];
