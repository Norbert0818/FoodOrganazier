import type { Ingredient, Language, Store } from "./types";
import { canonicalUnit, unitLabel } from "./i18n";
import { inferIngredientCategory } from "./ingredients";

const FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875
};

const QTY_SOURCE = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|\d*\s*[¼½¾⅓⅔⅛⅜⅝⅞])`;

const UNIT_ALIASES = [
  "tablespoons", "tablespoon", "teaspoons", "teaspoon", "milliliters", "millilitres", "milliliter", "millilitre",
  "kilograms", "kilogram", "kilograme", "lingurițe", "lingurite", "linguriță", "lingurita", "linguri", "lingură", "lingura",
  "evőkanál", "evokanal", "teáskanál", "teaskanal", "bucăți", "bucati", "bucată", "bucata", "pachete", "pachet",
  "legături", "legaturi", "legătură", "legatura", "crenguțe", "crengute", "crenguță", "crenguta", "handfuls", "handful",
  "packages", "package", "bunches", "bunch", "pinches", "pinch", "slices", "slice", "pieces", "piece", "cloves", "clove",
  "ounces", "ounce", "pounds", "pound", "grams", "gram", "grame", "liters", "liter", "litres", "litre", "litri", "litru",
  "căni", "cani", "cană", "cana", "csésze", "csesze", "felii", "felie", "szelet", "prafuri", "praf", "csipet",
  "căței", "catei", "cățel", "catel", "gerezd", "conserve", "conservă", "conserva", "konzerv", "tije", "tijă", "tija",
  "stalks", "stalk", "sprigs", "sprig", "mâini", "maini", "mână", "mana", "marék", "marek", "darab",
  "tbsp", "tbs", "tsp", "cups", "cup", "pcs", "pc", "buc", "db", "pack", "packs", "pkt", "cans", "can", "tins", "tin",
  "kg", "ml", "oz", "lbs", "lb", "gr", "g", "l", "ek", "tk"
].sort((a, b) => b.length - a.length);

const UNIT_PATTERN = UNIT_ALIASES.map(escapeRegex).join("|");
const LEADING_UNIT_RE = new RegExp(`^(${UNIT_PATTERN})(?=\\.|\\s|/|$)`, "i");
const SECONDARY_MEASURE_RE = new RegExp(`^\\s*[/|]\\s*(${QTY_SOURCE})\\s*(${UNIT_PATTERN})(?=\\.|\\s|$)`, "i");

export function parseIngredientLine(line: string, index = 0): Ingredient {
  const normalized = sanitizeIngredientText(line);
  if (!normalized) return emptyIngredient(index);

  const structured = parseStructuredEditorLine(normalized, index);
  if (structured) return structured;

  const quantityMatch = normalized.match(new RegExp(`^(${QTY_SOURCE})\\s*(.*)$`, "i"));
  if (!quantityMatch) {
    return buildIngredient({
      index,
      name: normalized,
      quantity: 0,
      unit: "unspecified",
      quantitySpecified: false
    });
  }

  const quantity = parseFractionalNumber(quantityMatch[1]);
  let rest = quantityMatch[2].trim();
  let unit = "pcs";

  const leadingUnit = rest.match(LEADING_UNIT_RE);
  if (leadingUnit) {
    unit = canonicalUnit(leadingUnit[1]);
    rest = rest.slice(leadingUnit[0].length).trim();

    // Recipes often contain both metric and imperial amounts, e.g. "175g/6 oz guanciale".
    // We keep the first measurement and discard only the alternate measurement, not the ingredient text.
    const secondary = rest.match(SECONDARY_MEASURE_RE);
    if (secondary) rest = rest.slice(secondary[0].length).trim();

    rest = stripConnector(rest);
  } else {
    const garlicClove = rest.match(/^garlic\s+cloves?\b\s*(.*)$/i);
    if (garlicClove) {
      unit = "clove";
      rest = `garlic${garlicClove[1] ? ` ${garlicClove[1]}` : ""}`.trim();
    }
  }

  const name = cleanupIngredientName(rest || normalized);
  return buildIngredient({ index, name, quantity: quantity || 1, unit, quantitySpecified: true });
}

export function parseIngredientsText(text: string): Ingredient[] {
  return text
    .split(/\r?\n/)
    .map((line, index) => parseIngredientLine(line, index))
    .filter((ingredient) => ingredient.name.trim().length > 0);
}

export function formatIngredientEditorLine(ingredient: Ingredient, language: Language) {
  if (!hasSpecifiedQuantity(ingredient)) return ingredient.name;
  const quantity = prettyQuantity(ingredient.quantity);
  const label = unitLabel(ingredient.unit, language, ingredient.quantity);
  return [quantity, label, ingredient.name].filter(Boolean).join(" ");
}

export function hasSpecifiedQuantity(ingredient: Ingredient) {
  return ingredient.quantitySpecified !== false && Number(ingredient.quantity) > 0;
}

function parseStructuredEditorLine(line: string, index: number): Ingredient | null {
  const lastComma = line.lastIndexOf(",");
  if (lastComma < 0) return null;
  const secondLastComma = line.lastIndexOf(",", lastComma - 1);
  if (secondLastComma < 0) return null;

  const rawName = line.slice(0, secondLastComma).trim();
  const rawQuantity = line.slice(secondLastComma + 1, lastComma).trim();
  const rawUnit = line.slice(lastComma + 1).trim();
  const quantity = parseFractionalNumber(rawQuantity);
  const unit = canonicalUnit(rawUnit);

  if (!rawName || !isRecognizedCanonicalUnit(unit) || (!quantity && rawQuantity !== "0")) return null;
  return buildIngredient({ index, name: rawName, quantity, unit, quantitySpecified: quantity > 0 });
}

function buildIngredient({ index, name, quantity, unit, quantitySpecified }: { index: number; name: string; quantity: number; unit: string; quantitySpecified: boolean }): Ingredient {
  const cleanedName = cleanupIngredientName(name);
  return {
    id: `ingredient-${Date.now()}-${index}`,
    name: capitalize(cleanedName),
    quantity,
    unit: canonicalUnit(unit),
    category: inferIngredientCategory(cleanedName),
    store: "Oricare" as Store,
    quantitySpecified
  };
}

function emptyIngredient(index: number): Ingredient {
  return {
    id: `ingredient-${Date.now()}-${index}`,
    name: "",
    quantity: 0,
    unit: "unspecified",
    category: "Altele",
    store: "Oricare",
    quantitySpecified: false
  };
}

function sanitizeIngredientText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`]+/g, "")
    .replace(/^[\s•\-–—▢□☐☑✓✔]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanupIngredientName(value: string) {
  return value
    .replace(/^[-–—,:;]+\s*/, "")
    .replace(/\s+([,;:)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+/g, " ")
    .trim();
}

function stripConnector(value: string) {
  return value.replace(/^\s*(?:de|din|of)\s+/i, "").trim();
}

function parseFractionalNumber(input: string): number {
  let cleaned = input.trim().replace(/,/g, ".");
  let unicodeValue = 0;

  for (const [symbol, value] of Object.entries(FRACTIONS)) {
    if (cleaned.includes(symbol)) {
      unicodeValue += value;
      cleaned = cleaned.replace(symbol, " ").trim();
    }
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  let total = unicodeValue;
  for (const part of parts) {
    if (part.includes("/")) {
      const [a, b] = part.split("/").map(Number);
      if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) total += a / b;
    } else {
      const value = Number(part);
      if (Number.isFinite(value)) total += value;
    }
  }
  return total;
}

function isRecognizedCanonicalUnit(unit: string) {
  return ["g", "kg", "ml", "L", "oz", "lb", "pcs", "tbsp", "tsp", "slice", "cup", "pinch", "clove", "bunch", "can", "package", "stalk", "sprig", "handful", "unspecified"].includes(unit);
}

function prettyQuantity(value: number) {
  if (Number.isInteger(value)) return String(value);
  const fractions: Array<[number, string]> = [[0.25, "¼"], [0.5, "½"], [0.75, "¾"], [1 / 3, "⅓"], [2 / 3, "⅔"], [0.125, "⅛"]];
  const whole = Math.floor(value);
  const fraction = value - whole;
  const matched = fractions.find(([number]) => Math.abs(number - fraction) < 0.015);
  if (matched) return `${whole > 0 ? `${whole} ` : ""}${matched[1]}`;
  return String(Math.round(value * 100) / 100);
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
