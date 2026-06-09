import { WEEK_DAYS, formatPlanDate, isToday } from "./clientPlanHelpers";

export function getWeekStartSunday(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function shiftWeek(weekStartStr, weeks) {
  const d = new Date(`${weekStartStr}T12:00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

export function getWeekDates(weekStartStr) {
  const start = new Date(`${weekStartStr}T12:00:00`);
  return WEEK_DAYS.map((wd) => {
    const d = new Date(start);
    d.setDate(start.getDate() + wd.value);
    const date = d.toISOString().slice(0, 10);
    return {
      ...wd,
      date,
      sublabel: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
  });
}

export function formatWeekRange(weekStartStr) {
  const days = getWeekDates(weekStartStr);
  const first = days[0];
  const last = days[6];
  const y = new Date(`${weekStartStr}T12:00:00`).getFullYear();
  return `${first.sublabel} – ${last.sublabel}, ${y}`;
}

export function buildWeekdayPickerDays(meals, selectedKey) {
  const counts = new Map(WEEK_DAYS.map((d) => [d.value, 0]));
  for (const meal of meals || []) {
    const day = Number(meal.day_of_week);
    if (counts.has(day)) counts.set(day, counts.get(day) + 1);
  }
  const today = new Date().getDay();
  return WEEK_DAYS.map((d) => ({
    key: d.value,
    short: d.short,
    label: d.label,
    sublabel: null,
    count: counts.get(d.value) || 0,
    isToday: d.value === today,
    isSelected: selectedKey === d.value,
  }));
}

export function buildDatePickerDays(weekStartStr, assignments, selectedKey) {
  const counts = new Map();
  for (const item of assignments || []) {
    const key = formatPlanDate(item.date);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return getWeekDates(weekStartStr).map((d) => ({
    key: d.date,
    short: d.short,
    label: d.label,
    sublabel: d.sublabel,
    count: counts.get(d.date) || 0,
    isToday: isToday(d.date),
    isSelected: selectedKey === d.date,
  }));
}

export function countByDate(assignments, dateStr) {
  return (assignments || []).filter((a) => formatPlanDate(a.date) === dateStr).length;
}
