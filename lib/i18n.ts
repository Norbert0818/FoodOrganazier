import type { IngredientCategory, Language, MealType } from "./types";

export const languageNames: Record<Language, string> = {
  ro: "Română",
  hu: "Magyar",
  en: "English"
};

export const ui = {
  ro: {
    appEyebrow: "PLANIFICATOR NUTRIȚIE",
    appTitle: "Meniu & Cumpărături",
    today: "Astăzi", plan: "Plan", recipes: "Rețete", shopping: "Listă", profile: "Profil",
    plannedToday: "kcal planificate pentru azi", protein: "Proteine", carbs: "Carbohidrați", fat: "Grăsimi", fiber: "Fibre", target: "țintă",
    whatEatToday: "CE MĂNÂNCI AZI", yourDay: "Ziua ta", edit: "Editează", perServing: "kcal / porție",
    yourWeek: "SĂPTĂMÂNA TA", weeklyPlan: "Plan săptămânal", generateList: "Generează lista", choose: "— Alege —",
    collection: "COLECȚIA TA", addRecipe: "+ Rețetă / link", searchRecipe: "Caută o rețetă...", importedLink: "Link",
    forPeople: "PENTRU {n} PERSOANE", shoppingTitle: "Cumpărături", regenerate: "Regenerează", toBuy: "De cumpărat", pantry: "Cămară",
    emptyList: "Lista este goală", emptyListText: "Generează lista din planul săptămânal. Produsele din cămară vor fi scăzute automat.", generateNow: "Generează acum",
    settings: "SETĂRI", people: "Număr persoane", calorieGoal: "Țintă calorii / zi", proteinGoal: "Țintă proteine (g)", fiberGoal: "Țintă fibre (g)", preferredStore: "Magazin preferat", preferredStoreSub: "Filtrează lista după magazin",
    language: "Limba aplicației", languageSub: "Interfața și rețetele folosesc această limbă", profileNote: "Poți importa rețete în română, maghiară sau engleză. Rețetele sunt afișate în limba selectată.",
    pantryNote: "Produsele de aici sunt scăzute automat când generezi lista săptămânală.", exampleRice: "Ex: Orez", add: "Adaugă", atHome: "Ce am acasă", pantryEmpty: "Nu ai adăugat încă produse.", delete: "Șterge",
    portions: "Porții", ingredients: "Ingrediente", preparation: "Preparare", addShopping: "Adaugă în lista de cumpărături", source: "Vezi sursa rețetei ↗", importedFromLink: "Importată din link",
    livePrices: "PREȚURI LIVE", checkOffers: "Verifică oferte", checking: "Se verifică...", refresh: "Actualizează", offersNote: "Sunt verificate ofertele publice curente. Nu reprezintă toate prețurile de raft, iar disponibilitatea poate varia între magazine.", noOffers: "Nu am găsit promoții publice potrivite pentru ingredientele acestei rețete.", forIngredient: "Pentru", promoPrice: "Preț promo", qtyRecipe: "lei pentru cantitatea din rețetă", estimatedMin: "Cost minim estimat din ofertele găsite", estimatedMinSub: "Se calculează doar ingredientele pentru care avem un preț unitar utilizabil.",
    newRecipe: "Rețetă nouă", manual: "Manual", fromLink: "Din link", importNote: "Pune linkul unei rețete în română, maghiară sau engleză. Aplicația preia rețeta, o traduce în limba selectată și recalculează valorile nutriționale.", recipeLink: "Link rețetă", importCalc: "Importă + traduce + calculează", importing: "Se importă...",
    name: "Nume", type: "Tip", caloriesServing: "Calorii / porție", imageOptional: "Imagine (opțional)", sourceOptional: "Link sursă (opțional)", ingredientFormat: "Un ingredient pe rând. Ex: 150 g Făină / 1 lingură Zahăr / 2 buc Ouă", preparationHint: "Un pas pe fiecare rând", saveRecipe: "Salvează rețeta",
    autoCalc: "CALCUL AUTOMAT", autoCalcTitle: "Kcal, proteine, carbohidrați, grăsimi și fibre", autoCalcText: "Ingredientele sunt normalizate automat pentru română, maghiară și engleză. Făină/Liszt/Flour fără altă specificație înseamnă făină albă de grâu, iar Zahăr/Cukor/Sugar înseamnă zahăr alb granulat.", calculateAuto: "Calculează automat", calculating: "Se calculează...", nutritionDone: "Valorile au fost calculate automat per porție din ingredientele introduse.", unmatchedPrefix: "Nu am identificat sigur", unmatchedSuffix: "Verifică manual doar aceste ingrediente.",
    translating: "Se traduc rețetele...", translationUnavailable: "Traducerea automată nu este configurată. Adaugă cheia DeepL în .env.local pentru traducerea rețetelor importate.",
    importFailed: "Importul a eșuat.", nutritionFailed: "Calculul nutrițional a eșuat.", offersFailed: "Nu am putut verifica ofertele.",
    allStores: "Oricare"
  },
  hu: {
    appEyebrow: "TÁPLÁLKOZÁSTERVEZŐ",
    appTitle: "Menü és bevásárlás",
    today: "Ma", plan: "Terv", recipes: "Receptek", shopping: "Lista", profile: "Profil",
    plannedToday: "kcal mára tervezve", protein: "Fehérje", carbs: "Szénhidrát", fat: "Zsír", fiber: "Rost", target: "cél",
    whatEatToday: "MAI ÉTKEZÉSEK", yourDay: "Mai nap", edit: "Szerkesztés", perServing: "kcal / adag",
    yourWeek: "HETI TERVED", weeklyPlan: "Heti étrend", generateList: "Bevásárlólista", choose: "— Válassz —",
    collection: "RECEPTJEID", addRecipe: "+ Recept / link", searchRecipe: "Recept keresése...", importedLink: "Link",
    forPeople: "{n} FŐRE", shoppingTitle: "Bevásárlás", regenerate: "Újraszámolás", toBuy: "Megvásárolandó", pantry: "Kamra",
    emptyList: "A lista üres", emptyListText: "Készíts bevásárlólistát a heti tervből. Az otthoni készlet automatikusan levonódik.", generateNow: "Lista készítése",
    settings: "BEÁLLÍTÁSOK", people: "Személyek száma", calorieGoal: "Napi kalóriacél", proteinGoal: "Fehérjecél (g)", fiberGoal: "Rostcél (g)", preferredStore: "Elsődleges üzlet", preferredStoreSub: "Bevásárlólista szűrése üzlet szerint",
    language: "Alkalmazás nyelve", languageSub: "A felület és a receptek ezen a nyelven jelennek meg", profileNote: "Román, magyar vagy angol recepteket is importálhatsz. A receptek mindig a kiválasztott nyelven jelennek meg.",
    pantryNote: "Az itt megadott termékeket a heti bevásárlólista automatikusan levonja.", exampleRice: "Pl.: Rizs", add: "Hozzáadás", atHome: "Ami otthon van", pantryEmpty: "Még nincs hozzáadott termék.", delete: "Törlés",
    portions: "Adag", ingredients: "Hozzávalók", preparation: "Elkészítés", addShopping: "Hozzáadás a bevásárlólistához", source: "Eredeti recept megnyitása ↗", importedFromLink: "Linkből importálva",
    livePrices: "AKTUÁLIS ÁRAK", checkOffers: "Akciók keresése", checking: "Ellenőrzés...", refresh: "Frissítés", offersNote: "A rendszer a nyilvánosan elérhető aktuális akciókat ellenőrzi. Ezek nem feltétlenül fedik le az összes polcárat, és üzletenként eltérhetnek.", noOffers: "Nem találtam megfelelő nyilvános akciót ehhez a recepthez.", forIngredient: "Hozzávaló", promoPrice: "Akciós ár", qtyRecipe: "lej a receptben szükséges mennyiségre", estimatedMin: "Becsült minimum az észlelt akciókból", estimatedMinSub: "Csak azok a hozzávalók számítanak bele, amelyekhez használható egységárat találtunk.",
    newRecipe: "Új recept", manual: "Kézi", fromLink: "Linkből", importNote: "Illessz be román, magyar vagy angol receptlinket. Az alkalmazás kiolvassa, a kiválasztott nyelvre fordítja, majd újraszámolja a tápértékeket.", recipeLink: "Recept linkje", importCalc: "Importálás + fordítás + számítás", importing: "Importálás...",
    name: "Név", type: "Típus", caloriesServing: "Kalória / adag", imageOptional: "Kép (opcionális)", sourceOptional: "Forráslink (opcionális)", ingredientFormat: "Egy hozzávaló soronként. Pl.: 150 g Liszt / 1 ek Cukor / 2 db Tojás", preparationHint: "Egy lépés soronként", saveRecipe: "Recept mentése",
    autoCalc: "AUTOMATIKUS SZÁMÍTÁS", autoCalcTitle: "Kcal, fehérje, szénhidrát, zsír és rost", autoCalcText: "A hozzávalókat román, magyar és angol nyelven is normalizáljuk. A Făină/Liszt/Flour külön jelző nélkül sima fehér búzalisztet, a Zahăr/Cukor/Sugar pedig sima fehér kristálycukrot jelent.", calculateAuto: "Automatikus számítás", calculating: "Számítás...", nutritionDone: "A tápértékeket adagonként automatikusan kiszámoltuk a megadott hozzávalókból.", unmatchedPrefix: "Nem sikerült biztosan azonosítani", unmatchedSuffix: "Csak ezeket ellenőrizd kézzel.",
    translating: "Receptek fordítása...", translationUnavailable: "Az automatikus fordítás nincs beállítva. Az importált receptek fordításához add meg a DeepL kulcsot a .env.local fájlban.",
    importFailed: "Az importálás nem sikerült.", nutritionFailed: "A tápérték-számítás nem sikerült.", offersFailed: "Az akciók ellenőrzése nem sikerült.",
    allStores: "Bármelyik"
  },
  en: {
    appEyebrow: "NUTRITION PLANNER",
    appTitle: "Meals & Shopping",
    today: "Today", plan: "Plan", recipes: "Recipes", shopping: "List", profile: "Profile",
    plannedToday: "kcal planned for today", protein: "Protein", carbs: "Carbs", fat: "Fat", fiber: "Fiber", target: "target",
    whatEatToday: "TODAY'S MEALS", yourDay: "Your day", edit: "Edit", perServing: "kcal / serving",
    yourWeek: "YOUR WEEK", weeklyPlan: "Weekly plan", generateList: "Generate list", choose: "— Choose —",
    collection: "YOUR COLLECTION", addRecipe: "+ Recipe / link", searchRecipe: "Search recipes...", importedLink: "Link",
    forPeople: "FOR {n} PEOPLE", shoppingTitle: "Shopping", regenerate: "Regenerate", toBuy: "To buy", pantry: "Pantry",
    emptyList: "The list is empty", emptyListText: "Generate the list from your weekly plan. Pantry items will be deducted automatically.", generateNow: "Generate now",
    settings: "SETTINGS", people: "Number of people", calorieGoal: "Daily calorie target", proteinGoal: "Protein target (g)", fiberGoal: "Fiber target (g)", preferredStore: "Preferred store", preferredStoreSub: "Filter the shopping list by store",
    language: "App language", languageSub: "The interface and recipes use this language", profileNote: "You can import Romanian, Hungarian or English recipes. Recipes are displayed in the selected language.",
    pantryNote: "Items here are deducted automatically when you generate the weekly shopping list.", exampleRice: "Ex: Rice", add: "Add", atHome: "What I have at home", pantryEmpty: "No pantry items yet.", delete: "Delete",
    portions: "Servings", ingredients: "Ingredients", preparation: "Method", addShopping: "Add to shopping list", source: "View recipe source ↗", importedFromLink: "Imported from link",
    livePrices: "LIVE PRICES", checkOffers: "Check offers", checking: "Checking...", refresh: "Refresh", offersNote: "The app checks current public offers. These do not represent every shelf price and availability can vary by store.", noOffers: "No matching public promotions were found for this recipe.", forIngredient: "For", promoPrice: "Promo price", qtyRecipe: "lei for the recipe quantity", estimatedMin: "Estimated minimum from found offers", estimatedMinSub: "Only ingredients with a usable unit price are included.",
    newRecipe: "New recipe", manual: "Manual", fromLink: "From link", importNote: "Paste a Romanian, Hungarian or English recipe link. The app extracts it, translates it into your selected language and recalculates nutrition.", recipeLink: "Recipe link", importCalc: "Import + translate + calculate", importing: "Importing...",
    name: "Name", type: "Type", caloriesServing: "Calories / serving", imageOptional: "Image (optional)", sourceOptional: "Source link (optional)", ingredientFormat: "One ingredient per line. Ex: 150 g Flour / 1 tbsp Sugar / 2 pcs Eggs", preparationHint: "One step per line", saveRecipe: "Save recipe",
    autoCalc: "AUTOMATIC CALCULATION", autoCalcTitle: "Kcal, protein, carbs, fat and fiber", autoCalcText: "Ingredients are normalized across Romanian, Hungarian and English. Făină/Liszt/Flour with no qualifier means regular white wheat flour, while Zahăr/Cukor/Sugar means regular white granulated sugar.", calculateAuto: "Calculate automatically", calculating: "Calculating...", nutritionDone: "Nutrition was calculated automatically per serving from the entered ingredients.", unmatchedPrefix: "Could not identify with confidence", unmatchedSuffix: "Only check these ingredients manually.",
    translating: "Translating recipes...", translationUnavailable: "Automatic translation is not configured. Add a DeepL key to .env.local to translate imported recipes.",
    importFailed: "Import failed.", nutritionFailed: "Nutrition calculation failed.", offersFailed: "Could not check offers.",
    allStores: "Any"
  }
} as const;

