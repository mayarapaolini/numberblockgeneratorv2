import { describe, it, expect } from "vitest";
import {
  digitColorPlan,
  countColorPlan,
  placeColorPlan,
  factorGrid,
  countBlockColors,
  coldTint,
} from "../engine/numberPalette";

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

  it("gives 10 the white-with-red milestone treatment", () => {
    expect(countColorPlan(10)).toEqual({ kind: "milestone" });
  });

  it("gives a ten/hundred/thousand place (digit 1, not ones place) the milestone treatment", () => {
    expect(placeColorPlan(1, false)).toEqual({ kind: "milestone" });
    // but the ones place with digit 1 is just plain red, not the "10" milestone
    expect(placeColorPlan(1, true)).toEqual({ kind: "solid", color: "#ef4444" });
  });

  it("never modifies the fixed association even for other digits in a tens place", () => {
    expect(placeColorPlan(3, false)).toEqual({ kind: "solid", color: "#facc15" });
    expect(placeColorPlan(7, false)).toEqual({ kind: "rainbow" });
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

describe("composite number block coloring", () => {
  it("derives 37 as 30 (tens digit color) + 7 (rainbow)", () => {
    const colors = countBlockColors(37);
    expect(colors).toHaveLength(37);
    // first 30 blocks (3 tens) share the digit-3 color
    for (let i = 0; i < 30; i++) expect(colors[i].plan).toEqual({ kind: "solid", color: "#facc15" });
    // last 7 blocks are the rainbow ones digit
    for (let i = 30; i < 37; i++) expect(colors[i].plan).toEqual({ kind: "rainbow" });
  });

  it("derives 15 as a milestone ten + a light-blue five", () => {
    const colors = countBlockColors(15);
    expect(colors).toHaveLength(15);
    for (let i = 0; i < 10; i++) expect(colors[i].plan).toEqual({ kind: "milestone" });
    for (let i = 10; i < 15; i++) expect(colors[i].plan).toEqual({ kind: "solid", color: "#22d3ee" });
  });

  it("derives 20 as a uniform digit-2 orange (a clean multiple of ten)", () => {
    const colors = countBlockColors(20);
    expect(colors).toHaveLength(20);
    for (const entry of colors) expect(entry.plan).toEqual({ kind: "solid", color: "#f97316" });
  });

  it("keeps 100 predominantly white/milestone, not falling through to a wrong digit lookup", () => {
    const colors = countBlockColors(100);
    expect(colors).toHaveLength(100);
    for (const entry of colors) expect(entry.plan).toEqual({ kind: "milestone" });
  });
});

describe("cold tint for negative numbers", () => {
  it("shifts a color toward cold navy without turning it into an unrelated hue", () => {
    const tinted = coldTint("#ef4444");
    expect(tinted).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    expect(tinted).not.toBe("#ef4444");
  });
});
