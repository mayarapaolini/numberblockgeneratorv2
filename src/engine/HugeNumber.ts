/**
 * HugeNumber - a symbolic, normalized numeric engine.
 *
 * Values are never represented as JS `number`. Small/medium values keep an
 * exact bigint coefficient + decimal scale ("finite"); anything with more
 * integer digits than FINITE_DIGIT_CAP is stored as a 4-significant-digit
 * mantissa + bigint exponent ("scientific"). This lets the game reach
 * 10^3000003 without ever building a string of millions of characters or
 * looping proportionally to the exponent.
 */

export type Sign = -1 | 0 | 1;

export interface FiniteHugeNumber {
  kind: "finite";
  sign: Sign;
  /** Non-negative integer digits, value = sign * coefficient / 10^scale */
  coefficient: bigint;
  /** Number of decimal digits after the point, always 0..3 */
  scale: number;
}

export interface ScientificHugeNumber {
  kind: "scientific";
  sign: -1 | 1;
  /** Mantissa * 1000, normalized so 1000 <= mantissaThousandths <= 9999 */
  mantissaThousandths: bigint;
  /** Decimal exponent, 0 <= exponent <= MAX_EXPONENT */
  exponent: bigint;
}

export type HugeNumber = FiniteHugeNumber | ScientificHugeNumber;

/** Maximum decimal places of precision we keep (a "thousandth"). */
export const PRECISION_SCALE = 3;
export const PRECISION_FACTOR = 1000n;

/** Above this many integer digits, finite numbers are promoted to scientific. */
export const FINITE_DIGIT_CAP = 21;

/** Hard ceiling for exponents, per game design (10^3000003 is the max). */
export const MAX_EXPONENT = 3_000_003n;
export const MIN_EXPONENT = 0n;

export type HugeNumberErrorCode = "DIVIDE_BY_ZERO" | "INVALID_INPUT" | "EXPONENT_OUT_OF_RANGE";

export class HugeNumberError extends Error {
  readonly code: HugeNumberErrorCode;

  constructor(message: string, code: HugeNumberErrorCode) {
    super(message);
    this.name = "HugeNumberError";
    this.code = code;
  }
}

export const ZERO: FiniteHugeNumber = { kind: "finite", sign: 0, coefficient: 0n, scale: 0 };
export const ONE: FiniteHugeNumber = { kind: "finite", sign: 1, coefficient: 1n, scale: 0 };

function bigIntDigitCount(n: bigint): number {
  if (n === 0n) return 1;
  let v = n < 0n ? -n : n;
  let count = 0;
  // n is bounded by FINITE_DIGIT_CAP+PRECISION_SCALE digits by construction,
  // so this loop is O(1) in practice, never proportional to game values.
  while (v > 0n) {
    count++;
    v /= 10n;
  }
  return count;
}

function pow10(exp: number): bigint {
  if (exp < 0) throw new HugeNumberError("Expoente negativo inválido internamente", "INVALID_INPUT");
  let result = 1n;
  const base = 10n;
  for (let i = 0; i < exp; i++) result *= base;
  return result;
}

/** Builds a finite HugeNumber from an exact bigint coefficient/scale pair. */
export function makeFinite(sign: Sign, coefficient: bigint, scale: number): HugeNumber {
  if (coefficient < 0n) throw new HugeNumberError("Coeficiente não pode ser negativo", "INVALID_INPUT");
  return normalizeFinite({ kind: "finite", sign: coefficient === 0n ? 0 : sign, coefficient, scale });
}

function normalizeFinite(n: FiniteHugeNumber): HugeNumber {
  let { coefficient, scale, sign } = n;
  if (coefficient === 0n) return ZERO;

  // Round to at most PRECISION_SCALE decimal digits.
  if (scale > PRECISION_SCALE) {
    const drop = scale - PRECISION_SCALE;
    coefficient = roundDivide(coefficient, pow10(drop));
    scale = PRECISION_SCALE;
  }

  // Strip trailing zero decimals to keep coefficients compact.
  while (scale > 0 && coefficient % 10n === 0n) {
    coefficient /= 10n;
    scale--;
  }

  if (coefficient === 0n) return ZERO;

  const integerDigits = bigIntDigitCount(coefficient) - scale;
  if (integerDigits > FINITE_DIGIT_CAP) {
    return finiteToScientific(sign as -1 | 1, coefficient, scale);
  }

  return { kind: "finite", sign, coefficient, scale };
}

function roundDivide(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 1n) return numerator;
  const doubled = numerator * 2n;
  const quotient = doubled / denominator;
  // Round-half-up on the halved value.
  return (quotient + 1n) / 2n;
}

