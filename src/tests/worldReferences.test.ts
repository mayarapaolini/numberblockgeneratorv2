import { describe, it, expect } from "vitest";
import { fromSafeInteger, fromPowerOfTen } from "../engine/HugeNumber";
import { findClosestWorldReference, describeWorldComparison } from "../engine/worldReferences";
import { findClosestDepthReference, DEPTH_REFERENCES } from "../engine/depthReferences";
import { findClosestTemperatureReference, TEMPERATURE_REFERENCES } from "../engine/temperatureReferences";

describe("world and depth references", () => {
  it("matches the Burj Khalifa for a value around 828", () => {
    const reference = findClosestWorldReference(fromSafeInteger(828));
    expect(reference.id).toBe("burjkhalifa");
  });

  it("matches the observable universe for a galactically huge value", () => {
    const reference = findClosestWorldReference(fromPowerOfTen(27n));
    expect(reference.id).toBe("universo");
  });

  it("maps -49 (the game floor) to the deepest depth reference, the Mariana Trench", () => {
    const reference = findClosestDepthReference(49);
    expect(reference.id).toBe("fossamarianas");
  });

  it("maps -1 to the shallowest depth reference", () => {
    const reference = findClosestDepthReference(1);
    expect(reference.id).toBe(DEPTH_REFERENCES[0].id);
  });

  it("maps -49 (the game floor) to the coldest temperature reference, Pluto", () => {
    const reference = findClosestTemperatureReference(49);
    expect(reference.id).toBe("plutao");
  });

  it("maps -1 to the mildest temperature reference", () => {
    const reference = findClosestTemperatureReference(1);
    expect(reference.id).toBe(TEMPERATURE_REFERENCES[0].id);
  });

  it("describeWorldComparison never crashes and routes negatives to both depth and temperature text", () => {
    const text = describeWorldComparison(fromSafeInteger(-49));
    expect(text).toContain("Fossa das Marianas");
    expect(text).toContain("Plutão");
    expect(text).not.toContain("NaN");
    expect(text).not.toContain("Infinity");
  });

  it("describeWorldComparison handles zero without throwing", () => {
    expect(() => describeWorldComparison(fromSafeInteger(0))).not.toThrow();
  });
});
