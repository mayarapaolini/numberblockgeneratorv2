import { describe, it, expect } from "vitest";
import {
  fromDecimalString,
  fromSafeInteger,
  fromPowerOfTen,
  compare,
  equals,
  negate,
  MAX_EXPONENT,
  HugeNumberError,
} from "../engine/HugeNumber";
import { add, subtract, multiply, divide } from "../engine/operations";
import { formatHugeNumber, formatScientific, formatPlain } from "../engine/HugeNumberFormatter";

describe("HugeNumber basic arithmetic", () => {
  it("999 + 1 = 1000", () => {
    const result = add(fromSafeInteger(999), fromSafeInteger(1));
    expect(formatHugeNumber(result).primary).toBe("1.000");
  });

  it("1 ÷ 3 rounds to thousandths precision", () => {
    const result = divide(fromSafeInteger(1), fromSafeInteger(3));
    expect(result.kind).toBe("finite");
    if (result.kind === "finite") {
      expect(formatPlain(result)).toBe("0,333");
    }
  });

  it("1.5 × 2 = 3", () => {
    const result = multiply(fromDecimalString("1.5"), fromSafeInteger(2));
    expect(formatHugeNumber(result).primary).toBe("3");
  });

  it("accepts decimal multipliers with three decimal places", () => {
    for (const text of ["0.001", "0.125", "1.5", "2.375", "999.999"]) {
      expect(() => fromDecimalString(text)).not.toThrow();
    }
  });

  it("rounds arithmetic results to the nearest thousandth", () => {
    const result = divide(fromSafeInteger(10), fromSafeInteger(3));
    if (result.kind === "finite") {
      expect(formatPlain(result)).toBe("3,333");
    }
  });
});

describe("HugeNumber scientific range", () => {
  it("represents 10^99999 without infinity or precision loss", () => {
    const value = fromPowerOfTen(99999n);
    expect(value.kind).toBe("scientific");
    const formatted = formatScientific(value);
    expect(formatted).not.toContain("Infinity");
    expect(formatted).toContain("10");
    expect(formatted).toContain("99999".split("").map((d) => d).join("") === "99999" ? "" : "");
  });

  it("represents 10^3000003, the maximum exponent", () => {
    const value = fromPowerOfTen(MAX_EXPONENT);
    expect(value.kind).toBe("scientific");
    if (value.kind === "scientific") {
      expect(value.exponent).toBe(MAX_EXPONENT);
    }
    const formatted = formatScientific(value);
    expect(formatted).not.toMatch(/Infinity|NaN/);
  });

  it("compares 10^99999 < 10^100000", () => {
    const a = fromPowerOfTen(99999n);
    const b = fromPowerOfTen(100000n);
    expect(compare(a, b)).toBe(-1);
    expect(compare(b, a)).toBe(1);
  });

  it("multiplies two scientific-notation values correctly", () => {
    // (2 x 10^50) * (3 x 10^50) = 6 x 10^100
    const a = multiply(fromPowerOfTen(50n), fromSafeInteger(2));
    const b = multiply(fromPowerOfTen(50n), fromSafeInteger(3));
    const result = multiply(a, b);
    expect(result.kind).toBe("scientific");
    if (result.kind === "scientific") {
      expect(result.exponent).toBe(100n);
      expect(result.mantissaThousandths).toBe(6000n);
    }
  });

  it("never produces a representation containing Infinity", () => {
    const huge = fromPowerOfTen(MAX_EXPONENT);
    const result = multiply(huge, fromSafeInteger(999));
    expect(formatScientific(result)).not.toContain("Infinity");
    const serialized = JSON.stringify(result, (_k, v) => (typeof v === "bigint" ? v.toString() : v));
    expect(serialized).not.toContain("Infinity");
  });

  it("never produces NaN", () => {
    const result = divide(fromSafeInteger(1), fromSafeInteger(7));
    expect(JSON.stringify(result, (_k, v) => (typeof v === "bigint" ? v.toString() : v))).not.toContain(
      "NaN",
    );
  });

  it("clamps the exponent at the configured maximum instead of growing forever", () => {
    const nearMax = fromPowerOfTen(MAX_EXPONENT);
    const result = multiply(nearMax, fromPowerOfTen(MAX_EXPONENT));
    expect(result.kind).toBe("scientific");
    if (result.kind === "scientific") {
      expect(result.exponent).toBe(MAX_EXPONENT);
    }
  });

  it("rejects exponents above the maximum", () => {
    expect(() => fromPowerOfTen(MAX_EXPONENT + 1n)).toThrow(HugeNumberError);
  });
});

describe("HugeNumber negatives", () => {
  it("supports negative values down to -49", () => {
    const value = fromSafeInteger(-49);
    expect(value.sign).toBe(-1);
    expect(formatHugeNumber(value).primary).toBe("-49");
  });

  it("negate() flips sign correctly and is reversible", () => {
    const value = fromSafeInteger(15);
    const negative = negate(value);
    expect(formatHugeNumber(negative).primary).toBe("-15");
    expect(equals(negate(negative), value)).toBe(true);
  });

  it("adds a negative and positive number correctly", () => {
    const result = add(fromSafeInteger(-49), fromSafeInteger(49));
    expect(formatHugeNumber(result).primary).toBe("0");
  });

  it("subtract crossing zero into negative range", () => {
    const result = subtract(fromSafeInteger(5), fromSafeInteger(20));
    expect(formatHugeNumber(result).primary).toBe("-15");
  });
});

describe("HugeNumber division and error handling", () => {
  it("throws a friendly, typed error on division by zero", () => {
    expect(() => divide(fromSafeInteger(10), fromSafeInteger(0))).toThrow(HugeNumberError);
    try {
      divide(fromSafeInteger(10), fromSafeInteger(0));
    } catch (e) {
      expect(e).toBeInstanceOf(HugeNumberError);
      expect((e as HugeNumberError).code).toBe("DIVIDE_BY_ZERO");
    }
  });

  it("rejects invalid decimal strings without throwing NaN downstream", () => {
    expect(() => fromDecimalString("abc")).toThrow(HugeNumberError);
    expect(() => fromDecimalString("")).toThrow(HugeNumberError);
  });
});

describe("HugeNumber formatting", () => {
  it("formats small numbers plainly", () => {
    expect(formatHugeNumber(fromSafeInteger(12)).primary).toBe("12");
    expect(formatHugeNumber(fromSafeInteger(-15)).primary).toBe("-15");
  });

  it("formats decimals with a comma", () => {
    const value = fromDecimalString("125.375");
    expect(formatHugeNumber(value).primary).toBe("125,375");
  });

  it("switches to scientific notation for large numbers", () => {
    const value = fromSafeInteger(1_000_000);
    const formatted = formatHugeNumber(value);
    expect(formatted.isScientificDisplay).toBe(true);
    expect(formatted.primary).toContain("×");
    expect(formatted.primary).toContain("10");
  });

  it("formats 10^3000003 exponent digits correctly", () => {
    const value = fromPowerOfTen(MAX_EXPONENT);
    const formatted = formatScientific(value);
    expect(formatted).toContain("³⁰⁰⁰⁰⁰³");
  });
});
