import { NextRequest, NextResponse } from "next/server";
import type { Ingredient } from "@/lib/types";
import { canonicalFoodQuery, toGrams } from "@/lib/ingredients";

type Nutrients = { calories: number; protein: number; carbs: number; fat: number; fiber: number };
type UsdaFood = {
  description?: string;
  dataType?: string;
  foodNutrients?: Array<{ nutrientName?: string; value?: number }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ingredients = (body?.ingredients ?? []) as Ingredient[];
    const servings = Math.max(1, Number(body?.servings) || 1);

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "No ingredients were provided for nutrition calculation." }, { status: 400 });
    }

    const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
    const results = await Promise.all(ingredients.map((ingredient) => calculateIngredient(ingredient, apiKey)));

    const total = results.reduce<Nutrients>((sum, item) => {
      sum.calories += item.nutrients.calories;
      sum.protein += item.nutrients.protein;
      sum.carbs += item.nutrients.carbs;
      sum.fat += item.nutrients.fat;
      sum.fiber += item.nutrients.fiber;
      return sum;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    return NextResponse.json({
      total: roundNutrients(total),
      perServing: roundNutrients(multiplyNutrients(total, 1 / servings)),
      unmatched: results.filter((result) => !result.matched).map((result) => result.ingredient),
      matches: results.map(({ ingredient, matched, matchedFood, grams, query }) => ({ ingredient, matched, matchedFood, grams, query })),
      source: "USDA FoodData Central"
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Nutrition calculation failed." }, { status: 500 });
  }
}

async function calculateIngredient(ingredient: Ingredient, apiKey: string) {
  const grams = toGrams(ingredient);
  const query = canonicalFoodQuery(ingredient.name);
  if (!grams || !query) return emptyResult(ingredient.name, grams, query);

  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&pageSize=8`,
    { cache: "no-store" }
  );

  if (!response.ok) return emptyResult(ingredient.name, grams, query);
  const data = await response.json() as { foods?: UsdaFood[] };
  const food = chooseFood(data.foods ?? [], query);
  if (!food) return emptyResult(ingredient.name, grams, query);

  return {
    ingredient: ingredient.name,
    matched: true,
    matchedFood: food.description ?? query,
    grams,
    query,
    nutrients: multiplyNutrients(nutrientsFromFood(food), grams / 100)
  };
}

function chooseFood(foods: UsdaFood[], query: string) {
  const preferredType = ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"];
  const queryTokens = normalize(query).split(" ").filter((token) => token.length > 2);

  return [...foods]
    .map((food) => {
      const desc = normalize(food.description ?? "");
      const tokenScore = queryTokens.length ? queryTokens.filter((token) => desc.includes(token)).length / queryTokens.length : 0;
      const typeIndex = preferredType.indexOf(food.dataType ?? "");
      const typeScore = typeIndex === -1 ? 0 : (preferredType.length - typeIndex) * 0.08;
      return { food, score: tokenScore + typeScore };
    })
    .sort((a, b) => b.score - a.score)[0]?.food;
}

function nutrientsFromFood(food: UsdaFood): Nutrients {
  const nutrients = food.foodNutrients ?? [];
  return {
    calories: getNutrient(nutrients, ["Energy"]),
    protein: getNutrient(nutrients, ["Protein"]),
    carbs: getNutrient(nutrients, ["Carbohydrate, by difference", "Carbohydrate"]),
    fat: getNutrient(nutrients, ["Total lipid (fat)", "Total fat"]),
    fiber: getNutrient(nutrients, ["Fiber, total dietary", "Dietary fiber"])
  };
}

function getNutrient(items: NonNullable<UsdaFood["foodNutrients"]>, names: string[]) {
  for (const name of names) {
    const item = items.find((entry) => entry.nutrientName?.toLowerCase() === name.toLowerCase());
    if (item && typeof item.value === "number") return item.value;
  }
  return 0;
}

function emptyResult(ingredient: string, grams: number, query: string) {
  return {
    ingredient,
    matched: false,
    matchedFood: null,
    grams,
    query,
    nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  };
}

function multiplyNutrients(nutrients: Nutrients, factor: number): Nutrients {
  return {
    calories: nutrients.calories * factor,
    protein: nutrients.protein * factor,
    carbs: nutrients.carbs * factor,
    fat: nutrients.fat * factor,
    fiber: nutrients.fiber * factor
  };
}

function roundNutrients(nutrients: Nutrients): Nutrients {
  return {
    calories: Math.round(nutrients.calories),
    protein: round1(nutrients.protein),
    carbs: round1(nutrients.carbs),
    fat: round1(nutrients.fat),
    fiber: round1(nutrients.fiber)
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
