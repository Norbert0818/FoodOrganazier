import { NextRequest, NextResponse } from "next/server";
import type { Ingredient, Language, MealType, Recipe } from "@/lib/types";
import { parseIngredientLine } from "@/lib/ingredient-parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUrl = String(body?.url ?? "").trim();

    if (!rawUrl) return NextResponse.json({ error: "Missing recipe URL." }, { status: 400 });

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
    }

    const response = await fetch(url.toString(), {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; MealPlannerBot/1.0)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ro-RO,hu-HU,en;q=0.8"
      },
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ error: `The recipe page could not be read (${response.status}).` }, { status: 400 });
    }

    const html = await response.text();
    const parsed = extractRecipeFromHtml(html, url.toString());

    if (!parsed) {
      return NextResponse.json({ error: "No structured recipe was found on this page. Try another link or enter it manually." }, { status: 400 });
    }

    return NextResponse.json({ recipe: parsed });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recipe import failed." }, { status: 500 });
  }
}

function extractRecipeFromHtml(html: string, sourceUrl: string): Omit<Recipe, "id"> | null {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter(Boolean);

  const candidates: unknown[] = [];
  for (const script of scripts) {
    const cleaned = decodeEntities(script).trim();
    if (!cleaned) continue;
    try {
      flattenJsonLd(JSON.parse(cleaned), candidates);
    } catch {
      try {
        flattenJsonLd(JSON.parse(cleaned.replace(/\t|\r|\n/g, " ")), candidates);
      } catch {
        continue;
      }
    }
  }

  const recipeNode = candidates.find(isRecipeNode) as Record<string, unknown> | undefined;
  if (!recipeNode) return null;

  const ingredientsRaw = toStringArray(recipeNode.recipeIngredient);
  const instructionsRaw = parseInstructions(recipeNode.recipeInstructions);
  const nutritionNode = (recipeNode.nutrition ?? {}) as Record<string, unknown>;
  const sourceLanguage = detectPageLanguage(html);

  const name = firstNonEmptyString([
    asString(recipeNode.name),
    metaValue(html, "property", "og:title"),
    titleValue(html)
  ]) ?? "Imported recipe";

  const image = firstNonEmptyString([
    extractImage(recipeNode.image),
    metaValue(html, "property", "og:image"),
    metaValue(html, "name", "twitter:image")
  ]);

  const servings = parseNumber(asString(recipeNode.recipeYield)) || 1;
  const mealType = inferMealType(name, asString(recipeNode.description));
  const ingredients: Ingredient[] = ingredientsRaw.map((line, index) => parseIngredientLine(line, index));
  const instructions = instructionsRaw.length ? instructionsRaw : [fallbackInstruction(sourceLanguage)];

  return {
    name,
    mealType,
    servings,
    nutrition: {
      calories: parseNumber(asString(nutritionNode.calories)),
      protein: parseNumber(asString(nutritionNode.proteinContent)),
      carbs: parseNumber(asString(nutritionNode.carbohydrateContent)),
      fat: parseNumber(asString(nutritionNode.fatContent)),
      fiber: parseNumber(asString(nutritionNode.fiberContent))
    },
    ingredients,
    instructions,
    image: image ? absolutizeUrl(image, sourceUrl) : undefined,
    sourceUrl,
    imported: true,
    sourceLanguage
  };
}

function inferMealType(name: string, description?: string | null): MealType {
  const text = normalize(`${name} ${description ?? ""}`);
  if (/(mic dejun|reggeli|breakfast|pancake|clatite|palacsinta|ovaz|zab|toast|omlet|granola)/.test(text)) return "Mic dejun";
  if (/(gustare|uzsonna|snack|smoothie)/.test(text)) return "Gustare";
  if (/(cina|vacsora|dinner)/.test(text)) return "Cină";
  return "Prânz";
}

function detectPageLanguage(html: string): Language | "unknown" {
  const match = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  const lang = match?.[1]?.toLowerCase() ?? "";
  if (lang.startsWith("ro")) return "ro";
  if (lang.startsWith("hu")) return "hu";
  if (lang.startsWith("en")) return "en";
  return "unknown";
}

function fallbackInstruction(language: Language | "unknown") {
  if (language === "ro") return "Urmează pașii din pagina sursă.";
  if (language === "hu") return "Kövesd a forrásoldalon található elkészítési lépéseket.";
  return "Follow the method on the source page.";
}

function flattenJsonLd(node: unknown, out: unknown[]) {
  if (Array.isArray(node)) {
    for (const item of node) flattenJsonLd(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  out.push(node);
  const record = node as Record<string, unknown>;
  if (record["@graph"]) flattenJsonLd(record["@graph"], out);
}

function isRecipeNode(node: unknown) {
  if (!node || typeof node !== "object") return false;
  const typeValue = (node as Record<string, unknown>)["@type"];
  if (typeof typeValue === "string") return typeValue.toLowerCase().includes("recipe");
  return Array.isArray(typeValue) && typeValue.some((value) => String(value).toLowerCase().includes("recipe"));
}

function parseInstructions(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return splitInstructionText(value);
  if (Array.isArray(value)) {
    return value.flatMap((step) => {
      if (typeof step === "string") return splitInstructionText(step);
      if (!step || typeof step !== "object") return [];
      const record = step as Record<string, unknown>;
      if (Array.isArray(record.itemListElement)) return parseInstructions(record.itemListElement);
      const text = asString(record.text) || asString(record.name) || "";
      return text ? [text.trim()] : [];
    }).filter(Boolean);
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const text = asString(record.text) || asString(record.name) || "";
    return text ? [text] : [];
  }
  return [];
}

function splitInstructionText(value: string) {
  return value.split(/\r?\n/).map((step) => step.trim()).filter(Boolean);
}

function extractImage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = extractImage(item);
      if (candidate) return candidate;
    }
    return null;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return asString(record.url) || asString(record.contentUrl) || null;
  }
  return null;
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function parseNumber(value: string | null) {
  if (!value) return 0;
  const match = value.replace(/,/g, ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function metaValue(html: string, attrName: "property" | "name", attrValue: string) {
  const regex = new RegExp(`<meta[^>]*${attrName}=["']${escapeRegex(attrValue)}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
  return html.match(regex)?.[1]?.trim() ?? null;
}

function titleValue(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
}

function firstNonEmptyString(values: Array<string | null | undefined>) {
  return values.find((value) => !!value)?.trim() ?? null;
}

function absolutizeUrl(possibleUrl: string, baseUrl: string) {
  try { return new URL(possibleUrl, baseUrl).toString(); } catch { return possibleUrl; }
}

function decodeEntities(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
