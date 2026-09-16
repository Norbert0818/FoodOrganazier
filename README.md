# Meniu & Cumpărături V4

Mobile-first meal planner, recipe importer and smart shopping list for Romania.

## New in V4

- 3 interface languages: Romanian, Hungarian and English
- recipe cards, ingredient names and preparation steps follow the selected app language
- imported Romanian / Hungarian / English recipes are automatically translated to the selected language
- recipe translations are cached in local app data after they are created
- multilingual nutrition matching (RO/HU/EN)
- accent-insensitive matching: `Faina` = `Făină`, `Zahar` = `Zahăr`
- default ingredient semantics:
  - `Făină` / `Faina` / `Liszt` / `Flour` with no qualifier = regular white wheat/all-purpose flour
  - `Zahăr` / `Zahar` / `Cukor` / `Sugar` with no qualifier = regular white granulated sugar
  - specific names such as almond flour, whole-wheat flour, brown sugar etc. remain distinct
- automatic kcal, protein, carbohydrate, fat and fiber calculation using USDA FoodData Central
- public Lidl + Kaufland offer lookup retained from V3
- multilingual units (`buc/db/pcs`, `linguri/ek/tbsp`, `lingurițe/tk/tsp`, etc.) are normalized internally

## Environment variables

Copy `.env.example` to `.env.local`.

```env
USDA_API_KEY=your_usda_key
DEEPL_API_KEY=your_deepl_key
```

`USDA_API_KEY` is used for nutrition calculations.

`DEEPL_API_KEY` is required for arbitrary imported/custom recipes to be translated between Romanian, Hungarian and English. The built-in starter recipes already contain all three translations and do not require DeepL.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Language behaviour

Choose `RO`, `HU` or `EN` in the top-right corner or in Profile.

- UI labels switch immediately.
- Built-in recipes switch immediately.
- If a custom/imported recipe does not yet have the selected translation, the server requests it from DeepL once and stores it with the recipe in browser local storage.
- During link import, the extracted recipe is translated to the currently selected app language before it is shown in the editor.

## Notes

Nutrition values and package/unit conversions are estimates. Spoon/cup/piece conversions use ingredient-aware approximations where possible.

Lidl/Kaufland integration checks public promotional pages. It does not represent a guaranteed complete shelf-price database for every physical store.

## V5 – ingredient parser / culinary units

Ingredient import now keeps quantity, unit and ingredient notes separate. It supports Romanian, Hungarian and English culinary units, including:

- g, kg, ml, L, oz, lb
- tablespoon / tbsp / lingură / evőkanál (ek)
- teaspoon / tsp / linguriță / teáskanál (tk)
- cup / cană / csésze
- piece / buc / db
- pinch / praf / csipet
- clove / cățel / gerezd
- slice, bunch, can, package, stalk, sprig and handful

Metric + imperial pairs such as `175g/6 oz guanciale` keep the first measurement and do not corrupt the ingredient name. Fractions such as `1/4 tsp` and `1/2 cup` are parsed correctly.

Ingredients without an explicit amount are kept as amount-unspecified and are not multiplied when the serving count changes or included in the automatic nutrition calculation.
