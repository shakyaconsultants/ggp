/**
 * mysql2 may return JSON columns / JSON_OBJECT fields as objects or strings.
 * These helpers normalize both shapes for diet template/plan meal parsing.
 */

function parseJsonField(value) {
  if (value == null) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

function parseJsonArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return [value];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      if (trimmed.startsWith("[")) return JSON.parse(trimmed);
      return JSON.parse(`[${trimmed}]`);
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeNestedTemplate(template) {
  const parsed = parseJsonField(template);
  if (!parsed) return null;
  return {
    ...parsed,
    food_items: parseJsonArray(parsed.food_items),
  };
}

function normalizeDietMeal(meal) {
  if (!meal || typeof meal !== "object") return meal;
  return {
    ...meal,
    food_item: parseJsonField(meal.food_item),
    template: meal.template ? normalizeNestedTemplate(meal.template) : null,
  };
}

function normalizeDietMeals(meals) {
  return parseJsonArray(meals).map(normalizeDietMeal);
}

module.exports = {
  parseJsonField,
  parseJsonArray,
  normalizeDietMeal,
  normalizeDietMeals,
};
