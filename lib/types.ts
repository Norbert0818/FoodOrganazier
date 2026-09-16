export type Language = "ro" | "hu" | "en";
export type Store = "Lidl" | "Kaufland" | "Penny" | "Oricare";
export type MealType = "Mic dejun" | "Prânz" | "Cină" | "Gustare";
export type IngredientCategory = "Carne" | "Legume" | "Lactate" | "Produse uscate" | "Fructe" | "Altele";

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  store?: Store;
  quantitySpecified?: boolean;
};

export type Nutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type RecipeTranslation = {
  name: string;
  ingredientNames: Record<string, string>;
  instructions: string[];
};

export type Recipe = {
  id: string;
  name: string;
  mealType: MealType;
  servings: number;
  nutrition: Nutrition;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
  sourceUrl?: string;
  imported?: boolean;
  sourceLanguage?: Language | "unknown";
  translations?: Partial<Record<Language, RecipeTranslation>>;
};

export type DayPlan = {
  day: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
};