function finiteToScientific(sign: -1 | 1, coefficient: bigint, scale: number): HugeNumber {
  const digits = bigIntDigitCount(coefficient);
  const exponent = BigInt(digits - 1 - scale);
  const mantissaThousandths = mantissaFromDigits(coefficient, digits);
  return normalizeScientific({ kind: "scientific", sign, mantissaThousandths, exponent });
}

/** Extracts the leading 4 significant digits of a bigint as a 1000-9999 mantissa. */
function mantissaFromDigits(coefficient: bigint, digitCount: number): bigint {
  const wantDigits = 4;
  if (digitCount <= wantDigits) {
    return coefficient * pow10(wantDigits - digitCount);
  }
  const drop = digitCount - wantDigits;
  return roundDivide(coefficient, pow10(drop));
}

export function normalizeScientific(n: ScientificHugeNumber): HugeNumber {
  let { mantissaThousandths, exponent, sign } = n;
  if (mantissaThousandths === 0n) return ZERO;

  while (mantissaThousandths >= 10000n) {
    mantissaThousandths = roundDivide(mantissaThousandths, 10n);
    exponent += 1n;
  }
  while (mantissaThousandths < 1000n && mantissaThousandths > 0n) {
    mantissaThousandths *= 10n;
    exponent -= 1n;
  }

  if (mantissaThousandths >= 10000n) {
    mantissaThousandths = roundDivide(mantissaThousandths, 10n);
    exponent += 1n;
  }

  if (exponent > MAX_EXPONENT) {
    return { kind: "scientific", sign, mantissaThousandths: 9999n, exponent: MAX_EXPONENT };
  }
  if (exponent < 0n) {
    // Fell back below scientific range: convert back to finite.
    return scientificToFinite({ kind: "scientific", sign, mantissaThousandths, exponent });
  }

  // If small enough, prefer a finite representation for nicer display.
  const integerDigits = Number(exponent) + 1;
  if (integerDigits <= FINITE_DIGIT_CAP) {
    return scientificToFinite({ kind: "scientific", sign, mantissaThousandths, exponent });
  }

  return { kind: "scientific", sign, mantissaThousandths, exponent };
}

function scientificToFinite(n: ScientificHugeNumber): HugeNumber {
  const exp = Number(n.exponent);
  // value = mantissaThousandths * 10^(exp - 3)
  const shift = exp - 3;
  if (shift >= 0) {
    return normalizeFinite({
      kind: "finite",
      sign: n.sign,
      coefficient: n.mantissaThousandths * pow10(shift),
      scale: 0,
    });
  }
  return normalizeFinite({
    kind: "finite",
    sign: n.sign,
    coefficient: n.mantissaThousandths,
    scale: -shift,
  });
}

export function makeScientific(sign: -1 | 1, mantissaThousandths: bigint, exponent: bigint): HugeNumber {
  if (exponent < 0n) throw new HugeNumberError("Expoente não pode ser negativo", "EXPONENT_OUT_OF_RANGE");
  return normalizeScientific({ kind: "scientific", sign, mantissaThousandths, exponent });
}

/** Builds 10^exponent exactly (mantissa 1.000). */
export function fromPowerOfTen(exponent: bigint, sign: 1 | -1 = 1): HugeNumber {
  if (exponent < MIN_EXPONENT || exponent > MAX_EXPONENT) {
    throw new HugeNumberError(
      `Expoente deve estar entre ${MIN_EXPONENT} e ${MAX_EXPONENT}`,
      "EXPONENT_OUT_OF_RANGE",
    );
  }
  return makeScientific(sign, 1000n, exponent);
}

const DECIMAL_STRING_RE = /^-?\d+(\.\d+)?$/;

/** Parses a plain decimal string like "-15", "0.001", "999.999" into a HugeNumber. */
export function fromDecimalString(input: string): HugeNumber {
  const trimmed = input.trim().replace(",", ".");
  if (trimmed === "" || !DECIMAL_STRING_RE.test(trimmed)) {
    throw new HugeNumberError(`Entrada numérica inválida: "${input}"`, "INVALID_INPUT");
  }
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart, fracPart = ""] = unsigned.split(".");
  const scale = fracPart.length;
  const coefficient = BigInt((intPart || "0") + fracPart || "0");
  const sign: Sign = coefficient === 0n ? 0 : negative ? -1 : 1;
  return makeFinite(sign, coefficient, scale);
}

export function fromSafeInteger(value: number): HugeNumber {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new HugeNumberError("Valor deve ser um inteiro finito", "INVALID_INPUT");
  }
  const sign: Sign = value === 0 ? 0 : value > 0 ? 1 : -1;
  return makeFinite(sign, BigInt(Math.abs(value)), 0);
}

