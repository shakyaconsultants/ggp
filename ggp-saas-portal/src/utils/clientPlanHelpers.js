const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const WEEK_DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export const MEAL_TYPE_ORDER = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function dayShort(day) {
  return DAYS[Number(day)] || `Day ${day}`;
}

export function dayLong(day) {
  return WEEK_DAYS.find((d) => d.value === Number(day))?.label || `Day ${day}`;
}

export function formatPlanDate(d) {
  if (!d) return "—";
  return String(d).slice(0, 10);
}

export function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr === "—") return "—";
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export function isTodayDayOfWeek(dayValue) {
  return Number(dayValue) === new Date().getDay();
}

export function normalizeMeals(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return [];
}

export function mealLabel(meal) {
  if (meal?.food_item?.name) return meal.food_item.name;
  if (meal?.template?.name) return meal.template.name;
  if (meal?.food_item_id) return `Food #${meal.food_item_id}`;
  if (meal?.template_id) return `Template #${meal.template_id}`;
  return "Meal item";
}

export function mealSource(meal) {
  if (meal?.template_id || meal?.template?.name) return "Template";
  return "Food";
}

export function mealKcal(meal) {
  const item = meal?.food_item;
  const qty = Number(meal?.quantity) || 1;
  if (item?.kcal != null) return Math.round(Number(item.kcal) * qty);
  return null;
}

export function planStatus(start, end) {
  const now = new Date();
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (s && now < s) return { label: "Upcoming", className: "status-pending" };
  if (e && now > e) return { label: "Ended", className: "status-inactive" };
  return { label: "Active", className: "status-active" };
}

export function groupMealsByDay(meals) {
  const map = new Map(WEEK_DAYS.map((d) => [d.value, []]));
  for (const meal of normalizeMeals(meals)) {
    const day = Number(meal.day_of_week);
    if (map.has(day)) map.get(day).push(meal);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        MEAL_TYPE_ORDER.indexOf(a.meal_type) - MEAL_TYPE_ORDER.indexOf(b.meal_type)
    );
  }
  return WEEK_DAYS.map((d) => ({
    ...d,
    meals: map.get(d.value) || [],
  }));
}

export function countMealsInWeek(dayGroups) {
  return dayGroups.reduce((sum, d) => sum + d.meals.length, 0);
}

export function groupExercisesByDate(exercises) {
  const map = new Map();
  for (const ex of exercises) {
    const key = formatPlanDate(ex.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(ex);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({
      date,
      displayDate: formatDisplayDate(date),
      isToday: isToday(date),
      exercises: items,
    }));
}

export function mealTypeClass(mealType) {
  switch (mealType) {
    case "Breakfast":
      return "client-meal-card--breakfast";
    case "Lunch":
      return "client-meal-card--lunch";
    case "Dinner":
      return "client-meal-card--dinner";
    case "Snack":
      return "client-meal-card--snack";
    default:
      return "";
  }
}
