import { describe, expect, it } from "vitest";
import { parseFrenchNumber } from "./number-input";

describe("parseFrenchNumber", () => {
  it("accepte la virgule et le point", () => {
    expect(parseFrenchNumber("72,5")).toBe(72.5);
    expect(parseFrenchNumber("72.5")).toBe(72.5);
    expect(parseFrenchNumber(" 2 450 ")).toBe(2450);
  });

  it("renvoie undefined pour un champ vide ou invalide", () => {
    expect(parseFrenchNumber("")).toBeUndefined();
    expect(parseFrenchNumber("abc")).toBeUndefined();
  });
});