export function isZero(n: HugeNumber): boolean {
  return n.sign === 0;
}

export function negate(n: HugeNumber): HugeNumber {
  if (n.kind === "finite") {
    if (n.sign === 0) return ZERO;
    return { ...n, sign: (n.sign * -1) as Sign };
  }
  return { ...n, sign: (n.sign * -1) as -1 | 1 };
}

export function abs(n: HugeNumber): HugeNumber {
  if (n.kind === "finite") return { ...n, sign: n.sign === 0 ? 0 : 1 };
  return { ...n, sign: 1 };
}

/**
 * Compact representation used internally by add/compare: value = sign * coeff * 10^exp,
 * with coeff bounded to a small number of digits regardless of the number's magnitude.
 */
interface Compact {
  sign: Sign;
  coeff: bigint;
  exp: bigint;
}

function toCompact(n: HugeNumber): Compact {
  if (n.kind === "finite") {
    return { sign: n.sign, coeff: n.coefficient, exp: BigInt(-n.scale) };
  }
  return { sign: n.sign, coeff: n.mantissaThousandths, exp: n.exponent - 3n };
}

function fromCompact(c: Compact): HugeNumber {
  if (c.sign === 0 || c.coeff === 0n) return ZERO;
  if (c.exp >= 0n && c.exp <= 60n) {
    return normalizeFinite({
      kind: "finite",
      sign: c.sign,
      coefficient: c.coeff * pow10(Number(c.exp)),
      scale: 0,
    });
  }
  if (c.exp < 0n && c.exp >= -60n) {
    return normalizeFinite({
      kind: "finite",
      sign: c.sign,
      coefficient: c.coeff,
      scale: Number(-c.exp),
    });
  }
  // Far outside finite range: go straight to scientific.
  const digits = bigIntDigitCount(c.coeff);
  const exponent = c.exp + BigInt(digits - 1);
  const mantissaThousandths = mantissaFromDigits(c.coeff, digits);
  return normalizeScientific({ kind: "scientific", sign: c.sign as -1 | 1, mantissaThousandths, exponent });
}

/** Order of magnitude (roughly floor(log10(|n|))), used for comparisons & formatting. */
export function orderOfMagnitude(n: HugeNumber): bigint {
  if (n.kind === "finite") {
    if (n.sign === 0) return 0n;
    return BigInt(bigIntDigitCount(n.coefficient) - n.scale - 1);
  }
  return n.exponent;
}

export function compare(a: HugeNumber, b: HugeNumber): -1 | 0 | 1 {
  if (a.sign !== b.sign) return a.sign < b.sign ? -1 : 1;
  if (a.sign === 0) return 0;

  const magA = orderOfMagnitude(a);
  const magB = orderOfMagnitude(b);
  if (magA !== magB) {
    const bigger = magA > magB ? 1 : -1;
    return (a.sign === 1 ? bigger : -bigger) as -1 | 0 | 1;
  }

  const ca = toCompact(a);
  const cb = toCompact(b);
  const minExp = ca.exp < cb.exp ? ca.exp : cb.exp;
  const shiftA = ca.exp - minExp;
  const shiftB = cb.exp - minExp;
  // Bounded because both numbers share the same order of magnitude here.
  const alignedA = ca.coeff * pow10(Number(shiftA));
  const alignedB = cb.coeff * pow10(Number(shiftB));
  if (alignedA === alignedB) return 0;
  const cmp = alignedA > alignedB ? 1 : -1;
  return (a.sign === 1 ? cmp : -cmp) as -1 | 0 | 1;
}

export function equals(a: HugeNumber, b: HugeNumber): boolean {
  return compare(a, b) === 0;
}

/** Compact, bigint-safe serialization for localStorage / history persistence. */
export function serializeHugeNumber(n: HugeNumber): string {
  if (n.kind === "finite") return `F,${n.sign},${n.coefficient.toString()},${n.scale}`;
  return `S,${n.sign},${n.mantissaThousandths.toString()},${n.exponent.toString()}`;
}

export function deserializeHugeNumber(text: string): HugeNumber {
  const parts = text.split(",");
  if (parts[0] === "F") {
    const sign = Number(parts[1]) as Sign;
    return makeFinite(sign, BigInt(parts[2]), Number(parts[3]));
  }
  if (parts[0] === "S") {
    const sign = Number(parts[1]) as -1 | 1;
    return makeScientific(sign, BigInt(parts[2]), BigInt(parts[3]));
  }
  throw new HugeNumberError(`Não foi possível carregar o número salvo: "${text}"`, "INVALID_INPUT");
}

export { toCompact, fromCompact, pow10, bigIntDigitCount, roundDivide };
