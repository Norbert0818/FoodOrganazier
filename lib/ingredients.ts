import type { Ingredient, IngredientCategory } from "./types";
import { canonicalUnit } from "./i18n";

type FoodAlias = {
  patterns: RegExp[];
  usda: string;
  ro: string;
  category?: IngredientCategory;
};

const FOOD_ALIASES: FoodAlias[] = [
  { patterns: [/f[ăa]in[ăa] de migdale/i, /mandulaliszt/i, /almond flour/i], usda: "almond flour", ro: "făină de migdale", category: "Produse uscate" },
  { patterns: [/f[ăa]in[ăa] integral[ăa]/i, /teljes ki[őo]rl[eé]s[űu] liszt/i, /whole wheat flour/i, /wholemeal flour/i], usda: "whole wheat flour", ro: "făină integrală", category: "Produse uscate" },
  { patterns: [/f[ăa]in[ăa] de ov[ăa]z/i, /zabliszt/i, /oat flour/i], usda: "oat flour", ro: "făină de ovăz", category: "Produse uscate" },
  { patterns: [/f[ăa]in[ăa] de cocos/i, /kokuszliszt/i, /coconut flour/i], usda: "coconut flour", ro: "făină de cocos", category: "Produse uscate" },
  { patterns: [/zah[ăa]r brun/i, /barna cukor/i, /brown sugar/i], usda: "sugar brown", ro: "zahăr brun", category: "Produse uscate" },
  { patterns: [/zah[ăa]r pudr[ăa]/i, /porcukor/i, /powdered sugar/i, /icing sugar/i], usda: "sugar powdered", ro: "zahăr pudră", category: "Produse uscate" },

  { patterns: [/^\s*f[ăa]in[ăa](?:\s+alb[ăa])?(?:\s*\([^)]*\))?\s*$/i, /^\s*liszt(?:\s*\([^)]*\))?\s*$/i, /^\s*b[uú]zaliszt(?:\s*\([^)]*\))?\s*$/i, /^\s*flour(?:\s*\([^)]*\))?\s*$/i, /^\s*wheat flour(?:\s*\([^)]*\))?\s*$/i, /^\s*all[- ]purpose flour(?:\s*\([^)]*\))?\s*$/i], usda: "wheat flour all-purpose enriched", ro: "făină albă de grâu", category: "Produse uscate" },
  { patterns: [/^\s*zah[ăa]r(?:\s*\([^)]*\))?\s*$/i, /^\s*cukor(?:\s*\([^)]*\))?\s*$/i, /^\s*sugar(?:\s*\([^)]*\))?\s*$/i, /zah[ăa]r\s*\(opțional/i, /zahar\s*\(optional/i], usda: "sugar granulated", ro: "zahăr alb granulat", category: "Produse uscate" },

  { patterns: [/piept de pui/i, /csirkemell/i, /chicken breast/i], usda: "chicken breast raw skinless boneless", ro: "piept de pui", category: "Carne" },
  { patterns: [/pulpe? de pui/i, /csirkecomb/i, /chicken thigh/i], usda: "chicken thigh raw", ro: "pulpă de pui", category: "Carne" },
  { patterns: [/carne de pui/i, /csirkeh[uú]s/i, /chicken meat/i], usda: "chicken raw", ro: "carne de pui", category: "Carne" },
  { patterns: [/carne de porc/i, /sert[eé]sh[uú]s/i, /pork/i], usda: "pork raw", ro: "carne de porc", category: "Carne" },
  { patterns: [/carne de vit[ăa]/i, /marhah[uú]s/i, /beef/i], usda: "beef raw", ro: "carne de vită", category: "Carne" },
  { patterns: [/somon/i, /lazac/i, /salmon/i], usda: "salmon raw", ro: "somon", category: "Carne" },
  { patterns: [/guanciale/i], usda: "pork cured guanciale", ro: "guanciale", category: "Carne" },
  { patterns: [/pancetta/i], usda: "pork cured pancetta", ro: "pancetta", category: "Carne" },
  { patterns: [/bacon/i, /slanina/i, /slănină/i, /szalonna/i], usda: "pork bacon cured", ro: "bacon", category: "Carne" },
  { patterns: [/ton/i, /tonhal/i, /tuna/i], usda: "tuna", ro: "ton", category: "Carne" },
  { patterns: [/\bg[ăa]lbenu[sș](?:uri)?\b/i, /\btoj[aá]ss[aá]rg[aá]ja\b/i, /\begg yolks?\b/i], usda: "egg yolk raw fresh", ro: "gălbenuș de ou", category: "Carne" },
  { patterns: [/\bou[ăa]?\b/i, /\btoj[aá]s(?:ok)?\b/i, /\beggs?\b/i], usda: "egg whole raw fresh", ro: "ouă", category: "Carne" },

  { patterns: [/lapte/i, /tej/i, /milk/i], usda: "milk whole 3.25% milkfat", ro: "lapte", category: "Lactate" },
  { patterns: [/iaurt grecesc/i, /g[oö]r[oö]g joghurt/i, /greek yogurt/i], usda: "greek yogurt plain", ro: "iaurt grecesc", category: "Lactate" },
  { patterns: [/iaurt/i, /joghurt/i, /yogurt/i], usda: "yogurt plain", ro: "iaurt", category: "Lactate" },
  { patterns: [/parmezan/i, /parmez[aá]n/i, /parmesan/i, /parmigiano reggiano/i, /pecorino romano/i], usda: "parmesan cheese", ro: "parmezan", category: "Lactate" },
  { patterns: [/mozzarella/i], usda: "mozzarella cheese", ro: "mozzarella", category: "Lactate" },
  { patterns: [/unt\b/i, /vaj\b/i, /butter/i], usda: "butter salted", ro: "unt", category: "Lactate" },
  { patterns: [/sm[âa]nt[âa]n[ăa]/i, /tejf[oö]l/i, /sour cream/i], usda: "sour cream", ro: "smântână", category: "Lactate" },

  { patterns: [/ulei de m[ăa]sline/i, /ol[ií]vaolaj/i, /olive oil/i], usda: "olive oil", ro: "ulei de măsline", category: "Altele" },
  { patterns: [/ulei/i, /olaj/i, /vegetable oil/i, /cooking oil/i], usda: "vegetable oil", ro: "ulei vegetal", category: "Altele" },
  { patterns: [/esen[țt][ăa] de vanilie/i, /van[ií]lia kivonat/i, /vanilla extract/i], usda: "vanilla extract", ro: "esență de vanilie", category: "Altele" },
  { patterns: [/piper negru/i, /fekete bors/i, /black pepper/i], usda: "spices pepper black", ro: "piper negru", category: "Altele" },
  { patterns: [/sare/i, /s[oó]\b/i, /salt/i], usda: "salt table", ro: "sare", category: "Altele" },

  { patterns: [/orez/i, /rizs/i, /rice/i], usda: "rice white long-grain dry uncooked", ro: "orez", category: "Produse uscate" },
  { patterns: [/ap[ăa] de la paste/i, /paste f[oő]z[oő]v[ií]z/i, /pasta cooking water/i], usda: "water tap drinking", ro: "apă de la paste", category: "Altele" },
  { patterns: [/spaghetti/i], usda: "spaghetti dry enriched", ro: "spaghete", category: "Produse uscate" },
  { patterns: [/paste/i, /t[eé]szta/i, /pasta/i], usda: "pasta dry enriched", ro: "paste", category: "Produse uscate" },
  { patterns: [/fulgi de ov[ăa]z/i, /zabpehely/i, /rolled oats/i, /oat flakes/i], usda: "oats rolled dry", ro: "fulgi de ovăz", category: "Produse uscate" },
  { patterns: [/ov[ăa]z/i, /zab/i, /oats?/i], usda: "oats dry", ro: "ovăz", category: "Produse uscate" },
  { patterns: [/p[âa]ine integral[ăa]/i, /teljes ki[őo]rl[eé]s[űu] keny[eé]r/i, /whole wheat bread/i], usda: "whole wheat bread", ro: "pâine integrală", category: "Produse uscate" },
  { patterns: [/p[âa]ine/i, /keny[eé]r/i, /bread/i], usda: "white bread", ro: "pâine", category: "Produse uscate" },
  { patterns: [/n[ăa]ut/i, /csicseribors[oó]/i, /chickpeas?/i], usda: "chickpeas cooked", ro: "năut", category: "Produse uscate" },
  { patterns: [/linte/i, /lencse/i, /lentils?/i], usda: "lentils cooked", ro: "linte", category: "Produse uscate" },

  { patterns: [/ro[sș]ii/i, /paradicsom/i, /tomatoes?/i], usda: "tomatoes raw", ro: "roșii", category: "Legume" },
  { patterns: [/ardei/i, /paprika/i, /bell pepper/i, /sweet pepper/i], usda: "sweet red pepper raw", ro: "ardei", category: "Legume" },
  { patterns: [/ceap[ăa]/i, /hagyma/i, /onion/i], usda: "onion raw", ro: "ceapă", category: "Legume" },
  { patterns: [/castravete/i, /uborka/i, /cucumber/i], usda: "cucumber raw", ro: "castravete", category: "Legume" },
  { patterns: [/morcov/i, /s[aá]rgar[eé]pa/i, /carrots?/i], usda: "carrots raw", ro: "morcov", category: "Legume" },
  { patterns: [/cartof/i, /burgonya/i, /krumpli/i, /potatoes?/i], usda: "potatoes raw", ro: "cartofi", category: "Legume" },
  { patterns: [/broccoli/i], usda: "broccoli raw", ro: "broccoli", category: "Legume" },
  { patterns: [/spanac/i, /spen[oó]t/i, /spinach/i], usda: "spinach raw", ro: "spanac", category: "Legume" },
  { patterns: [/ciuperci/i, /gomba/i, /mushrooms?/i], usda: "mushrooms raw", ro: "ciuperci", category: "Legume" },
  { patterns: [/usturoi/i, /fokhagyma/i, /garlic/i], usda: "garlic raw", ro: "usturoi", category: "Legume" },

  { patterns: [/banan/i, /banana/i], usda: "banana raw", ro: "banană", category: "Fructe" },
  { patterns: [/avocado/i, /avok[aá]d[oó]/i], usda: "avocado raw", ro: "avocado", category: "Fructe" },
  { patterns: [/m[ăa]r\b/i, /alma\b/i, /apple/i], usda: "apple raw with skin", ro: "măr", category: "Fructe" },
  { patterns: [/portocal/i, /narancs/i, /orange/i], usda: "orange raw", ro: "portocală", category: "Fructe" },
  { patterns: [/l[ăa]m[âa]ie/i, /citrom/i, /lemon/i], usda: "lemon raw", ro: "lămâie", category: "Fructe" },
  { patterns: [/afine/i, /[aá]fonya/i, /blueberries?/i], usda: "blueberries raw", ro: "afine", category: "Fructe" },
  { patterns: [/zmeur/i, /m[aá]lna/i, /raspberries?/i], usda: "raspberries raw", ro: "zmeură", category: "Fructe" }
];

