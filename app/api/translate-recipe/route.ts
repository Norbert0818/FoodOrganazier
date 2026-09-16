import { NextRequest, NextResponse } from "next/server";
import type { Language, Recipe, RecipeTranslation } from "@/lib/types";

const DEEPL_LANG: Record<Language, string> = { ro: "RO", hu: "HU", en: "EN" };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipe = body?.recipe as Recipe | undefined;
    const targetLanguage = body?.targetLanguage as Language | undefined;

    if (!recipe || !targetLanguage || !["ro", "hu", "en"].includes(targetLanguage)) {
      return NextResponse.json({ error: "Invalid translation request." }, { status: 400 });
    }

    if (recipe.sourceLanguage === targetLanguage) {
      return NextResponse.json({
        translation: translationFromRecipe(recipe),
        detectedSourceLanguage: targetLanguage
      });
    }

    const existing = recipe.translations?.[targetLanguage];
    if (existing) return NextResponse.json({ translation: existing, detectedSourceLanguage: recipe.sourceLanguage ?? "unknown" });

    const apiKey = process.env.DEEPL_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        error: "DEEPL_API_KEY_MISSING",
        message: "Automatic recipe translation requires DEEPL_API_KEY in .env.local."
      }, { status: 503 });
    }

    const ingredientNames = recipe.ingredients.map((ingredient) => ingredient.name);
    const texts = [recipe.name, ...ingredientNames, ...recipe.instructions].filter((text) => text.trim().length > 0);
    const endpoint = process.env.DEEPL_API_URL?.trim() || (apiKey.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: texts,
        target_lang: DEEPL_LANG[targetLanguage],
        preserve_formatting: true,
        context: "Food recipe. Translate ingredient names naturally and precisely. Keep culinary meaning and do not add information."
      }),
      cache: "no-store"
    });

    const data = await response.json() as {
      message?: string;
      translations?: Array<{ text?: string; detected_source_language?: string }>;
    };

    if (!response.ok || !Array.isArray(data.translations)) {
      return NextResponse.json({ error: data.message || `Translation failed (${response.status}).` }, { status: 502 });
    }

    const translated = data.translations.map((item) => item.text ?? "");
    let cursor = 0;
    const translatedName = translated[cursor++] || recipe.name;
    const translatedIngredientNames = ingredientNames.map(() => translated[cursor++] || "");
    const translatedInstructions = recipe.instructions.map(() => translated[cursor++] || "");

    const ingredientMap: Record<string, string> = {};
    recipe.ingredients.forEach((ingredient, index) => {
      ingredientMap[ingredient.id] = translatedIngredientNames[index] || ingredient.name;
    });

    const translation: RecipeTranslation = {
      name: translatedName,
      ingredientNames: ingredientMap,
      instructions: translatedInstructions.map((step, index) => step || recipe.instructions[index])
    };

    const detected = data.translations[0]?.detected_source_language?.toLowerCase();
    const detectedSourceLanguage: Language | "unknown" = detected === "ro" || detected === "hu" || detected === "en" ? detected : "unknown";

    return NextResponse.json({ translation, detectedSourceLanguage });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Translation failed." }, { status: 500 });
  }
}

function translationFromRecipe(recipe: Recipe): RecipeTranslation {
  const ingredientNames: Record<string, string> = {};
  recipe.ingredients.forEach((ingredient) => { ingredientNames[ingredient.id] = ingredient.name; });
  return { name: recipe.name, ingredientNames, instructions: recipe.instructions };
}
