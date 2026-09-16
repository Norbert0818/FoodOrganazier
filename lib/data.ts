import { DayPlan, Recipe } from "./types";

export const recipes: Recipe[] = [
  {
    id: "pui-orez",
    name: "Pui cu orez și legume",
    mealType: "Prânz",
    servings: 4,
    nutrition: { calories: 610, protein: 48, carbs: 68, fat: 16, fiber: 8 },
    ingredients: [
      { id: "pui", name: "Piept de pui", quantity: 600, unit: "g", category: "Carne", store: "Kaufland" },
      { id: "orez", name: "Orez", quantity: 320, unit: "g", category: "Produse uscate", store: "Lidl" },
      { id: "ardei", name: "Ardei", quantity: 2, unit: "pcs", category: "Legume", store: "Penny" },
      { id: "ceapa", name: "Ceapă", quantity: 1, unit: "pcs", category: "Legume", store: "Oricare" },
      { id: "ulei", name: "Ulei de măsline", quantity: 20, unit: "ml", category: "Altele", store: "Oricare" }
    ],
    instructions: ["Taie puiul cubulețe.", "Fierbe orezul.", "Gătește puiul și legumele într-o tigaie.", "Amestecă și condimentează după gust."],
    sourceLanguage: "ro",
    translations: {
      ro: { name: "Pui cu orez și legume", ingredientNames: { pui: "Piept de pui", orez: "Orez", ardei: "Ardei", ceapa: "Ceapă", ulei: "Ulei de măsline" }, instructions: ["Taie puiul cubulețe.", "Fierbe orezul.", "Gătește puiul și legumele într-o tigaie.", "Amestecă și condimentează după gust."] },
      hu: { name: "Csirkés rizs zöldségekkel", ingredientNames: { pui: "Csirkemell", orez: "Rizs", ardei: "Paprika", ceapa: "Hagyma", ulei: "Olívaolaj" }, instructions: ["Vágd a csirkét kockákra.", "Főzd meg a rizst.", "Süsd meg a csirkét és a zöldségeket egy serpenyőben.", "Keverd össze, majd ízesítsd ízlés szerint."] },
      en: { name: "Chicken with rice and vegetables", ingredientNames: { pui: "Chicken breast", orez: "Rice", ardei: "Bell pepper", ceapa: "Onion", ulei: "Olive oil" }, instructions: ["Cut the chicken into cubes.", "Cook the rice.", "Cook the chicken and vegetables in a pan.", "Mix and season to taste."] }
    }
  },
  {
    id: "ovaz",
    name: "Terci de ovăz cu iaurt și fructe",
    mealType: "Mic dejun",
    servings: 1,
    nutrition: { calories: 430, protein: 22, carbs: 58, fat: 12, fiber: 10 },
    ingredients: [
      { id: "ovaz", name: "Fulgi de ovăz", quantity: 60, unit: "g", category: "Produse uscate", store: "Lidl" },
      { id: "iaurt", name: "Iaurt grecesc", quantity: 150, unit: "g", category: "Lactate", store: "Kaufland" },
      { id: "banana", name: "Banană", quantity: 1, unit: "pcs", category: "Fructe", store: "Penny" },
      { id: "fructe-padure", name: "Fructe de pădure", quantity: 80, unit: "g", category: "Fructe", store: "Lidl" }
    ],
    instructions: ["Fierbe ovăzul cu apă sau lapte.", "Adaugă iaurtul și fructele."],
    sourceLanguage: "ro",
    translations: {
      ro: { name: "Terci de ovăz cu iaurt și fructe", ingredientNames: { ovaz: "Fulgi de ovăz", iaurt: "Iaurt grecesc", banana: "Banană", "fructe-padure": "Fructe de pădure" }, instructions: ["Fierbe ovăzul cu apă sau lapte.", "Adaugă iaurtul și fructele."] },
      hu: { name: "Zabkása joghurttal és gyümölccsel", ingredientNames: { ovaz: "Zabpehely", iaurt: "Görög joghurt", banana: "Banán", "fructe-padure": "Erdei gyümölcsök" }, instructions: ["Főzd meg a zabpelyhet vízzel vagy tejjel.", "Add hozzá a joghurtot és a gyümölcsöket."] },
      en: { name: "Oatmeal with yogurt and fruit", ingredientNames: { ovaz: "Rolled oats", iaurt: "Greek yogurt", banana: "Banana", "fructe-padure": "Mixed berries" }, instructions: ["Cook the oats with water or milk.", "Add the yogurt and fruit."] }
    }
  },
  {
    id: "paste-pui",
    name: "Paste cu pui și sos de roșii",
    mealType: "Cină",
    servings: 4,
    nutrition: { calories: 685, protein: 46, carbs: 78, fat: 20, fiber: 9 },
    ingredients: [
      { id: "pui2", name: "Piept de pui", quantity: 600, unit: "g", category: "Carne", store: "Kaufland" },
      { id: "paste", name: "Paste", quantity: 400, unit: "g", category: "Produse uscate", store: "Lidl" },
      { id: "sos", name: "Sos de roșii", quantity: 600, unit: "g", category: "Legume", store: "Penny" },
      { id: "parmezan", name: "Parmezan", quantity: 80, unit: "g", category: "Lactate", store: "Kaufland" },
      { id: "ulei2", name: "Ulei de măsline", quantity: 40, unit: "ml", category: "Altele", store: "Oricare" }
    ],
    instructions: ["Fierbe pastele.", "Rumenește puiul.", "Adaugă sosul de roșii.", "Amestecă pastele și servește cu parmezan."],
    sourceLanguage: "ro",
    translations: {
      ro: { name: "Paste cu pui și sos de roșii", ingredientNames: { pui2: "Piept de pui", paste: "Paste", sos: "Sos de roșii", parmezan: "Parmezan", ulei2: "Ulei de măsline" }, instructions: ["Fierbe pastele.", "Rumenește puiul.", "Adaugă sosul de roșii.", "Amestecă pastele și servește cu parmezan."] },
      hu: { name: "Csirkés-paradicsomos tészta", ingredientNames: { pui2: "Csirkemell", paste: "Tészta", sos: "Paradicsomszósz", parmezan: "Parmezán", ulei2: "Olívaolaj" }, instructions: ["Főzd meg a tésztát.", "Pirítsd meg a csirkét.", "Add hozzá a paradicsomszószt.", "Keverd össze a tésztával, és parmezánnal tálald."] },
      en: { name: "Chicken pasta with tomato sauce", ingredientNames: { pui2: "Chicken breast", paste: "Pasta", sos: "Tomato sauce", parmezan: "Parmesan", ulei2: "Olive oil" }, instructions: ["Cook the pasta.", "Brown the chicken.", "Add the tomato sauce.", "Mix with the pasta and serve with Parmesan."] }
    }
  },
  {
    id: "oua-toast",
    name: "Ouă cu toast și avocado",
    mealType: "Mic dejun",
    servings: 1,
    nutrition: { calories: 470, protein: 25, carbs: 35, fat: 25, fiber: 8 },
    ingredients: [
      { id: "oua", name: "Ouă", quantity: 2, unit: "pcs", category: "Carne", store: "Penny" },
      { id: "paine", name: "Pâine integrală", quantity: 2, unit: "slice", category: "Produse uscate", store: "Lidl" },
      { id: "avocado", name: "Avocado", quantity: 0.5, unit: "pcs", category: "Fructe", store: "Kaufland" }
    ],
    instructions: ["Pregătește ouăle după preferință.", "Prăjește pâinea și adaugă avocado."],
    sourceLanguage: "ro",
    translations: {
      ro: { name: "Ouă cu toast și avocado", ingredientNames: { oua: "Ouă", paine: "Pâine integrală", avocado: "Avocado" }, instructions: ["Pregătește ouăle după preferință.", "Prăjește pâinea și adaugă avocado."] },
      hu: { name: "Tojás pirítóssal és avokádóval", ingredientNames: { oua: "Tojás", paine: "Teljes kiőrlésű kenyér", avocado: "Avokádó" }, instructions: ["Készítsd el a tojást ízlés szerint.", "Pirítsd meg a kenyeret, és add hozzá az avokádót."] },
      en: { name: "Eggs with toast and avocado", ingredientNames: { oua: "Eggs", paine: "Whole wheat bread", avocado: "Avocado" }, instructions: ["Cook the eggs as you prefer.", "Toast the bread and add the avocado."] }
    }
  },
  {
    id: "salata-ton",
    name: "Salată cu ton și năut",
    mealType: "Cină",
    servings: 2,
    nutrition: { calories: 510, protein: 38, carbs: 44, fat: 18, fiber: 12 },
    ingredients: [
      { id: "ton", name: "Ton conservă", quantity: 240, unit: "g", category: "Carne", store: "Kaufland" },
      { id: "naut", name: "Năut fiert", quantity: 300, unit: "g", category: "Produse uscate", store: "Lidl" },
      { id: "rosii", name: "Roșii", quantity: 300, unit: "g", category: "Legume", store: "Penny" },
      { id: "castravete", name: "Castravete", quantity: 1, unit: "pcs", category: "Legume", store: "Oricare" }
    ],
    instructions: ["Scurge tonul și năutul.", "Taie legumele.", "Amestecă totul și condimentează."],
    sourceLanguage: "ro",
    translations: {
      ro: { name: "Salată cu ton și năut", ingredientNames: { ton: "Ton conservă", naut: "Năut fiert", rosii: "Roșii", castravete: "Castravete" }, instructions: ["Scurge tonul și năutul.", "Taie legumele.", "Amestecă totul și condimentează."] },
      hu: { name: "Tonhalas-csicseriborsós saláta", ingredientNames: { ton: "Tonhalkonzerv", naut: "Főtt csicseriborsó", rosii: "Paradicsom", castravete: "Uborka" }, instructions: ["Csepegtesd le a tonhalat és a csicseriborsót.", "Vágd fel a zöldségeket.", "Keverd össze és ízesítsd."] },
      en: { name: "Tuna and chickpea salad", ingredientNames: { ton: "Canned tuna", naut: "Cooked chickpeas", rosii: "Tomatoes", castravete: "Cucumber" }, instructions: ["Drain the tuna and chickpeas.", "Chop the vegetables.", "Mix everything and season."] }
    }
  }
];

export const defaultPlan: DayPlan[] = [
  { day: "Luni", breakfast: "ovaz", lunch: "pui-orez", dinner: "paste-pui" },
  { day: "Marți", breakfast: "oua-toast", lunch: "pui-orez", dinner: "salata-ton" },
  { day: "Miercuri", breakfast: "ovaz", lunch: "paste-pui", dinner: "salata-ton" },
  { day: "Joi", breakfast: "oua-toast", lunch: "pui-orez", dinner: "paste-pui" },
  { day: "Vineri", breakfast: "ovaz", lunch: "paste-pui", dinner: "salata-ton" },
  { day: "Sâmbătă", breakfast: "oua-toast", lunch: "pui-orez", dinner: "paste-pui" },
  { day: "Duminică", breakfast: "ovaz", lunch: "pui-orez", dinner: "salata-ton" }
];
