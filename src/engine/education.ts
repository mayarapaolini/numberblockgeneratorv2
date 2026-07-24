import { type HugeNumber, orderOfMagnitude } from "./HugeNumber";
import { isPowerOfTen, getVisualLevel } from "./visualLevel";
import { formatDigitCount, groupThousands } from "./HugeNumberFormatter";
import { describeScale } from "./numberNames";
import type { GameMode } from "../types/game";

/** Short, spoken-friendly explanations shown near the character. */
export function getEducationalTip(value: HugeNumber, mode: GameMode): string {
  if ((mode === "exponential" || mode === "planet100") && isPowerOfTen(value) && value.sign === 1) {
    const exponent = orderOfMagnitude(value);
    if (exponent === 0n) return "10 elevado a 0 é 1! Qualquer número elevado a 0 vira 1.";
    if (exponent === 1n) return "10 elevado a 1 é só o próprio 10.";
    if (exponent === 2n) return "10 × 10 = 100. O expoente diz quantas vezes multiplicamos o 10 por ele mesmo.";
    if (exponent === 3n) return "10³ significa 10 × 10 × 10 = 1.000.";
    if (exponent <= 21n) {
      return `10 elevado a ${exponent} tem ${formatDigitCount(value)} dígitos: um 1 seguido de ${exponent} zeros!`;
    }
    const zeroCount = groupThousands(exponent.toString());
    return `Este número é grande demais para escrever todos os ${zeroCount} zeros — mas o computador sabe exatamente qual ele é!`;
  }

  if (getVisualLevel(value) === 4) {
    return `Este número tem ${formatDigitCount(value)} dígitos. Grande demais para escrever todos os zeros!`;
  }

  return describeScale(value);
}
