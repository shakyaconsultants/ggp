import { useMemo, useState } from "react";
import { MEAL_TYPES } from "../../utils/dietPlanForm";
import {
  MEAL_TYPE_ORDER,
  mealKcal,
  mealLabel,
  mealSource,
  mealTypeClass,
} from "../../utils/clientPlanHelpers";

export default function DayMealPicker({
  meals = [],
  onAdd,
  onRemove,
  foodCatalog = [],
  foodTemplates = [],
  compact = false,
}) {
  const [mealType, setMealType] = useState("Breakfast");
  const [sourceType, setSourceType] = useState("food");
  const [pickerId, setPickerId] = useState("");
  const [pickerQty, setPickerQty] = useState(1);

  const pickerOptions = useMemo(() => {
    if (sourceType === "template") {
      return foodTemplates.map((t) => ({ id: t.id, label: t.name }));
    }
    return foodCatalog.map((f) => ({
      id: f.id,
      label: `${f.name} — ${f.mealType} — ${f.kcal} kcal`,
    }));
  }, [sourceType, foodCatalog, foodTemplates]);

  const canAdd = sourceType === "food" ? foodCatalog.length > 0 : foodTemplates.length > 0;

  const resolveLabel = (id, type) => {
    if (type === "template") {
      return foodTemplates.find((t) => t.id === Number(id))?.name || `Template #${id}`;
    }
    const f = foodCatalog.find((x) => x.id === Number(id));
    return f ? f.name : `Food #${id}`;
  };

  const handleAdd = () => {
    if (!pickerId || !onAdd) return;
    onAdd({
      meal_type: mealType,
      quantity: Number(pickerQty) || 1,
      sourceType,
      label: resolveLabel(pickerId, sourceType),
      food_item_id: sourceType === "food" ? Number(pickerId) : null,
      template_id: sourceType === "template" ? Number(pickerId) : null,
    });
    setPickerId("");
    setPickerQty(1);
  };

  const sortedMeals = [...meals].sort(
    (a, b) => MEAL_TYPE_ORDER.indexOf(a.meal_type) - MEAL_TYPE_ORDER.indexOf(b.meal_type)
  );

  return (
    <div className="day-meal-picker">
      {!compact && (
        <p className="muted form-hint">
          Add meals for this day — food item or food template, breakfast through snacks.
        </p>
      )}

      {!canAdd ? (
        <p className="muted">Add food items or food templates in your catalog first.</p>
      ) : (
        <div className="diet-meal-picker day-meal-picker-controls">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            aria-label="Meal type"
          >
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={sourceType}
            onChange={(e) => {
              setSourceType(e.target.value);
              setPickerId("");
            }}
            aria-label="Source type"
          >
            <option value="food">Food item</option>
            <option value="template">Food template</option>
          </select>
          <select
            value={pickerId}
            onChange={(e) => setPickerId(e.target.value)}
            aria-label="Select item"
            className="diet-picker-source"
          >
            <option value="">
              {sourceType === "food" ? "Select food…" : "Select template…"}
            </option>
            {pickerOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="1"
            value={pickerQty}
            onChange={(e) => setPickerQty(e.target.value)}
            className="template-picker-qty"
            aria-label="Quantity"
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!pickerId}>
            Add
          </button>
        </div>
      )}

      {sortedMeals.length === 0 ? (
        <p className="template-empty-items muted">No meals for this day yet.</p>
      ) : (
        <ul className="day-meal-list">
          {sortedMeals.map((meal, idx) => {
            const kcal = mealKcal(meal);
            return (
              <li key={meal.id || idx} className={`day-meal-item ${mealTypeClass(meal.meal_type)}`}>
                <div className="day-meal-item-main">
                  <span className="client-meal-type">{meal.meal_type}</span>
                  <strong>{meal.label || mealLabel(meal)}</strong>
                  <span className="muted day-meal-item-meta">
                    {mealSource(meal)}
                    {meal.quantity > 1 && ` · Qty × ${meal.quantity}`}
                    {kcal != null && ` · ${kcal} kcal`}
                  </span>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onRemove(meal)}
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
