import { type HugeNumber, bigIntDigitCount } from "./HugeNumber";
import { formatDigitCount, formatScientific, integerDigitCount } from "./HugeNumberFormatter";

const UNITS = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/** Names a 0-999 group. */
function nameGroup(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${UNITS[h]} hundred`);
  if (rest > 0) {
    if (rest < 20) {
      parts.push(UNITS[rest]);
    } else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      parts.push(u > 0 ? `${TENS[t]}-${UNITS[u]}` : TENS[t]);
    }
  }
  return parts.join(" and ");
}

const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion"];

const MAX_NAMED_GROUPS = SCALES.length - 1;

/** Names a non-negative integer up to 10^(3*MAX_NAMED_GROUPS) - 1 in English. */
export function nameNonNegativeIntegerEn(value: bigint): string {
  if (value === 0n) return "zero";

  const groups: number[] = [];
  let remaining = value;
  while (remaining > 0n) {
    groups.push(Number(remaining % 1000n));
    remaining /= 1000n;
  }

  if (groups.length > SCALES.length) {
    return null as unknown as string; // signals caller to fall back to scientific description
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupValue = groups[i];
    if (groupValue === 0) continue;
    if (i === 0) {
      parts.push(nameGroup(groupValue));
    } else {
      parts.push(`${nameGroup(groupValue)} ${SCALES[i]}`);
    }
  }

  return parts.join(", ");
}

/** Speakable/readable English name for any HugeNumber, falling back to a scale description for huge values. */
export function nameHugeNumberEn(n: HugeNumber): string {
  if (n.sign === 0) return "zero";
  const sign = n.sign === -1 ? "minus " : "";

  if (n.kind === "finite") {
    const digits = bigIntDigitCount(n.coefficient) - n.scale;
    if (n.scale === 0 && digits <= 3 * MAX_NAMED_GROUPS) {
      const name = nameNonNegativeIntegerEn(n.coefficient);
      if (name) return sign + name;
    }
    if (n.scale > 0) {
      const intPart = n.coefficient / 10n ** BigInt(n.scale);
      const intName = nameNonNegativeIntegerEn(intPart) || formatScientific(n);
      return `${sign}${intName} point ${n.coefficient % 10n ** BigInt(n.scale)}`;
    }
  }

  const digitCount = formatDigitCount(n);
  return `${sign}a giant number with ${digitCount} digits (${formatScientific(n)})`;
}

/** Short, child-friendly description of a number's scale, in English. */
export function describeScaleEn(n: HugeNumber): string {
  const digits = integerDigitCount(n);
  if (digits <= 3n) return "A small, friendly number.";
  if (digits <= 6n) return "A big number, in the hundreds or thousands!";
  if (digits <= 12n) return "A huge number, like millions or billions!";
  if (digits <= 100n) return "An astronomical number, bigger than anything you could count!";
  return "A number so big it's hard to imagine — bigger than every star in the universe!";
}
