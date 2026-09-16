"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultPlan, recipes as starterRecipes } from "@/lib/data";
import { categoryLabels, dayLabels, formatTemplate, languageNames, mealLabels, ui, unitLabel, canonicalUnit } from "@/lib/i18n";
import { formatIngredientEditorLine, hasSpecifiedQuantity, parseIngredientsText } from "@/lib/ingredient-parser";
import type { DayPlan, Ingredient, IngredientCategory, Language, MealType, Recipe, RecipeTranslation, Store } from "@/lib/types";

type Tab = "today" | "plan" | "recipes" | "shopping" | "profile";
type Profile = { people: number; calorieGoal: number; proteinGoal: number; fiberGoal: number; preferredStore: Store; language: Language };
type ShoppingItem = Ingredient & { checked: boolean };
type PantryItem = { name: string; quantity: number; unit: string };
type LiveOffer = { store: "Kaufland" | "Lidl"; ingredient: string; productName: string; price: number | null; oldPrice: number | null; discount: number | null; unitPrice: number | null; unitBase: "kg" | "L" | "buc" | null; memberOnly: boolean; sourceUrl: string };
type ImportPayload = Omit<Recipe, "id">;

type TranslationResponse = { translation?: RecipeTranslation; detectedSourceLanguage?: Language | "unknown"; error?: string; message?: string };

