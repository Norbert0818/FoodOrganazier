import { NextRequest, NextResponse } from "next/server";
import { romanianOfferName } from "@/lib/ingredients";

type StoreName = "Kaufland" | "Lidl";
type Offer = {
  store: StoreName;
  ingredient: string;
  productName: string;
  price: number | null;
  oldPrice: number | null;
  discount: number | null;
  unitPrice: number | null;
  unitBase: "kg" | "L" | "buc" | null;
  memberOnly: boolean;
  sourceUrl: string;
};

const SOURCES: Array<{ store: StoreName; url: string }> = [
  { store: "Kaufland", url: "https://www.kaufland.ro/oferte/prezentare-generala-oferte.html" },
  { store: "Lidl", url: "https://www.lidl.ro/c/lidl-plus-cupoane-saptamanale/" }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ingredients = Array.isArray(body?.ingredients)
      ? body.ingredients.map(String).filter(Boolean).slice(0, 30)
      : [];

    if (!ingredients.length) return NextResponse.json({ offers: [] });

    const pages = await Promise.all(SOURCES.map(async (source) => {
      try {
        const response = await fetch(source.url, {
          headers: { "user-agent": "Mozilla/5.0 (compatible; MeniuCumparaturi/1.0)" },
          cache: "no-store"
        });
        return { ...source, text: response.ok ? htmlToText(await response.text()) : "" };
      } catch {
        return { ...source, text: "" };
      }
    }));

    const initialTerms: string[] = ingredients.map(
      (ingredient: string) => romanianOfferName(ingredient)
    );
    const searchTerms = await translateUnknownTermsToRomanian(ingredients, initialTerms);

    const offers: Offer[] = [];
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      const romanianName = searchTerms[i] || initialTerms[i] || ingredient;
      for (const page of pages) {
        const offer = findOffer(page.text, romanianName, ingredient, page.store, page.url);
        if (offer) offers.push(offer);
      }
    }

    return NextResponse.json({
      offers,
      checkedAt: new Date().toISOString(),
      note: "Public offers identified on official retailer pages; availability and prices can vary by store."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not check offers." }, { status: 500 });
  }
}


async function translateUnknownTermsToRomanian(original: string[], aliased: string[]) {
  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey) return aliased;

  const needsTranslation = aliased.map((term, index) => normalize(term) === normalize(original[index]));
  const texts = original.filter((_, index) => needsTranslation[index]);
  if (!texts.length) return aliased;

  try {
    const endpoint = process.env.DEEPL_API_URL?.trim() || (apiKey.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texts, target_lang: "RO", preserve_formatting: true, context: "Grocery ingredient names for Romanian supermarket search." }),
      cache: "no-store"
    });
    if (!response.ok) return aliased;
    const data = await response.json() as { translations?: Array<{ text?: string }> };
    const translated = data.translations?.map((item) => item.text || "") ?? [];
    let cursor = 0;
    return aliased.map((term, index) => needsTranslation[index] ? (translated[cursor++] || term) : term);
  } catch {
    return aliased;
  }
}

function findOffer(text: string, searchIngredient: string, originalIngredient: string, store: StoreName, sourceUrl: string): Offer | null {
  if (!text) return null;
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const tokens = meaningfulTokens(searchIngredient);
  if (!tokens.length) return null;

  let bestIndex = -1;
  let bestScore = 0;
  for (let i = 0; i < lines.length; i++) {
    const normalizedLine = normalize(lines[i]);
    const score = tokens.filter((token) => normalizedLine.includes(token)).length / tokens.length;
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex < 0) return null;

  const window = lines.slice(Math.max(0, bestIndex - 4), Math.min(lines.length, bestIndex + 10)).join(" ");
  const prices = [...window.matchAll(/(\d{1,3}(?:[.,]\d{2}))\s*(?:lei|ron)/gi)].map((match) => Number(match[1].replace(",", ".")));
  const unit = extractUnitPrice(window);
  const discountMatch = window.match(/-(\d{1,2})\s*%/);
  const price = prices[0] ?? extractCompactPrice(window);
  if (price === null && unit.price === null && !discountMatch) return null;

  return {
    store,
    ingredient: originalIngredient,
    productName: lines[bestIndex].replace(/\s+/g, " ").slice(0, 180),
    price,
    oldPrice: prices[1] ?? null,
    discount: discountMatch ? Number(discountMatch[1]) : null,
    unitPrice: unit.price,
    unitBase: unit.base,
    memberOnly: /lidl plus|kaufland card|xtra/i.test(window),
    sourceUrl
  };
}

function extractUnitPrice(text: string): { price: number | null; base: "kg" | "L" | "buc" | null } {
  const patterns: Array<[RegExp, "kg" | "L" | "buc"]> = [
    [/(?:1\s*kg\s*[=:]\s*|=\s*1\s*kg\s*)(\d{1,3}(?:[.,]\d{2}))/i, "kg"],
    [/(?:1\s*l\s*[=:]\s*|=\s*1\s*l\s*)(\d{1,3}(?:[.,]\d{2}))/i, "L"],
    [/(?:1\s*buc\s*[=:]\s*|=\s*1\s*buc\s*)(\d{1,3}(?:[.,]\d{2}))/i, "buc"]
  ];
  for (const [pattern, base] of patterns) {
    const match = text.match(pattern);
    if (match) return { price: Number(match[1].replace(",", ".")), base };
  }
  return { price: null, base: null };
}

function extractCompactPrice(text: string) {
  const match = text.match(/(\d{1,3})\s*[,.]\s*(\d{2})\s*Lei/i);
  return match ? Number(`${match[1]}.${match[2]}`) : null;
}

function htmlToText(html: string) {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|p|div|li|section|article|h\d|span)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n");
}

function meaningfulTokens(value: string) {
  const stop = new Set(["de", "cu", "si", "și", "din", "pentru", "fara", "fără", "the", "with", "and", "for", "es", "és"]);
  return normalize(value).split(/\s+/).filter((token) => token.length >= 3 && !stop.has(token));
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}
