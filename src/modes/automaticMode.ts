import {
  type HugeNumber,
  fromDecimalString,
  fromPowerOfTen,
  compare,
  MAX_EXPONENT,
} from "../engine/HugeNumber";
import { add, subtract, multiply, divide } from "../engine/operations";
import type { AutoModeConfig } from "../types/game";
import { MILESTONES } from "../engine/milestones";

/** Base tick interval in ms at 1x speed; actual interval = BASE_INTERVAL_MS / speed. */
export const BASE_INTERVAL_MS = 900;

export const AUTO_SPEED_MIN = 0.25;
export const AUTO_SPEED_MAX = 4;

export interface AutoTickResult {
  value: HugeNumber;
  exponent: bigint;
  reachedLimit: boolean;
}

/** Computes the next value for one automatic-mode tick. Pure and O(1) regardless of magnitude. */
export function computeAutoTick(
  current: HugeNumber,
  currentExponent: bigint,
  config: AutoModeConfig,
  planetIndex: number,
): AutoTickResult {
  const step = safeStep(config.step);

  switch (config.operation) {
    case "increment":
      return withLimit(add(current, step), currentExponent, config);
    case "decrement":
      return withLimit(subtract(current, step), currentExponent, config);
    case "multiply":
      return withLimit(multiply(current, step), currentExponent, config);
    case "divide": {
      try {
        return withLimit(divide(current, step), currentExponent, config);
      } catch {
        return { value: current, exponent: currentExponent, reachedLimit: true };
      }
    }
    case "powersOfTen": {
      const nextExp = currentExponent + 1n > MAX_EXPONENT ? (config.repeat ? 0n : MAX_EXPONENT) : currentExponent + 1n;
      return {
        value: fromPowerOfTen(nextExp),
        exponent: nextExp,
        reachedLimit: nextExp >= MAX_EXPONENT,
      };
    }
    case "specials": {
      const next = (planetIndex + 1) % MILESTONES.length;
      const milestone = MILESTONES[next];
      return { value: milestone.value(), exponent: currentExponent, reachedLimit: next === 0 };
    }
    default:
      return { value: current, exponent: currentExponent, reachedLimit: false };
  }
}

function safeStep(text: string): HugeNumber {
  try {
    return fromDecimalString(text);
  } catch {
    return fromDecimalString("1");
  }
}

function withLimit(value: HugeNumber, exponent: bigint, config: AutoModeConfig): AutoTickResult {
  if (!config.limit) return { value, exponent, reachedLimit: false };
  try {
    const limit = fromDecimalString(config.limit);
    const isIncreasing = config.operation === "increment" || config.operation === "multiply";
    const reached = isIncreasing ? compare(value, limit) >= 0 : compare(value, limit) <= 0;
    return { value: reached ? limit : value, exponent, reachedLimit: reached };
  } catch {
    return { value, exponent, reachedLimit: false };
  }
}

export function intervalForSpeed(speed: number): number {
  const clamped = Math.min(AUTO_SPEED_MAX, Math.max(AUTO_SPEED_MIN, speed));
  return BASE_INTERVAL_MS / clamped;
}
