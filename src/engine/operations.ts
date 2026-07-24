import {
  type HugeNumber,
  type Sign,
  ZERO,
  HugeNumberError,
  compare,
  isZero,
  negate,
  abs,
  fromDecimalString,
  toCompact,
  fromCompact,
  pow10,
  roundDivide,
  MAX_EXPONENT,
} from "./HugeNumber";

/**
 * Beyond this many digits of exponent difference, the smaller operand cannot
 * affect the larger one at thousandths precision, so we skip the alignment
 * entirely. This keeps add/subtract O(1) even when one side is 10^3000003.
 */
const NEGLIGIBLE_EXPONENT_GAP = 40n;

export function add(a: HugeNumber, b: HugeNumber): HugeNumber {
  if (isZero(a)) return b;
  if (isZero(b)) return a;

  const ca = toCompact(a);
  const cb = toCompact(b);
  const gap = ca.exp - cb.exp;

  if (gap > NEGLIGIBLE_EXPONENT_GAP) return a;
  if (-gap > NEGLIGIBLE_EXPONENT_GAP) return b;

  const minExp = ca.exp < cb.exp ? ca.exp : cb.exp;
  const shiftA = Number(ca.exp - minExp);
  const shiftB = Number(cb.exp - minExp);
  const signedA = ca.coeff * pow10(shiftA) * BigInt(ca.sign);
  const signedB = cb.coeff * pow10(shiftB) * BigInt(cb.sign);
  const sum = signedA + signedB;

  if (sum === 0n) return ZERO;
  const sign: Sign = sum > 0n ? 1 : -1;
  const coeff = sum > 0n ? sum : -sum;
  return fromCompact({ sign, coeff, exp: minExp });
}

export function subtract(a: HugeNumber, b: HugeNumber): HugeNumber {
  return add(a, negate(b));
}

export function multiply(a: HugeNumber, b: HugeNumber): HugeNumber {
  if (isZero(a) || isZero(b)) return ZERO;
  const ca = toCompact(a);
  const cb = toCompact(b);
  const coeff = ca.coeff * cb.coeff;
  const exp = ca.exp + cb.exp;
  const sign = (ca.sign * cb.sign) as Sign;
  const result = fromCompact({ sign, coeff, exp });
  return clampExponent(result);
}

export function divide(a: HugeNumber, b: HugeNumber): HugeNumber {
  if (isZero(b)) {
    throw new HugeNumberError("Não é possível dividir por zero.", "DIVIDE_BY_ZERO");
  }
  if (isZero(a)) return ZERO;

  const ca = toCompact(a);
  const cb = toCompact(b);
  const sign = (ca.sign * cb.sign) as Sign;

  // Extra precision digits so the final round-to-thousandths stays accurate.
  const EXTRA_DIGITS = 10;
  const numerator = ca.coeff * pow10(EXTRA_DIGITS);
  const rawQuotient = roundDivide(numerator, cb.coeff);
  const exp = ca.exp - cb.exp - BigInt(EXTRA_DIGITS);

  const result = fromCompact({ sign, coeff: rawQuotient, exp });
  return clampExponent(result);
}

export function multiplyByDecimalString(a: HugeNumber, multiplierText: string): HugeNumber {
  const multiplier = fromDecimalString(multiplierText);
  return multiply(a, multiplier);
}

function clampExponent(n: HugeNumber): HugeNumber {
  if (n.kind === "scientific" && n.exponent > MAX_EXPONENT) {
    return { kind: "scientific", sign: n.sign, mantissaThousandths: 9999n, exponent: MAX_EXPONENT };
  }
  return n;
}

export function min(a: HugeNumber, b: HugeNumber): HugeNumber {
  return compare(a, b) <= 0 ? a : b;
}

export function max(a: HugeNumber, b: HugeNumber): HugeNumber {
  return compare(a, b) >= 0 ? a : b;
}

export function clamp(value: HugeNumber, low: HugeNumber, high: HugeNumber): HugeNumber {
  return max(low, min(high, value));
}

export { abs };