const mealKeys: { key: keyof Omit<DayPlan, "day">; label: MealType }[] = [
  { key: "breakfast", label: "Mic dejun" }, { key: "lunch", label: "Prânz" }, { key: "dinner", label: "Cină" }, { key: "snack", label: "Gustare" }
];
const categoryOrder: IngredientCategory[] = ["Carne", "Legume", "Lactate", "Fructe", "Produse uscate", "Altele"];
const defaultProfile: Profile = { people: 4, calorieGoal: 1900, proteinGoal: 130, fiberGoal: 30, preferredStore: "Oricare", language: "ro" };

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [recipes, setRecipes] = useState<Recipe[]>(starterRecipes);
  const [plan, setPlan] = useState<DayPlan[]>(defaultPlan);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([{ name: "Orez", quantity: 500, unit: "g" }, { name: "Ulei de măsline", quantity: 250, unit: "ml" }]);
  const [shoppingView, setShoppingView] = useState<"list" | "pantry">("list");
  const [search, setSearch] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationWarning, setTranslationWarning] = useState("");
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  const language = profile.language;
  const text = ui[language];

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  useEffect(() => {
    const raw = localStorage.getItem("meal-planner-data");
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.recipes) setRecipes(mergeStarterTranslations(saved.recipes));
        if (saved.plan) setPlan(saved.plan);
        if (saved.profile) setProfile({ ...defaultProfile, ...saved.profile, language: isLanguage(saved.profile.language) ? saved.profile.language : "ro" });
        if (saved.shopping) setShopping(saved.shopping);
        if (saved.pantry) setPantry(saved.pantry);
      } catch { /* ignore invalid local data */ }
    }
    hydrated.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem("meal-planner-data", JSON.stringify({ recipes, plan, profile, shopping, pantry }));
  }, [recipes, plan, profile, shopping, pantry]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const missing = recipes.filter((recipe) => !recipe.translations?.[language]);
    if (!missing.length) { setTranslationWarning(""); return; }

    const translateMissing = async () => {
      setIsTranslating(true);
      setTranslationWarning("");
      const updates = new Map<string, { translation: RecipeTranslation; detected?: Language | "unknown" }>();

      for (const recipe of missing) {
        try {
          const response = await fetch("/api/translate-recipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipe, targetLanguage: language }) });
          const data = await response.json() as TranslationResponse;
          if (!response.ok || !data.translation) {
            if (data.error === "DEEPL_API_KEY_MISSING") setTranslationWarning(text.translationUnavailable);
            continue;
          }
          updates.set(recipe.id, { translation: data.translation, detected: data.detectedSourceLanguage });
        } catch { /* keep source text */ }
      }

      if (!cancelled && updates.size) {
        setRecipes((current) => current.map((recipe) => {
          const update = updates.get(recipe.id);
          if (!update) return recipe;
          return { ...recipe, sourceLanguage: recipe.sourceLanguage ?? update.detected ?? "unknown", translations: { ...(recipe.translations ?? {}), [language]: update.translation } };
        }));
      }
      if (!cancelled) setIsTranslating(false);
    };

    void translateMissing();
    return () => { cancelled = true; };
    // Translation is intentionally triggered when the selected language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, ready]);

  const tabs = useMemo(() => [
    { id: "today" as Tab, label: text.today, icon: "⌂" }, { id: "plan" as Tab, label: text.plan, icon: "▦" }, { id: "recipes" as Tab, label: text.recipes, icon: "◫" }, { id: "shopping" as Tab, label: text.shopping, icon: "✓" }, { id: "profile" as Tab, label: text.profile, icon: "○" }
  ], [text]);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const today = plan[todayIndex] ?? plan[0];
  const todayRecipes = useMemo(() => mealKeys.map(({ key, label }) => ({ label, recipe: recipes.find((r) => r.id === today?.[key]) })).filter((item) => item.recipe), [recipes, today]);
  const todayNutrition = useMemo(() => todayRecipes.reduce((acc, item) => {
    if (!item.recipe) return acc;
    const n = item.recipe.nutrition;
    acc.calories += n.calories; acc.protein += n.protein; acc.carbs += n.carbs; acc.fat += n.fat; acc.fiber += n.fiber;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), [todayRecipes]);

  const filteredRecipes = useMemo(() => {
    const q = search.trim().toLocaleLowerCase(language === "hu" ? "hu" : language === "ro" ? "ro" : "en");
    return recipes.filter((recipe) => !q || localizeRecipe(recipe, language).name.toLocaleLowerCase().includes(q));
  }, [recipes, search, language]);

  const selectedRecipe = selectedRecipeId ? recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null : null;

  const generateShopping = () => {
    const aggregate = new Map<string, ShoppingItem>();
    for (const day of plan) {
      for (const { key } of mealKeys) {
        const recipe = recipes.find((r) => r.id === day[key]);
        if (!recipe) continue;
        const localized = localizeRecipe(recipe, language);
        const factor = profile.people / recipe.servings;
        for (const ing of localized.ingredients) {
          if (!hasSpecifiedQuantity(ing)) continue;
          const mapKey = `${normalizeName(ing.name)}-${canonicalUnit(ing.unit)}`;
          const existing = aggregate.get(mapKey);
          const qty = ing.quantity * factor;
          if (existing) existing.quantity += qty;
          else aggregate.set(mapKey, { ...ing, unit: canonicalUnit(ing.unit), quantity: qty, checked: false });
        }
      }
    }

    const adjusted = Array.from(aggregate.values()).map((item) => {
      const atHome = pantry.find((p) => normalizeName(p.name) === normalizeName(item.name) && canonicalUnit(p.unit) === canonicalUnit(item.unit));
      return { ...item, quantity: Math.max(0, item.quantity - (atHome?.quantity ?? 0)) };
    }).filter((item) => item.quantity > 0);
    adjusted.sort((a, b) => a.name.localeCompare(b.name, language));
    setShopping(adjusted);
    setShoppingView("list");
  };

  return (
    <main className="shell">
      <header className="topbar">
        <div><span className="eyebrow">{text.appEyebrow}</span><h1>{text.appTitle}</h1></div>
        <div className="top-actions">
          {isTranslating && <span className="translation-progress">{text.translating}</span>}
          <select className="language-select" aria-label={text.language} value={language} onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value as Language }))}>
            <option value="ro">RO</option><option value="hu">HU</option><option value="en">EN</option>
          </select>
        </div>
      </header>

      {translationWarning && <div className="page-warning">{translationWarning}</div>}

      <section className="content">
        {tab === "today" && <>
          <div className="hero-card">
            <div><span className="eyebrow">{dayLabels[language][todayIndex]}</span><h2>{todayNutrition.calories}</h2><div className="muted">{text.plannedToday}</div></div>
            <div><div className="muted">{todayNutrition.calories} / {profile.calorieGoal} kcal</div><Progress value={todayNutrition.calories} max={profile.calorieGoal} /></div>
          </div>
          <div className="macro-grid">
            <Macro label={text.protein} value={`${todayNutrition.protein} g`} sub={`${profile.proteinGoal} g ${text.target}`} />
            <Macro label={text.carbs} value={`${todayNutrition.carbs} g`} /><Macro label={text.fat} value={`${todayNutrition.fat} g`} />
            <Macro label={text.fiber} value={`${todayNutrition.fiber} g`} sub={`${profile.fiberGoal} g ${text.target}`} />
          </div>
          <div className="section-head"><div><span className="eyebrow">{text.whatEatToday}</span><h2>{text.yourDay}</h2></div><button className="text-btn" onClick={() => setTab("plan")}>{text.edit}</button></div>
          <div className="stack">{todayRecipes.map((item) => item.recipe && (() => {
            const localized = localizeRecipe(item.recipe, language);
            return <button className="meal-card" key={item.label} onClick={() => { setSelectedRecipeId(item.recipe!.id); setServings(profile.people); }}><div><span className="pill">{mealLabels[item.label][language]}</span><strong>{localized.name}</strong><small>{item.recipe.nutrition.calories} {text.perServing}</small></div><span className="chev">›</span></button>;
          })())}</div>
        </>}

        {tab === "plan" && <>
          <div className="section-head"><div><span className="eyebrow">{text.yourWeek}</span><h2>{text.weeklyPlan}</h2></div><button className="primary small" onClick={generateShopping}>{text.generateList}</button></div>
          <div className="week-list">{plan.map((day, index) => <div className="day-card" key={`${day.day}-${index}`}>
            <div className="day-title"><strong>{dayLabels[language][index]}</strong><span>{getDayCalories(day, recipes)} kcal</span></div>
            {mealKeys.slice(0, 3).map(({ key, label }) => <label className="meal-select" key={key}><span>{mealLabels[label][language]}</span><select value={day[key] ?? ""} onChange={(e) => { const next = [...plan]; next[index] = { ...next[index], [key]: e.target.value || undefined }; setPlan(next); }}><option value="">{text.choose}</option>{recipes.filter((recipe) => recipe.mealType === label || (label !== "Mic dejun" && label !== "Gustare")).map((recipe) => <option value={recipe.id} key={recipe.id}>{localizeRecipe(recipe, language).name}</option>)}</select></label>)}
          </div>)}</div>
        </>}

        {tab === "recipes" && <>
          <div className="section-head"><div><span className="eyebrow">{text.collection}</span><h2>{text.recipes}</h2></div><button className="primary small" onClick={() => setShowAddRecipe(true)}>{text.addRecipe}</button></div>
          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={text.searchRecipe} />
          <div className="recipe-grid">{filteredRecipes.map((recipe) => { const localized = localizeRecipe(recipe, language); return <button className="recipe-card" key={recipe.id} onClick={() => { setSelectedRecipeId(recipe.id); setServings(profile.people); }}><RecipeVisual recipe={recipe} /><div className="recipe-body"><div className="recipe-topline"><span className="pill">{mealLabels[recipe.mealType][language]}</span>{recipe.imported && <span className="tiny-badge">{text.importedLink}</span>}</div><strong>{localized.name}</strong><small>{recipe.nutrition.calories} {text.perServing}</small></div></button>; })}</div>
        </>}

        {tab === "shopping" && <>
          <div className="section-head"><div><span className="eyebrow">{formatTemplate(text.forPeople, { n: profile.people })}</span><h2>{text.shoppingTitle}</h2></div>{shoppingView === "list" && <button className="secondary small" onClick={generateShopping}>{text.regenerate}</button>}</div>
          <div className="segment"><button className={shoppingView === "list" ? "active" : ""} onClick={() => setShoppingView("list")}>{text.toBuy}</button><button className={shoppingView === "pantry" ? "active" : ""} onClick={() => setShoppingView("pantry")}>{text.pantry}</button></div>
          {shoppingView === "list" ? shopping.length === 0 ? <div className="empty"><div className="empty-icon">✓</div><h3>{text.emptyList}</h3><p>{text.emptyListText}</p><button className="primary" onClick={generateShopping}>{text.generateNow}</button></div> : <div className="shopping-wrap">{categoryOrder.map((category) => {
            const items = shopping.filter((item) => item.category === category && (profile.preferredStore === "Oricare" || item.store === profile.preferredStore || item.store === "Oricare")); if (!items.length) return null;
            return <div className="shopping-group" key={category}><h3>{categoryLabels[category][language]}</h3>{items.map((item) => <label className={`shopping-item ${item.checked ? "done" : ""}`} key={`${item.name}-${item.unit}`}><input type="checkbox" checked={item.checked} onChange={() => setShopping((current) => current.map((x) => x.name === item.name && x.unit === item.unit ? { ...x, checked: !x.checked } : x))} /><span className="shopping-name">{item.name}<small>{displayStore(item.store, language)}</small></span><strong>{prettyQty(item.quantity)} {unitLabel(item.unit, language, item.quantity)}</strong></label>)}</div>;
          })}</div> : <PantryEditor language={language} pantry={pantry} setPantry={setPantry} />}
        </>}

        {tab === "profile" && <>
          <div><span className="eyebrow">{text.settings}</span><h2>{text.profile}</h2></div>
          <div className="settings-card">
            <label className="setting-row"><span>{text.language}<small>{text.languageSub}</small></span><select value={language} onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value as Language }))}>{(["ro", "hu", "en"] as Language[]).map((lang) => <option value={lang} key={lang}>{languageNames[lang]}</option>)}</select></label>
            <SettingNumber label={text.people} value={profile.people} min={1} max={12} onChange={(v) => setProfile({ ...profile, people: v })} />
            <SettingNumber label={text.calorieGoal} value={profile.calorieGoal} min={800} max={5000} step={50} onChange={(v) => setProfile({ ...profile, calorieGoal: v })} />
            <SettingNumber label={text.proteinGoal} value={profile.proteinGoal} min={20} max={300} step={5} onChange={(v) => setProfile({ ...profile, proteinGoal: v })} />
            <SettingNumber label={text.fiberGoal} value={profile.fiberGoal} min={10} max={80} onChange={(v) => setProfile({ ...profile, fiberGoal: v })} />
            <label className="setting-row"><span>{text.preferredStore}<small>{text.preferredStoreSub}</small></span><select value={profile.preferredStore} onChange={(e) => setProfile({ ...profile, preferredStore: e.target.value as Store })}><option value="Oricare">{text.allStores}</option><option>Lidl</option><option>Kaufland</option><option>Penny</option></select></label>
          </div><div className="note">{text.profileNote}</div>
        </>}
      </section>

      <nav className="bottom-nav">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>

      {selectedRecipe && <RecipeModal recipe={selectedRecipe} language={language} servings={servings} setServings={setServings} onClose={() => setSelectedRecipeId(null)} onAdd={() => {
        const localized = localizeRecipe(selectedRecipe, language); const factor = servings / selectedRecipe.servings;
        const additions: ShoppingItem[] = localized.ingredients.filter(hasSpecifiedQuantity).map((ingredient) => ({ ...ingredient, quantity: ingredient.quantity * factor, checked: false }));
        setShopping((prev) => mergeShopping(prev, additions)); setSelectedRecipeId(null); setTab("shopping");
      }} />}

      {showAddRecipe && <AddRecipeModal language={language} onClose={() => setShowAddRecipe(false)} onSave={(recipe) => { setRecipes((current) => [...current, recipe]); setShowAddRecipe(false); }} />}
    </main>
  );
}

