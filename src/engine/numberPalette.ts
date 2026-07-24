/**
 * Fixed color-per-digit system. A color-to-number convention like this is a
 * system/idea (not protected creative expression) - the actual protected
 * expression is the original face, body proportions and accessories drawn
 * in NumberCharacter/draw.ts, which do not copy any existing character.
 */
export type ColorPlan =
  | { kind: "solid"; color: string }
  | { kind: "rainbow" }
  | { kind: "milestone" }; // white base + red accent, for a single ten/hundred/thousand group

const DIGIT_SOLID_COLORS: Record<number, string> = {
  0: "#e2e8f0",
  1: "#ef4444",
  2: "#f97316",
  3: "#facc15",
  4: "#22c55e",
  5: "#22d3ee",
  6: "#a855f7",
  8: "#ec4899",
  9: "#9ca3af",
};

export const RAINBOW_SEQUENCE = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#22d3ee", "#a855f7", "#ec4899"];

export const MILESTONE_BASE = "#ffffff";
export const MILESTONE_ACCENT = "#ef4444";

/** Color for a single digit 0-9 (7 is always the special rainbow flag). */
export function digitColorPlan(digit: number): ColorPlan {
  if (digit === 7) return { kind: "rainbow" };
  return { kind: "solid", color: DIGIT_SOLID_COLORS[digit] ?? DIGIT_SOLID_COLORS[0] };
}

/** Color for a place-value tier (tens/hundreds/thousands); the ones place never gets the milestone treatment. */
export function placeColorPlan(digit: number, isOnesPlace: boolean): ColorPlan {
  if (digit === 1 && !isOnesPlace) return { kind: "milestone" };
  return digitColorPlan(digit);
}

/** Color for a whole literal 1-10 count (10 is the milestone white/red). */
export function countColorPlan(count: number): ColorPlan {
  if (count === 10) return { kind: "milestone" };
  return digitColorPlan(count);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const COLD_TARGET: [number, number, number] = [30, 64, 120];

/** Frosts a color toward a cold navy blue - used for negative numbers, which keep their base hue. */
export function coldTint(hex: string, amount = 0.5): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (channel: number, target: number) => Math.round(channel + (target - channel) * amount);
  return `rgb(${mix(r, COLD_TARGET[0])}, ${mix(g, COLD_TARGET[1])}, ${mix(b, COLD_TARGET[2])})`;
}

export interface FactorGrid {
  rows: number;
  cols: number;
  isExactRectangle: boolean;
}

/**
 * Finds a rows x cols grid for `n` blocks that reveals its factors, picking
 * the pair closest to a square (e.g. 12 -> 3x4, 16 -> 4x4, 100 -> 10x10).
 * Numbers with no nice factor under `maxCols` (primes, or factors that would
 * make an absurdly wide single row) wrap into a near-square grid instead,
 * with the last row simply shorter - never a partial/cut block.
 */
export function factorGrid(n: number, maxCols = 10): FactorGrid {
  if (n <= 0) return { rows: 1, cols: 1, isExactRectangle: false };

  let best: { rows: number; cols: number } | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let rows = 1; rows * rows <= n; rows++) {
    if (n % rows !== 0) continue;
    const cols = n / rows;
    if (cols > maxCols) continue;
    const diff = cols - rows;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = { rows, cols };
    }
  }

  if (best) return { rows: best.rows, cols: best.cols, isExactRectangle: true };

  const cols = Math.min(maxCols, Math.max(1, Math.ceil(Math.sqrt(n))));
  const rows = Math.ceil(n / cols);
  return { rows, cols, isExactRectangle: false };
}

export interface BlockColorEntry {
  plan: ColorPlan;
  rainbowIndex: number;
}

/**
 * Assigns a ColorPlan to every block (by flattened index) in a literal count
 * of `count` blocks, deriving composite numbers from their tens/ones digits
 * so e.g. 37 reads as "30 (tens digit's color) + 7 (rainbow)".
 */
export function countBlockColors(count: number): BlockColorEntry[] {
  if (count <= 0) return [];
  if (count <= 10) {
    const plan = countColorPlan(count);
    return Array.from({ length: count }, (_, i) => ({ plan, rainbowIndex: i }));
  }
  if (count === 100) {
    // 10 tens of ten: predominantly white with red details, like 10 scaled up.
    const plan: ColorPlan = { kind: "milestone" };
    return Array.from({ length: 100 }, (_, i) => ({ plan, rainbowIndex: i }));
  }

  const tensDigit = Math.floor(count / 10);
  const onesDigit = count % 10;
  const tensBlockCount = tensDigit * 10;
  const tensPlan = placeColorPlan(tensDigit, false);
  const onesPlan = digitColorPlan(onesDigit);

  const entries: BlockColorEntry[] = [];
  for (let i = 0; i < tensBlockCount; i++) entries.push({ plan: tensPlan, rainbowIndex: i });
  for (let i = 0; i < onesDigit; i++) entries.push({ plan: onesPlan, rainbowIndex: i });
  return entries;
}
