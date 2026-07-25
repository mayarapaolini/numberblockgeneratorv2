import { describe, it, expect } from "vitest";
import { fromSafeInteger, fromDecimalString, fromPowerOfTen } from "../engine/HugeNumber";
import { nameHugeNumberEn } from "../engine/numberNamesEn";

describe("nameHugeNumberEn", () => {
  it("names zero", () => {
    expect(nameHugeNumberEn(fromSafeInteger(0))).toBe("zero");
  });

  it("names small integers", () => {
    expect(nameHugeNumberEn(fromSafeInteger(1))).toBe("one");
    expect(nameHugeNumberEn(fromSafeInteger(13))).toBe("thirteen");
    expect(nameHugeNumberEn(fromSafeInteger(42))).toBe("forty-two");
    expect(nameHugeNumberEn(fromSafeInteger(100))).toBe("one hundred");
  });

  it("names hundreds with tens and units", () => {
    expect(nameHugeNumberEn(fromSafeInteger(161))).toBe("one hundred and sixty-one");
  });

  it("names thousands and millions with scale words", () => {
    expect(nameHugeNumberEn(fromSafeInteger(1000))).toBe("one thousand");
    expect(nameHugeNumberEn(fromSafeInteger(1_000_000))).toBe("one million");
  });

  it("prefixes negative numbers with minus", () => {
    expect(nameHugeNumberEn(fromSafeInteger(-5))).toBe("minus five");
  });

  it("never crashes on decimals or huge numbers", () => {
    expect(() => nameHugeNumberEn(fromDecimalString("1.25"))).not.toThrow();
    expect(() => nameHugeNumberEn(fromPowerOfTen(500n))).not.toThrow();
  });
});
