import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("accepte les chemins internes de l'app", () => {
    expect(safeNextPath("/app/repas")).toBe("/app/repas");
    expect(safeNextPath("/app/repas/recettes/12")).toBe("/app/repas/recettes/12");
  });

  it("refuse les redirections externes ou hors /app", () => {
    for (const value of ["https://evil.com", "//evil.com", "/\\evil.com", "/login", "/app", "", null, 42]) {
      expect(safeNextPath(value)).toBeNull();
    }
  });
});