export function canonicalFoodQuery(name: string) {
  const clean = normalizeFoodName(name);
  const alias = findAlias(clean);
  return alias?.usda ?? stripRecipeNotes(clean);
}

export function romanianOfferName(name: string) {
  const clean = normalizeFoodName(name);
  const alias = findAlias(clean);
  return alias?.ro ?? stripRecipeNotes(clean);
}

export function inferIngredientCategory(name: string): IngredientCategory {
  const clean = normalizeFoodName(name);
  const alias = findAlias(clean);
  return alias?.category ?? "Altele";
}

function findAlias(clean: string) {
  const candidates = [clean, stripRecipeNotes(clean)];
  for (const candidate of candidates) {
    for (const alias of FOOD_ALIASES) {
      if (alias.patterns.some((pattern) => pattern.test(candidate))) return alias;
    }
  }
  return undefined;
}

function stripRecipeNotes(value: string) {
  return value
    .replace(/\([^)]*(?:optional|opțional|optional|note|megjegyz|pentru|for cooking|weight after|finely|sub)[^)]*\)/gi, " ")
    .replace(/,\s*(?:weight after|finely|roughly|optional|note\b).*$/i, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeFoodName(name: string) {
  return name
    .replace(/\s+/g, " ")
    .replace(/^[-–—•]+\s*/, "")
    .trim();
}

export function toGrams(ingredient: Ingredient) {
  const q = Number(ingredient.quantity) || 0;
  const unit = canonicalUnit(ingredient.unit);
  if (unit === "g") return q;
  if (unit === "kg") return q * 1000;
  if (unit === "oz") return q * 28.3495;
  if (unit === "lb") return q * 453.592;
  if (unit === "ml") return q * liquidDensity(ingredient.name);
  if (unit === "L") return q * 1000 * liquidDensity(ingredient.name);
  if (unit === "tbsp") return q * tablespoonGrams(ingredient.name);
  if (unit === "tsp") return q * tablespoonGrams(ingredient.name) / 3;
  if (unit === "cup") return q * cupGrams(ingredient.name);
  if (unit === "slice") return q * sliceGrams(ingredient.name);
  if (unit === "pinch") return q * 0.4;
  if (unit === "clove") return q * cloveGrams(ingredient.name);
  if (unit === "stalk") return q * stalkGrams(ingredient.name);
  if (unit === "sprig") return q * 2;
  if (unit === "handful") return q * 30;
  if (unit === "bunch") return q * 100;
  if (unit === "pcs") return q * pieceGrams(ingredient.name);
  if (unit === "unspecified" || unit === "can" || unit === "package") return 0;
  return q;
}

function liquidDensity(name: string) {
  const q = canonicalFoodQuery(name);
  if (/oil/.test(q)) return 0.91;
  if (/honey/.test(q)) return 1.42;
  return 1;
}

function tablespoonGrams(name: string) {
  const q = canonicalFoodQuery(name);
  if (/sugar granulated/.test(q)) return 12.5;
  if (/flour/.test(q)) return 8;
  if (/oil/.test(q)) return 13.5;
  if (/butter/.test(q)) return 14.2;
  if (/salt/.test(q)) return 18;
  if (/pepper black/.test(q)) return 6.9;
  return 15;
}

function cupGrams(name: string) {
  const q = canonicalFoodQuery(name);
  if (/flour/.test(q)) return 125;
  if (/sugar granulated/.test(q)) return 200;
  if (/rice/.test(q)) return 185;
  if (/oats/.test(q)) return 90;
  if (/milk/.test(q)) return 245;
  return 240;
}

function sliceGrams(name: string) {
  const q = canonicalFoodQuery(name);
  if (/bread/.test(q)) return 30;
  if (/cheese/.test(q)) return 20;
  return 30;
}

function pieceGrams(name: string) {
  const q = canonicalFoodQuery(name);
  if (/egg yolk/.test(q)) return 17;
  if (/egg/.test(q)) return 50;
  if (/banana/.test(q)) return 118;
  if (/avocado/.test(q)) return 200;
  if (/apple/.test(q)) return 180;
  if (/orange/.test(q)) return 140;
  if (/onion/.test(q)) return 110;
  if (/pepper/.test(q)) return 150;
  if (/cucumber/.test(q)) return 300;
  if (/lemon/.test(q)) return 84;
  if (/potato/.test(q)) return 170;
  return 100;
}


function cloveGrams(name: string) {
  const q = canonicalFoodQuery(name);
  if (/garlic/.test(q)) return 3;
  return 5;
}

function stalkGrams(name: string) {
  const q = canonicalFoodQuery(name);
  if (/celery/.test(q)) return 40;
  if (/green onion|scallion/.test(q)) return 15;
  return 30;
}
