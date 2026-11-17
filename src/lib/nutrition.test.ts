import { describe, expect, it } from "vitest";

import { sumNutrition, type NutritionItem } from "./nutrition-schema";

describe("nutrition totals", () => {
  it("adds nutrients from every item on a multi-dish thali", () => {
    const items: NutritionItem[] = [
      {
        name: "Dal",
        serving: "1 bowl",
        calories: 165,
        proteinGrams: 9,
        carbsGrams: 22,
        fatGrams: 4,
        fiberGrams: 6,
        sugarGrams: 2,
        sodiumMilligrams: 320,
        confidence: 0.9,
      },
      {
        name: "Rice",
        serving: "1 cup",
        calories: 185,
        proteinGrams: 4,
        carbsGrams: 40,
        fatGrams: 0.4,
        fiberGrams: 1,
        sugarGrams: 0.1,
        sodiumMilligrams: 5,
        confidence: 0.95,
      },
    ];

    expect(sumNutrition(items)).toEqual({
      calories: 350,
      proteinGrams: 13,
      carbsGrams: 62,
      fatGrams: 4.4,
      fiberGrams: 7,
      sugarGrams: 2.1,
      sodiumMilligrams: 325,
    });
  });
});