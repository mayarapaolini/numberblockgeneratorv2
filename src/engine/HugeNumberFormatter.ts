import {
  type HugeNumber,
  type FiniteHugeNumber,
  bigIntDigitCount,
  pow10,
  roundDivide,
} from "./HugeNumber";

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export function toSuperscript(value: bigint): string {
  return value
    .toString()
    .split("")
    .map((c) => SUPERSCRIPT_DIGITS[c] ?? c)
    .join("");
}

export function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Integer digit count of the number's magnitude, independent of storage kind. */
export function integerDigitCount(n: HugeNumber): bigint {
  if (n.kind === "finite") {
    return BigInt(Math.max(1, bigIntDigitCount(n.coefficient) - n.scale));
  }
  return n.exponent + 1n;
}

const SCIENTIFIC_DISPLAY_THRESHOLD = 7n;

export function shouldDisplayScientific(n: HugeNumber): boolean {
  return integerDigitCount(n) >= SCIENTIFIC_DISPLAY_THRESHOLD;
}

function splitFinite(n: FiniteHugeNumber): { intPart: string; fracPart: string } {
  const raw = n.coefficient.toString().padStart(n.scale + 1, "0");
  if (n.scale === 0) return { intPart: raw, fracPart: "" };
  return { intPart: raw.slice(0, raw.length - n.scale), fracPart: raw.slice(raw.length - n.scale) };
}

/** Plain "12", "-15", "125,375" style formatting for small/medium numbers. */
export function formatPlain(n: FiniteHugeNumber): string {
  if (n.sign === 0) return "0";
  const { intPart, fracPart } = splitFinite(n);
  const sign = n.sign === -1 ? "-" : "";
  const grouped = groupThousands(intPart);
  return fracPart ? `${sign}${grouped},${fracPart}` : `${sign}${grouped}`;
}

function mantissaText(mantissaThousandths: bigint): string {
  const intDigit = mantissaThousandths / 1000n;
  const frac = mantissaThousandths % 1000n;
  if (frac === 0n) return intDigit.toString();
  const fracStr = frac.toString().padStart(3, "0").replace(/0+$/, "");
  return `${intDigit},${fracStr}`;
}

function toMantissaExponent(n: HugeNumber): { sign: -1 | 1; mantissaThousandths: bigint; exponent: bigint } {
  if (n.kind === "scientific") return n;
  const digits = bigIntDigitCount(n.coefficient);
  const exponent = BigInt(digits - 1 - n.scale);
  const wantDigits = 4;
  const mantissaThousandths =
    digits <= wantDigits
      ? n.coefficient * pow10(wantDigits - digits)
      : roundDivide(n.coefficient, pow10(digits - wantDigits));
  return { sign: (n.sign === -1 ? -1 : 1) as -1 | 1, mantissaThousandths, exponent };
}

/** Scientific "1 × 10⁶" style formatting, valid for any magnitude. */
export function formatScientific(n: HugeNumber): string {
  if (n.sign === 0) return "0";
  const { sign, mantissaThousandths, exponent } = toMantissaExponent(n);
  const prefix = sign === -1 ? "-" : "";
  return `${prefix}${mantissaText(mantissaThousandths)} × 10${toSuperscript(exponent)}`;
}

export interface FormattedNumber {
  /** Best display string for the current magnitude. */
  primary: string;
  /** Always-available scientific notation string. */
  scientific: string;
  /** Always-available plain notation, only precise for small/medium numbers. */
  plain: string | null;
  isScientificDisplay: boolean;
  integerDigits: bigint;
}

export function formatHugeNumber(n: HugeNumber): FormattedNumber {
  const scientific = formatScientific(n);
  const plain = n.kind === "finite" ? formatPlain(n) : null;
  const isScientificDisplay = shouldDisplayScientific(n);
  return {
    primary: isScientificDisplay ? scientific : (plain ?? scientific),
    scientific,
    plain,
    isScientificDisplay,
    integerDigits: integerDigitCount(n),
  };
}

/** How many digits the number has, formatted for a child ("tem 3.000.003 dígitos"). */
export function formatDigitCount(n: HugeNumber): string {
  return groupThousands(integerDigitCount(n).toString());
}
