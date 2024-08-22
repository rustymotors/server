import { describe, expect, it } from "vitest";
import {
    isZero,
    isUndefined,
    lessThan,
    lessThanOrEqual,
    greaterThan,
    greaterThanOrEqual,
    areBothZero,
    areBothUndefined,
    areBothSet,
    isOnlyOneSet,
} from "../src/utils/pureCompare";

describe("isZero", () => {
    it("returns true if the number is zero", () => {
        expect(isZero(0)).toBe(true);
    });

    it("returns false if the number is not zero", () => {
        expect(isZero(5)).toBe(false);
    });
});

describe("isUndefined", () => {
    it("returns true if the value is undefined", () => {
        expect(isUndefined(undefined)).toBe(true);
    });

    it("returns false if the value is not undefined", () => {
        expect(isUndefined(5)).toBe(false);
    });
});

describe("lessThan", () => {
    it("returns true if the first number is less than the second number", () => {
        expect(lessThan(2, 5)).toBe(true);
    });

    it("returns false if the first number is greater than or equal to the second number", () => {
        expect(lessThan(5, 2)).toBe(false);
        expect(lessThan(5, 5)).toBe(false);
    });
});

describe("lessThanOrEqual", () => {
    it("returns true if the first number is less than or equal to the second number", () => {
        expect(lessThanOrEqual(2, 5)).toBe(true);
        expect(lessThanOrEqual(5, 5)).toBe(true);
    });

    it("returns false if the first number is greater than the second number", () => {
        expect(lessThanOrEqual(5, 2)).toBe(false);
    });
});

describe("greaterThan", () => {
    it("returns true if the first number is greater than the second number", () => {
        expect(greaterThan(5, 2)).toBe(true);
    });

    it("returns false if the first number is less than or equal to the second number", () => {
        expect(greaterThan(2, 5)).toBe(false);
        expect(greaterThan(5, 5)).toBe(false);
    });
});

describe("greaterThanOrEqual", () => {
    it("returns true if the first number is greater than or equal to the second number", () => {
        expect(greaterThanOrEqual(5, 2)).toBe(true);
        expect(greaterThanOrEqual(5, 5)).toBe(true);
    });

    it("returns false if the first number is less than the second number", () => {
        expect(greaterThanOrEqual(2, 5)).toBe(false);
    });
});

describe("areBothZero", () => {
    it("returns true if both numbers are zero", () => {
        expect(areBothZero(0, 0)).toBe(true);
    });

    it("returns false if at least one of the numbers is not zero", () => {
        expect(areBothZero(0, 5)).toBe(false);
        expect(areBothZero(5, 0)).toBe(false);
        expect(areBothZero(5, 5)).toBe(false);
    });
});

describe("areBothUndefined", () => {
    it("returns true if both values are undefined", () => {
        expect(areBothUndefined(undefined, undefined)).toBe(true);
    });

    it("returns false if at least one of the values is not undefined", () => {
        expect(areBothUndefined(undefined, 5)).toBe(false);
        expect(areBothUndefined(5, undefined)).toBe(false);
        expect(areBothUndefined(5, 5)).toBe(false);
    });
});

describe("areBothSet", () => {
    it("returns true if both values are set", () => {
        expect(areBothSet(5, 10)).toBe(true);
    });

    it("returns false if at least one of the values is not set", () => {
        expect(areBothSet(undefined, 10)).toBe(false);
        expect(areBothSet(5, undefined)).toBe(false);
        expect(areBothSet(undefined, undefined)).toBe(false);
    });
});

describe("isOnlyOneSet", () => {
    it("returns true if only one of the values is set", () => {
        expect(isOnlyOneSet(5, undefined)).toBe(true);
        expect(isOnlyOneSet(undefined, 10)).toBe(true);
    });

    it("returns false if both values are set or both values are not set", () => {
        expect(isOnlyOneSet(5, 10)).toBe(false);
        expect(isOnlyOneSet(undefined, undefined)).toBe(false);
    });
});
