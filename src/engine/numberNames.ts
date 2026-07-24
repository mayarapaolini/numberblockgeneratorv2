import { type HugeNumber, bigIntDigitCount } from "./HugeNumber";
import { formatDigitCount, formatScientific, integerDigitCount } from "./HugeNumberFormatter";

const UNITS = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const TENS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

const HUNDREDS = [
  "",
  "cem",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

/** Names a 0-999 group. */
function nameGroup(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(h === 1 && rest > 0 ? "cento" : HUNDREDS[h]);
  if (rest > 0) {
    if (rest < 20) {
      parts.push(UNITS[rest]);
    } else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      parts.push(u > 0 ? `${TENS[t]} e ${UNITS[u]}` : TENS[t]);
    }
  }
  return parts.join(" e ");
}

const SCALES: Array<{ singular: string; plural: string }> = [
  { singular: "", plural: "" },
  { singular: "mil", plural: "mil" },
  { singular: "milhão", plural: "milhões" },
  { singular: "bilhão", plural: "bilhões" },
  { singular: "trilhão", plural: "trilhões" },
  { singular: "quatrilhão", plural: "quatrilhões" },
  { singular: "quintilhão", plural: "quintilhões" },
  { singular: "sextilhão", plural: "sextilhões" },
];

const MAX_NAMED_GROUPS = SCALES.length - 1;

/** Names a non-negative integer up to 10^(3*MAX_NAMED_GROUPS) - 1 in Brazilian Portuguese. */
export function nameNonNegativeInteger(value: bigint): string {
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
    const scale = SCALES[i];
    if (i === 0) {
      parts.push(nameGroup(groupValue));
    } else if (i === 1) {
      parts.push(groupValue === 1 ? "mil" : `${nameGroup(groupValue)} mil`);
    } else {
      const scaleName = groupValue === 1 ? scale.singular : scale.plural;
      parts.push(`${nameGroup(groupValue)} ${scaleName}`);
    }
  }

  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const head = parts.slice(0, -1);
  const needsE = groups[0] > 0 && groups[0] < 100;
  return needsE ? `${head.join(", ")} e ${last}` : `${head.join(", ")} ${last}`;
}

/** Speakable/readable name for any HugeNumber, falling back to a scale description for huge values. */
export function nameHugeNumber(n: HugeNumber): string {
  if (n.sign === 0) return "zero";
  const sign = n.sign === -1 ? "menos " : "";

  if (n.kind === "finite") {
    const digits = bigIntDigitCount(n.coefficient) - n.scale;
    if (n.scale === 0 && digits <= 3 * MAX_NAMED_GROUPS) {
      const name = nameNonNegativeInteger(n.coefficient);
      if (name) return sign + name;
    }
    if (n.scale > 0) {
      const intPart = n.coefficient / 10n ** BigInt(n.scale);
      const intName = nameNonNegativeInteger(intPart) || formatScientific(n);
      return `${sign}${intName} vírgula ${n.coefficient % 10n ** BigInt(n.scale)}`;
    }
  }

  const digitCount = formatDigitCount(n);
  return `${sign}um número gigante com ${digitCount} dígitos (${formatScientific(n)})`;
}

/** Short, child-friendly description of a number's scale. */
export function describeScale(n: HugeNumber): string {
  const digits = integerDigitCount(n);
  if (digits <= 3n) return "Um número pequeno e amigável.";
  if (digits <= 6n) return "Um número grande, com centenas ou milhares!";
  if (digits <= 12n) return "Um número enorme, como milhões ou bilhões!";
  if (digits <= 100n) return "Um número astronômico, maior que qualquer coisa que dá pra contar!";
  return "Um número tão grande que nem cabe imaginar — é maior que todas as estrelas do universo!";
}
