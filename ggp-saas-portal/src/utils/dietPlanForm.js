export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export const DIET_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const emptyDietPlanForm = {
  client_id: "",
  start_date: "",
  end_date: "",
  notes: "",
  meals: [],
};

export function dietDayLabel(day) {
  return DIET_DAYS.find((d) => d.value === Number(day))?.label || `Day ${day}`;
}

export function formatDietDate(d) {
  if (!d) return "—";
  return String(d).slice(0, 10);
}

export function normalizeDietMeals(meals = []) {
  return meals.map((m) => ({
    day_of_week: Number(m.day_of_week),
    meal_type: m.meal_type,
    quantity: Number(m.quantity) || 1,
    food_item_id: m.food_item_id || null,
    template_id: m.template_id || null,
    sourceType: m.template_id ? "template" : "food",
    label: m.template_id
      ? m.template?.name || `Food template #${m.template_id}`
      : m.food_item?.name || (m.food_item_id ? `Food #${m.food_item_id}` : "—"),
  }));
}

export function toApiDietMeals(meals) {
  return meals.map((m) => {
    const base = {
      day_of_week: Number(m.day_of_week),
      meal_type: m.meal_type,
      quantity: Number(m.quantity) || 1,
    };
    if (m.template_id || m.sourceType === "template") {
      return { ...base, template_id: Number(m.template_id), food_item_id: null };
    }
    return { ...base, food_item_id: Number(m.food_item_id), template_id: null };
  });
}