function RecipeVisual({ recipe }: { recipe: Recipe }) {
  if (recipe.image) return <div className="recipe-visual image">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={recipe.image} alt={recipe.name} /></div>;
  const symbol = recipe.mealType === "Mic dejun" ? "☀" : recipe.mealType === "Prânz" ? "◐" : recipe.mealType === "Gustare" ? "◌" : "◒";
  return <div className="recipe-visual">{symbol}</div>;
}

function PantryEditor({ language, pantry, setPantry }: { language: Language; pantry: PantryItem[]; setPantry: (items: PantryItem[]) => void }) {
  const text = ui[language]; const [name, setName] = useState(""); const [quantity, setQuantity] = useState(1); const [unit, setUnit] = useState("pcs");
  const add = () => { if (!name.trim()) return; const normalizedUnit = canonicalUnit(unit); const existing = pantry.find((p) => normalizeName(p.name) === normalizeName(name) && canonicalUnit(p.unit) === normalizedUnit); if (existing) setPantry(pantry.map((p) => p === existing ? { ...p, quantity: p.quantity + quantity } : p)); else setPantry([...pantry, { name: name.trim(), quantity, unit: normalizedUnit }]); setName(""); setQuantity(1); };
  const units = ["g", "kg", "ml", "L", "oz", "lb", "pcs", "slice", "tbsp", "tsp", "cup", "pinch", "clove", "bunch", "can", "package"];
  return <div className="pantry-wrap"><div className="note">{text.pantryNote}</div><div className="pantry-add"><input value={name} onChange={(e) => setName(e.target.value)} placeholder={text.exampleRice} /><input type="number" min="0" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} /><select value={unit} onChange={(e) => setUnit(e.target.value)}>{units.map((u) => <option value={u} key={u}>{unitLabel(u, language, 2)}</option>)}</select><button className="primary" onClick={add}>{text.add}</button></div><div className="shopping-group"><h3>{text.atHome}</h3>{pantry.length === 0 && <p className="muted-dark">{text.pantryEmpty}</p>}{pantry.map((item, idx) => <div className="pantry-item" key={`${item.name}-${idx}`}><span><strong>{item.name}</strong><small>{prettyQty(item.quantity)} {unitLabel(item.unit, language, item.quantity)}</small></span><button onClick={() => setPantry(pantry.filter((_, i) => i !== idx))}>{text.delete}</button></div>)}</div></div>;
}

