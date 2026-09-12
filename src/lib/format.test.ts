import { describe, expect, test } from "vitest";
import { formatDateIndian } from "@/lib/format";

describe("formatDateIndian", () => {
  test("formats a date as DD/MM/YYYY", () => {
    expect(formatDateIndian(new Date(2026, 0, 5))).toBe("05/01/2026");
  });

  test("pads single-digit day and month with a leading zero", () => {
    expect(formatDateIndian(new Date(2026, 8, 9))).toBe("09/09/2026");
  });

  test("does not pad the four-digit year", () => {
    expect(formatDateIndian(new Date(2026, 11, 25))).toBe("25/12/2026");
  });
});
