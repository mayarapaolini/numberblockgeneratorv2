import { describe, it, expect } from "vitest";
import { digitColorPlan, identityColorPlan, factorGrid, countBlockColors, coldTint } from "../engine/numberPalette";

describe("fixed digit color palette", () => {
  it("maps each digit 1-9 to its required color category", () => {
    expect(digitColorPlan(1)).toEqual({ kind: "solid", color: "#ef4444" }); // red
    expect(digitColorPlan(2)).toEqual({ kind: "solid", color: "#f97316" }); // orange
    expect(digitColorPlan(3)).toEqual({ kind: "solid", color: "#facc15" }); // yellow
    expect(digitColorPlan(4)).toEqual({ kind: "solid", color: "#22c55e" }); // green
    expect(digitColorPlan(5)).toEqual({ kind: "solid", color: "#22d3ee" }); // light blue/cyan
    expect(digitColorPlan(6)).toEqual({ kind: "solid", color: "#a855f7" }); // purple
    expect(digitColorPlan(7)).toEqual({ kind: "rainbow" });
    expect(digitColorPlan(8)).toEqual({ kind: "solid", color: "#ec4899" }); // pink/magenta
    expect(digitColorPlan(9)).toEqual({ kind: "solid", color: "#9ca3af" }); // gray
  });

  it("gives exactly 10 the white-with-red milestone treatment", () => {
    expect(identityColorPlan(10)).toEqual({ kind: "milestone" });
  });
});

describe("identity color: one dominant color per character, from its leading digit", () => {
  it("colors a character by its leading digit, not a tens/ones patchwork", () => {
    expect(identityColorPlan(1)).toEqual({ kind: "solid", color: "#ef4444" });
    expect(identityColorPlan(25)).toEqual({ kind: "solid", color: "#f97316" }); // leading 2 -> orange
    expect(identityColorPlan(37)).toEqual({ kind: "solid", color: "#facc15" }); // leading 3 -> yellow
    expect(identityColorPlan(99)).toEqual({ kind: "solid", color: "#9ca3af" }); // leading 9 -> gray
  });

  it("keeps 100 in the same red family as 1, not white/gray - it is not the '10' milestone", () => {
    expect(identityColorPlan(100)).toEqual({ kind: "solid", color: "#ef4444" });
  });

  it("gives any leading-digit-7 number the rainbow treatment", () => {
    expect(identityColorPlan(7)).toEqual({ kind: "rainbow" });
    expect(identityColorPlan(72)).toEqual({ kind: "rainbow" });
  });

  it("every cell of a count shares that one identity plan", () => {
    const colors = countBlockColors(100);
    expect(colors).toHaveLength(100);
    for (const entry of colors) expect(entry.plan).toEqual({ kind: "solid", color: "#ef4444" });
  });
});

describe("factor-revealing grid layout", () => {
  it("matches the documented examples", () => {
    expect(factorGrid(1)).toMatchObject({ rows: 1, cols: 1 });
    expect(factorGrid(4)).toMatchObject({ rows: 2, cols: 2 });
    expect(factorGrid(6)).toMatchObject({ rows: 2, cols: 3 });
    expect(factorGrid(8)).toMatchObject({ rows: 2, cols: 4 });
    expect(factorGrid(9)).toMatchObject({ rows: 3, cols: 3 });
    expect(factorGrid(12)).toMatchObject({ rows: 3, cols: 4 });
    expect(factorGrid(16)).toMatchObject({ rows: 4, cols: 4 });
    expect(factorGrid(20)).toMatchObject({ rows: 4, cols: 5 });
    expect(factorGrid(25)).toMatchObject({ rows: 5, cols: 5 });
    expect(factorGrid(100)).toMatchObject({ rows: 10, cols: 10 });
  });

  it("wraps primes into a near-square grid instead of one absurdly wide row", () => {
    const grid = factorGrid(97);
    expect(grid.isExactRectangle).toBe(false);
    expect(grid.cols).toBeLessThanOrEqual(10);
    expect(grid.rows * grid.cols).toBeGreaterThanOrEqual(97);
  });

  it("never returns a column count that would overflow the max width", () => {
    for (const n of [7, 11, 13, 37, 59, 97]) {
      expect(factorGrid(n, 10).cols).toBeLessThanOrEqual(10);
    }
  });
});

describe("cold tint for negative numbers", () => {
  it("shifts a color toward cold navy without turning it into an unrelated hue", () => {
    const tinted = coldTint("#ef4444");
    expect(tinted).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    expect(tinted).not.toBe("#ef4444");
  });
});
