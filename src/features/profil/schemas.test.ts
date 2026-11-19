import { describe, expect, it } from "vitest";
import { calendarUrlSchema, physicalSchema, profileSchema } from "./schemas";

const valid = {
  birthDate: "2005-03-10",
  sex: "female",
  heightCm: 168,
  weightKg: 61.25,
  activityLevel: "moderate",
  goal: "maintain",
} as const;

describe("physicalSchema", () => {
  it("accepte un profil valide et arrondit le poids à 0,1 kg", () => {
    const result = physicalSchema.parse(valid);
    expect(result.weightKg).toBe(61.3);
  });

  it("refuse une taille non entière ou hors bornes", () => {
    expect(physicalSchema.safeParse({ ...valid, heightCm: 168.5 }).success).toBe(false);
    expect(physicalSchema.safeParse({ ...valid, heightCm: 80 }).success).toBe(false);
  });

  it("refuse une date de naissance absente ou improbable", () => {
    expect(physicalSchema.safeParse({ ...valid, birthDate: "" }).success).toBe(false);
    expect(physicalSchema.safeParse({ ...valid, birthDate: "2024-01-01" }).success).toBe(false);
  });

  it("refuse un champ manquant avec un message en français", () => {
    const result = physicalSchema.safeParse({ ...valid, heightCm: undefined });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Indique ta taille en cm.");
  });
});

describe("profileSchema", () => {
  it("rend le besoin calorique manuel facultatif", () => {
    expect(profileSchema.safeParse({ ...valid, firstName: "Léa" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...valid, firstName: "Léa", dailyKcalOverride: 2400 }).success).toBe(true);
    expect(profileSchema.safeParse({ ...valid, firstName: "Léa", dailyKcalOverride: 300 }).success).toBe(false);
  });
});

describe("calendarUrlSchema", () => {
  it("convertit webcal:// en https://", () => {
    expect(calendarUrlSchema.parse({ url: " webcal://ade.univ.fr/ical?id=1 " }).url).toBe("https://ade.univ.fr/ical?id=1");
  });

  it("refuse ce qui n'est pas une URL web", () => {
    expect(calendarUrlSchema.safeParse({ url: "pas une url" }).success).toBe(false);
    expect(calendarUrlSchema.safeParse({ url: "ftp://ade.univ.fr/x.ics" }).success).toBe(false);
  });
});