export const dayLabels: Record<Language, string[]> = {
  ro: ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"],
  hu: ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
};

export const mealLabels: Record<MealType, Record<Language, string>> = {
  "Mic dejun": { ro: "Mic dejun", hu: "Reggeli", en: "Breakfast" },
  "Prânz": { ro: "Prânz", hu: "Ebéd", en: "Lunch" },
  "Cină": { ro: "Cină", hu: "Vacsora", en: "Dinner" },
  "Gustare": { ro: "Gustare", hu: "Uzsonna", en: "Snack" }
};

export const categoryLabels: Record<IngredientCategory, Record<Language, string>> = {
  Carne: { ro: "Carne", hu: "Hús és hal", en: "Meat & fish" },
  Legume: { ro: "Legume", hu: "Zöldségek", en: "Vegetables" },
  Lactate: { ro: "Lactate", hu: "Tejtermékek", en: "Dairy" },
  Fructe: { ro: "Fructe", hu: "Gyümölcsök", en: "Fruit" },
  "Produse uscate": { ro: "Produse uscate", hu: "Szárazáru", en: "Dry goods" },
  Altele: { ro: "Altele", hu: "Egyéb", en: "Other" }
};

export function formatTemplate(value: string, params: Record<string, string | number>) {
  return value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

export function unitLabel(unit: string, language: Language, quantity?: number) {
  const u = canonicalUnit(unit);
  const singular = typeof quantity === "number" && quantity > 0 && quantity <= 1;
  const labels: Record<string, Record<Language, string | [string, string]>> = {
    g: { ro: "g", hu: "g", en: "g" },
    kg: { ro: "kg", hu: "kg", en: "kg" },
    ml: { ro: "ml", hu: "ml", en: "ml" },
    L: { ro: "L", hu: "L", en: "L" },
    oz: { ro: "oz", hu: "oz", en: "oz" },
    lb: { ro: "lb", hu: "lb", en: "lb" },
    pcs: { ro: "buc", hu: "db", en: "pcs" },
    tbsp: { ro: ["lingură", "linguri"], hu: "ek", en: "tbsp" },
    tsp: { ro: ["linguriță", "lingurițe"], hu: "tk", en: "tsp" },
    slice: { ro: ["felie", "felii"], hu: "szelet", en: ["slice", "slices"] },
    cup: { ro: ["cană", "căni"], hu: "csésze", en: ["cup", "cups"] },
    pinch: { ro: ["praf", "prafuri"], hu: "csipet", en: ["pinch", "pinches"] },
    clove: { ro: ["cățel", "căței"], hu: "gerezd", en: ["clove", "cloves"] },
    bunch: { ro: ["legătură", "legături"], hu: "csokor", en: ["bunch", "bunches"] },
    can: { ro: ["conservă", "conserve"], hu: "konzerv", en: ["can", "cans"] },
    package: { ro: ["pachet", "pachete"], hu: "csomag", en: ["package", "packages"] },
    stalk: { ro: ["tijă", "tije"], hu: "szár", en: ["stalk", "stalks"] },
    sprig: { ro: ["crenguță", "crenguțe"], hu: "ág", en: ["sprig", "sprigs"] },
    handful: { ro: ["mână", "mâini"], hu: "marék", en: ["handful", "handfuls"] },
    unspecified: { ro: "", hu: "", en: "" }
  };
  const label = labels[u]?.[language];
  if (Array.isArray(label)) return singular ? label[0] : label[1];
  return label ?? unit;
}

export function canonicalUnit(unit: string) {
  const raw = unit.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\.$/, "");
  if (!raw || ["unspecified", "none", "fara", "nincs"].includes(raw)) return "unspecified";
  if (["g", "gr", "gram", "grame", "grams", "gramm"].includes(raw)) return "g";
  if (["kg", "kilogram", "kilograme", "kilograms"].includes(raw)) return "kg";
  if (["ml", "mililitru", "mililitri", "milliliter", "milliliters", "millilitre", "millilitres"].includes(raw)) return "ml";
  if (["l", "litru", "litri", "liter", "liters", "litre", "litres"].includes(raw)) return "L";
  if (["oz", "ounce", "ounces", "uncia", "uncii"].includes(raw)) return "oz";
  if (["lb", "lbs", "pound", "pounds", "livra", "livre"].includes(raw)) return "lb";
  if (["buc", "bucata", "bucati", "db", "darab", "piece", "pieces", "pcs", "pc"].includes(raw)) return "pcs";
  if (["lingura", "linguri", "evokanal", "ek", "tbsp", "tablespoon", "tablespoons", "tbs"].includes(raw)) return "tbsp";
  if (["lingurita", "lingurite", "teaskanal", "tk", "tsp", "teaspoon", "teaspoons"].includes(raw)) return "tsp";
  if (["felie", "felii", "szelet", "slice", "slices"].includes(raw)) return "slice";
  if (["cana", "cani", "csesze", "cup", "cups"].includes(raw)) return "cup";
  if (["praf", "prafuri", "csipet", "pinch", "pinches"].includes(raw)) return "pinch";
  if (["catel", "catei", "gerezd", "clove", "cloves"].includes(raw)) return "clove";
  if (["legatura", "legaturi", "csokor", "bunch", "bunches"].includes(raw)) return "bunch";
  if (["conserva", "conserve", "konzerv", "can", "cans", "tin", "tins"].includes(raw)) return "can";
  if (["pachet", "pachete", "csomag", "package", "packages", "pack", "packs", "pkt"].includes(raw)) return "package";
  if (["tija", "tije", "szar", "stalk", "stalks"].includes(raw)) return "stalk";
  if (["crenguta", "crengute", "ag", "sprig", "sprigs"].includes(raw)) return "sprig";
  if (["mana", "maini", "marek", "handful", "handfuls"].includes(raw)) return "handful";
  return unit;
}
