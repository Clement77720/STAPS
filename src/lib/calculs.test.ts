/**
 * Tests unitaires des formules de calculs.ts (Vitest).
 * Lancer : npm test
 */
import { describe, expect, it } from "vitest";
import {
  besoinCaloriqueJournalier,
  besoinCaloriqueRetenu,
  calculerAge,
  calculerIMC,
  categorieIMC,
  metabolismeDeBase,
  objectifHydratation,
  syntheseProfil,
} from "./calculs";

describe("calculerAge", () => {
  const today = new Date(2026, 10, 19); // 19 novembre 2026 (mois 0-indexé)

  it("compte l'année si l'anniversaire est passé", () => {
    expect(calculerAge("2005-03-10", today)).toBe(21);
  });

  it("ne compte pas l'année si l'anniversaire n'est pas encore passé", () => {
    expect(calculerAge("2005-12-01", today)).toBe(20);
    expect(calculerAge("2005-11-20", today)).toBe(20);
  });

  it("compte l'année le jour même de l'anniversaire", () => {
    expect(calculerAge("2005-11-19", today)).toBe(21);
  });
});

describe("calculerIMC", () => {
  it("applique poids / taille² (m) arrondi à 1 décimale", () => {
    expect(calculerIMC(70, 175)).toBe(22.9);
    expect(calculerIMC(90, 180)).toBe(27.8);
    expect(calculerIMC(50, 170)).toBe(17.3);
  });
});

describe("categorieIMC", () => {
  it.each([
    [17.3, "underweight"],
    [18.4, "underweight"],
    [18.5, "normal"],
    [24.9, "normal"],
    [25, "overweight"],
    [29.9, "overweight"],
    [30, "obesity_1"],
    [35, "obesity_2"],
    [40, "obesity_3"],
    [52, "obesity_3"],
  ])("IMC %s → %s (seuils OMS, borne basse incluse)", (imc, expected) => {
    expect(categorieIMC(imc).key).toBe(expected);
  });
});

describe("metabolismeDeBase (Mifflin-St Jeor)", () => {
  it("homme : 10 × poids + 6,25 × taille − 5 × âge + 5", () => {
    // 10×75 + 6,25×180 − 5×20 + 5 = 750 + 1125 − 100 + 5
    expect(metabolismeDeBase({ sex: "male", weightKg: 75, heightCm: 180, age: 20 })).toBe(1780);
  });

  it("femme : 10 × poids + 6,25 × taille − 5 × âge − 161", () => {
    // 10×60 + 6,25×165 − 5×21 − 161 = 600 + 1031,25 − 105 − 161 = 1365,25
    expect(metabolismeDeBase({ sex: "female", weightKg: 60, heightCm: 165, age: 21 })).toBe(1365);
  });
});

describe("besoinCaloriqueJournalier", () => {
  it("multiplie par le coefficient d'activité (maintien)", () => {
    // 1780 × 1,55 = 2759 → arrondi à la dizaine
    expect(besoinCaloriqueJournalier({ metabolismeDeBase: 1780, activityLevel: "moderate", goal: "maintain" })).toBe(2760);
  });

  it("applique −15 % pour une perte de poids", () => {
    // 1780 × 1,55 × 0,85 = 2345,15
    expect(besoinCaloriqueJournalier({ metabolismeDeBase: 1780, activityLevel: "moderate", goal: "lose" })).toBe(2350);
  });

  it("applique +10 % pour une prise de masse", () => {
    // 1365 × 1,725 × 1,1 = 2590,08
    expect(besoinCaloriqueJournalier({ metabolismeDeBase: 1365, activityLevel: "active", goal: "gain" })).toBe(2590);
  });

  it.each([
    ["sedentary", 1200],
    ["light", 1380],
    ["moderate", 1550],
    ["active", 1730],
    ["very_active", 1900],
  ] as const)("coefficient du niveau %s", (activityLevel, expected) => {
    expect(besoinCaloriqueJournalier({ metabolismeDeBase: 1000, activityLevel, goal: "maintain" })).toBe(expected);
  });
});

describe("besoinCaloriqueRetenu", () => {
  it("garde la valeur calculée sans saisie manuelle", () => {
    expect(besoinCaloriqueRetenu(2500, null)).toEqual({ kcal: 2500, calculated: 2500, isOverride: false });
  });

  it("utilise la valeur saisie à la main si elle existe", () => {
    expect(besoinCaloriqueRetenu(2500, 2800)).toEqual({ kcal: 2800, calculated: 2500, isOverride: true });
  });
});

describe("objectifHydratation", () => {
  it("35 ml × poids", () => {
    expect(objectifHydratation(70, false)).toBe(2450);
    expect(objectifHydratation(62.5, false)).toBe(2188); // 2187,5 arrondi
  });

  it("+500 ml les jours de sport", () => {
    expect(objectifHydratation(70, true)).toBe(2950);
  });
});

describe("syntheseProfil", () => {
  const complet = {
    birthDate: "2005-03-10",
    sex: "male" as const,
    heightCm: 180,
    weightKg: 75,
    activityLevel: "moderate" as const,
    goal: "maintain" as const,
    dailyKcalOverride: null,
  };

  it("retourne null si le profil est incomplet", () => {
    expect(syntheseProfil({ ...complet, weightKg: null })).toBeNull();
  });

  it("enchaîne âge → IMC → MB → besoin → hydratation", () => {
    const synthese = syntheseProfil(complet, new Date(2026, 10, 19));
    expect(synthese).toMatchObject({
      age: 21,
      imc: 23.1,
      imcCategorie: { key: "normal" },
      metabolismeDeBase: 1775, // 750 + 1125 − 105 + 5
      besoinCalorique: { kcal: 2750, isOverride: false }, // 1775 × 1,55 = 2751,25
      hydratationMl: 2625,
    });
  });
});