function Macro({ label, value, sub }: { label: string; value: string; sub?: string }) { return <div className="macro-card"><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>; }
function Progress({ value, max }: { value: number; max: number }) { const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100)); return <div className="progress"><span style={{ width: `${pct}%` }} /></div>; }
function SettingNumber({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) { return <div className="setting-row"><span>{label}</span><div className="stepper"><button onClick={() => onChange(Math.max(min, value - step))}>−</button><strong>{value}</strong><button onClick={() => onChange(Math.min(max, value + step))}>+</button></div></div>; }

function RecipeModal({ recipe, language, servings, setServings, onClose, onAdd }: { recipe: Recipe; language: Language; servings: number; setServings: (n: number) => void; onClose: () => void; onAdd: () => void }) {
  const text = ui[language]; const localized = localizeRecipe(recipe, language); const factor = servings / recipe.servings;
  const [offers, setOffers] = useState<LiveOffer[]>([]); const [loadingOffers, setLoadingOffers] = useState(false); const [offerError, setOfferError] = useState(""); const [offersChecked, setOffersChecked] = useState(false);
  const checkOffers = async () => { setLoadingOffers(true); setOfferError(""); try { const response = await fetch("/api/offers/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ingredients: localized.ingredients.map((ingredient) => ingredient.name) }) }); const data = await response.json(); if (!response.ok) throw new Error(data?.error || text.offersFailed); setOffers(Array.isArray(data.offers) ? data.offers : []); setOffersChecked(true); } catch (error) { setOfferError(error instanceof Error ? error.message : text.offersFailed); } finally { setLoadingOffers(false); } };
  const cheapestCost = estimateCheapestRecipeCost(offers, localized.ingredients, factor);
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={onClose}>×</button>
    {recipe.image && <div className="modal-image-wrap">{/* eslint-disable-next-line @next/next/no-img-element */}<img className="modal-image" src={recipe.image} alt={localized.name} /></div>}
    <div className="recipe-topline"><span className="pill">{mealLabels[recipe.mealType][language]}</span>{recipe.imported && <span className="tiny-badge">{text.importedFromLink}</span>}</div><h2>{localized.name}</h2>
    {recipe.sourceUrl && <a className="source-link" href={recipe.sourceUrl} target="_blank" rel="noreferrer">{text.source}</a>}
    <div className="nutrition-line"><span>{Math.round(recipe.nutrition.calories * factor)} kcal</span><span>{Math.round(recipe.nutrition.protein * factor)} g {text.protein.toLowerCase()}</span><span>{Math.round(recipe.nutrition.carbs * factor)} g {text.carbs.toLowerCase()}</span><span>{Math.round(recipe.nutrition.fat * factor)} g {text.fat.toLowerCase()}</span><span>{Math.round(recipe.nutrition.fiber * factor)} g {text.fiber.toLowerCase()}</span></div>
    <div className="servings"><span>{text.portions}</span><div className="stepper"><button onClick={() => setServings(Math.max(1, servings - 1))}>−</button><strong>{servings}</strong><button onClick={() => setServings(servings + 1)}>+</button></div></div>
    <h3>{text.ingredients}</h3><div className="ingredient-list">{localized.ingredients.map((ingredient) => { const scaled = ingredient.quantity * factor; return <div key={ingredient.id}><span>{ingredient.name}</span>{hasSpecifiedQuantity(ingredient) ? <strong>{prettyQty(scaled)} {unitLabel(ingredient.unit, language, scaled)}</strong> : <strong className="ingredient-no-amount">—</strong>}</div>; })}</div>
    <div className="offers-panel"><div className="offers-head"><div><span className="eyebrow">{text.livePrices}</span><h3>Lidl + Kaufland</h3></div><button className="secondary small" disabled={loadingOffers} onClick={checkOffers}>{loadingOffers ? text.checking : offersChecked ? text.refresh : text.checkOffers}</button></div><p className="offers-note">{text.offersNote}</p>{offerError && <div className="error-box">{offerError}</div>}{offersChecked && offers.length === 0 && <div className="offer-empty">{text.noOffers}</div>}{offers.length > 0 && <div className="offer-list">{offers.map((offer, index) => { const ingredient = localized.ingredients.find((item) => normalizeName(item.name) === normalizeName(offer.ingredient)); const estimated = ingredient ? estimateOfferCost(offer, ingredient, factor) : null; return <a className="offer-card" href={offer.sourceUrl} target="_blank" rel="noreferrer" key={`${offer.store}-${offer.ingredient}-${index}`}><div className="offer-card-top"><span className={`store-badge ${offer.store.toLowerCase()}`}>{offer.store}</span>{offer.discount !== null && <strong>-{offer.discount}%</strong>}</div><strong>{offer.productName}</strong><small>{text.forIngredient}: {offer.ingredient}</small><div className="offer-price-row"><span>{offer.price !== null ? `${formatLei(offer.price)} lei` : text.promoPrice}</span>{offer.oldPrice !== null && <del>{formatLei(offer.oldPrice)} lei</del>}{offer.memberOnly && <em>{offer.store === "Lidl" ? "Lidl Plus" : "Kaufland Card"}</em>}</div>{estimated !== null && <small>~{formatLei(estimated)} {text.qtyRecipe}</small>}</a>; })}</div>}{cheapestCost !== null && <div className="estimated-total"><span>{text.estimatedMin}</span><strong>~{formatLei(cheapestCost)} lei</strong><small>{text.estimatedMinSub}</small></div>}</div>
    <h3>{text.preparation}</h3><ol className="instructions">{localized.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol><button className="primary full" onClick={onAdd}>{text.addShopping}</button>
  </div></div>;
}

function AddRecipeModal({ language, onClose, onSave }: { language: Language; onClose: () => void; onSave: (recipe: Recipe) => void }) {
  const text = ui[language];
  const [mode, setMode] = useState<"manual" | "link">("manual"); const [name, setName] = useState(""); const [mealType, setMealType] = useState<MealType>("Prânz"); const [servings, setServings] = useState(4);
  const [calories, setCalories] = useState(0); const [protein, setProtein] = useState(0); const [carbs, setCarbs] = useState(0); const [fat, setFat] = useState(0); const [fiber, setFiber] = useState(0);
  const [ingredientText, setIngredientText] = useState(defaultIngredientText(language)); const [instructionsText, setInstructionsText] = useState(defaultInstructionsText(language));
  const [linkUrl, setLinkUrl] = useState(""); const [imageUrl, setImageUrl] = useState(""); const [sourceUrl, setSourceUrl] = useState(""); const [isImported, setIsImported] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false); const [importError, setImportError] = useState(""); const [translationNote, setTranslationNote] = useState("");
  const [calculatingNutrition, setCalculatingNutrition] = useState(false); const [nutritionError, setNutritionError] = useState(""); const [nutritionStatus, setNutritionStatus] = useState(""); const [unmatchedNutrition, setUnmatchedNutrition] = useState<string[]>([]);

  const calculateNutrition = async (ingredients: Ingredient[], servingCount: number) => { const calculableIngredients = ingredients.filter(hasSpecifiedQuantity); if (!calculableIngredients.length) return; setCalculatingNutrition(true); setNutritionError(""); setNutritionStatus(""); try { const response = await fetch("/api/nutrition/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ingredients: calculableIngredients, servings: Math.max(1, servingCount) }) }); const data = await response.json(); if (!response.ok) throw new Error(data?.error || text.nutritionFailed); setCalories(Number(data.perServing?.calories) || 0); setProtein(Number(data.perServing?.protein) || 0); setCarbs(Number(data.perServing?.carbs) || 0); setFat(Number(data.perServing?.fat) || 0); setFiber(Number(data.perServing?.fiber) || 0); setUnmatchedNutrition(Array.isArray(data.unmatched) ? data.unmatched : []); setNutritionStatus(text.nutritionDone); } catch (error) { setNutritionError(error instanceof Error ? error.message : text.nutritionFailed); } finally { setCalculatingNutrition(false); } };
  const calculateFromCurrentText = async () => calculateNutrition(parseIngredientsText(ingredientText), servings);

  const importFromLink = async () => {
    if (!linkUrl.trim()) return; setLoadingImport(true); setImportError(""); setTranslationNote("");
    try {
      const response = await fetch("/api/import-recipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: linkUrl.trim() }) });
      const data = await response.json(); if (!response.ok) throw new Error(data?.error || text.importFailed);
      const imported: ImportPayload = data.recipe; const importedServings = imported.servings || 1;
      let displayRecipe: Recipe = { id: `preview-${Date.now()}`, ...imported };
      if (imported.sourceLanguage !== language) {
        const tr = await fetch("/api/translate-recipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipe: displayRecipe, targetLanguage: language }) });
        const trData = await tr.json() as TranslationResponse;
        if (tr.ok && trData.translation) displayRecipe = applyTranslation(displayRecipe, trData.translation);
        else if (trData.error === "DEEPL_API_KEY_MISSING") setTranslationNote(text.translationUnavailable);
      }
      setName(displayRecipe.name || ""); setMealType(displayRecipe.mealType || "Prânz"); setServings(importedServings);
      setIngredientText(displayRecipe.ingredients.map((ingredient) => formatIngredientEditorLine(ingredient, language)).join("\n"));
      setInstructionsText(displayRecipe.instructions.join("\n")); setImageUrl(imported.image || ""); setSourceUrl(imported.sourceUrl || linkUrl.trim()); setIsImported(true); setMode("manual");
      await calculateNutrition(imported.ingredients, importedServings);
    } catch (error) { setImportError(error instanceof Error ? error.message : text.importFailed); } finally { setLoadingImport(false); }
  };

  const save = () => {
    if (!name.trim()) return; const ingredients = parseIngredientsText(ingredientText); const instructions = instructionsText.split("\n").map((step) => step.trim()).filter(Boolean);
    const ingredientNames: Record<string, string> = {}; ingredients.forEach((ingredient) => { ingredientNames[ingredient.id] = ingredient.name; });
    const translation: RecipeTranslation = { name: name.trim(), ingredientNames, instructions: instructions.length ? instructions : [text.preparation] };
    onSave({ id: `recipe-${Date.now()}`, name: name.trim(), mealType, servings: Math.max(1, servings), nutrition: { calories, protein, carbs, fat, fiber }, ingredients, instructions: translation.instructions, image: imageUrl.trim() || undefined, sourceUrl: sourceUrl.trim() || undefined, imported: isImported, sourceLanguage: language, translations: { [language]: translation } });
  };

  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={onClose}>×</button><h2>{text.newRecipe}</h2>
    <div className="segment modal-segment"><button className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}>{text.manual}</button><button className={mode === "link" ? "active" : ""} onClick={() => setMode("link")}>{text.fromLink}</button></div>
    {mode === "link" && <div className="import-card"><div className="note">{text.importNote}</div><label className="import-label">{text.recipeLink}<input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." /></label>{importError && <div className="error-box">{importError}</div>}{translationNote && <div className="warning-box">{translationNote}</div>}<button className="primary full" disabled={loadingImport || calculatingNutrition} onClick={importFromLink}>{loadingImport ? text.importing : text.importCalc}</button></div>}
    {imageUrl && <div className="preview-image-wrap">{/* eslint-disable-next-line @next/next/no-img-element */}<img className="preview-image" src={imageUrl} alt={name || text.newRecipe} /></div>}
    <div className="form-grid"><label>{text.name}<input value={name} onChange={(e) => setName(e.target.value)} /></label><label>{text.type}<select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>{(["Mic dejun", "Prânz", "Cină", "Gustare"] as MealType[]).map((meal) => <option value={meal} key={meal}>{mealLabels[meal][language]}</option>)}</select></label><label>{text.portions}<input type="number" min="1" value={servings} onChange={(e) => setServings(Math.max(1, Number(e.target.value)))} /></label><label>{text.caloriesServing}<input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} /></label><label>{text.protein} (g)<input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} /></label><label>{text.carbs} (g)<input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} /></label><label>{text.fat} (g)<input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} /></label><label>{text.fiber} (g)<input type="number" value={fiber} onChange={(e) => setFiber(Number(e.target.value))} /></label><label className="span-2">{text.imageOptional}<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://.../image.jpg" /></label><label className="span-2">{text.sourceOptional}<input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." /></label><label className="span-2">{text.ingredients}<small>{text.ingredientFormat}</small><textarea rows={7} value={ingredientText} onChange={(e) => setIngredientText(e.target.value)} /></label></div>
    <div className="nutrition-calculator"><div><span className="eyebrow">{text.autoCalc}</span><strong>{text.autoCalcTitle}</strong><small>{text.autoCalcText}</small></div><button className="secondary" disabled={calculatingNutrition} onClick={calculateFromCurrentText}>{calculatingNutrition ? text.calculating : text.calculateAuto}</button></div>
    {nutritionStatus && <div className="success-box">{nutritionStatus}</div>}{unmatchedNutrition.length > 0 && <div className="warning-box">{text.unmatchedPrefix}: {unmatchedNutrition.join(", ")}. {text.unmatchedSuffix}</div>}{nutritionError && <div className="error-box">{nutritionError}</div>}
    <div className="form-grid preparation-grid"><label className="span-2">{text.preparation}<small>{text.preparationHint}</small><textarea rows={6} value={instructionsText} onChange={(e) => setInstructionsText(e.target.value)} /></label></div><button className="primary full" onClick={save}>{text.saveRecipe}</button>
  </div></div>;
}

function localizeRecipe(recipe: Recipe, language: Language): Recipe {
  const translation = recipe.translations?.[language]; if (!translation) return recipe;
  return { ...recipe, name: translation.name, ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient, name: translation.ingredientNames[ingredient.id] || ingredient.name })), instructions: translation.instructions };
}
function applyTranslation(recipe: Recipe, translation: RecipeTranslation): Recipe { return { ...recipe, name: translation.name, ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient, name: translation.ingredientNames[ingredient.id] || ingredient.name })), instructions: translation.instructions }; }
function defaultIngredientText(language: Language) { if (language === "hu") return "150 g Liszt\n1 ek Cukor\n250 ml Tej\n2 db Tojás"; if (language === "en") return "150 g Flour\n1 tbsp Sugar\n250 ml Milk\n2 pcs Eggs"; return "150 g Făină\n1 lingură Zahăr\n250 ml Lapte\n2 buc Ouă"; }
function defaultInstructionsText(language: Language) { if (language === "hu") return "Keverd össze a hozzávalókat.\nSüsd meg és tálald."; if (language === "en") return "Mix the ingredients.\nCook and serve."; return "Amestecă ingredientele.\nGătește și servește."; }
function mergeStarterTranslations(savedRecipes: Recipe[]) { return savedRecipes.map((saved) => { const starter = starterRecipes.find((item) => item.id === saved.id); return starter ? { ...saved, sourceLanguage: saved.sourceLanguage ?? starter.sourceLanguage, translations: { ...(starter.translations ?? {}), ...(saved.translations ?? {}) } } : saved; }); }
function isLanguage(value: unknown): value is Language { return value === "ro" || value === "hu" || value === "en"; }
function displayStore(store: Store | undefined, language: Language) { return store === "Oricare" || !store ? ui[language].allStores : store; }
function normalizeName(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); }
function estimateOfferCost(offer: LiveOffer, ingredient: Ingredient, factor: number) { if (offer.unitPrice === null || offer.unitBase === null) return null; const quantity = ingredient.quantity * factor; const unit = canonicalUnit(ingredient.unit); if (offer.unitBase === "kg") { if (unit === "g") return (quantity / 1000) * offer.unitPrice; if (unit === "kg") return quantity * offer.unitPrice; } if (offer.unitBase === "L") { if (unit === "ml") return (quantity / 1000) * offer.unitPrice; if (unit === "L") return quantity * offer.unitPrice; } if (offer.unitBase === "buc" && unit === "pcs") return quantity * offer.unitPrice; return null; }
function estimateCheapestRecipeCost(offers: LiveOffer[], ingredients: Ingredient[], factor: number) { let total = 0; let count = 0; for (const ingredient of ingredients) { const candidates = offers.filter((offer) => normalizeName(offer.ingredient) === normalizeName(ingredient.name)).map((offer) => estimateOfferCost(offer, ingredient, factor)).filter((value): value is number => value !== null); if (candidates.length) { total += Math.min(...candidates); count++; } } return count ? total : null; }
function formatLei(value: number) { return value.toFixed(2).replace(".", ","); }
function getDayCalories(day: DayPlan, recipes: Recipe[]) { return mealKeys.reduce((sum, { key }) => sum + (recipes.find((recipe) => recipe.id === day[key])?.nutrition.calories ?? 0), 0); }
function prettyQty(n: number) { if (Number.isInteger(n)) return String(n); if (n >= 100) return String(Math.round(n)); return String(Math.round(n * 10) / 10); }
function mergeShopping(base: ShoppingItem[], additions: ShoppingItem[]) { const map = new Map<string, ShoppingItem>(); for (const item of [...base, ...additions]) { const key = `${normalizeName(item.name)}-${canonicalUnit(item.unit)}`; const prev = map.get(key); if (prev) prev.quantity += item.quantity; else map.set(key, { ...item, unit: canonicalUnit(item.unit) }); } return Array.from(map.values()); }
