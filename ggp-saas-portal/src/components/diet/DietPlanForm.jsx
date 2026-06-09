import { useMemo, useState } from "react";
import { api } from "../../api/client";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import {
  DIET_DAYS,
  MEAL_TYPES,
  dietDayLabel,
  normalizeDietMeals,
} from "../../utils/dietPlanForm";

export default function DietPlanForm({
  form,
  setForm,
  editId,
  fixedClientId,
  clientName,
  clients = [],
  foodCatalog = [],
  foodTemplates = [],
  dietTemplates = [],
}) {
  const { notifyError, notifySuccess } = useApiFeedback();
  const [mealDay, setMealDay] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");
  const [sourceType, setSourceType] = useState("food");
  const [pickerId, setPickerId] = useState("");
  const [pickerQty, setPickerQty] = useState(1);
  const [importTemplateId, setImportTemplateId] = useState("");

  const pickerOptions = useMemo(() => {
    if (sourceType === "template") {
      return foodTemplates.map((t) => ({ id: t.id, label: t.name }));
    }
    return foodCatalog.map((f) => ({
      id: f.id,
      label: `${f.name} — ${f.mealType} — ${f.kcal} kcal`,
    }));
  }, [sourceType, foodCatalog, foodTemplates]);

  const canAddMeals =
    sourceType === "food" ? foodCatalog.length > 0 : foodTemplates.length > 0;

  const resolveLabel = (id, type) => {
    if (type === "template") {
      return foodTemplates.find((t) => t.id === Number(id))?.name || `Template #${id}`;
    }
    const f = foodCatalog.find((x) => x.id === Number(id));
    return f ? f.name : `Food #${id}`;
  };

  const addMeal = () => {
    if (!pickerId) return;
    const entry = {
      day_of_week: Number(mealDay),
      meal_type: mealType,
      quantity: Number(pickerQty) || 1,
      sourceType,
      label: resolveLabel(pickerId, sourceType),
      food_item_id: sourceType === "food" ? Number(pickerId) : null,
      template_id: sourceType === "template" ? Number(pickerId) : null,
    };
    setForm({ ...form, meals: [...form.meals, entry] });
    setPickerId("");
    setPickerQty(1);
  };

  const removeMeal = (index) => {
    setForm({ ...form, meals: form.meals.filter((_, i) => i !== index) });
  };

  const importFromDietTemplate = async () => {
    if (!importTemplateId) return;
    try {
      const t = await api.dietTemplate(Number(importTemplateId));
      const meals = normalizeDietMeals(t.meals);
      setForm({ ...form, meals });
      notifySuccess(`Imported ${meals.length} meals from "${t.name}".`);
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <>
      <div className="form-section">
        <h3>Plan details</h3>
        {fixedClientId ? (
          <p className="client-fixed-client muted">
            Assigning to <strong>{clientName || `Client #${fixedClientId}`}</strong>
          </p>
        ) : (
          <div className="form-row">
            <label>
              Client *
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                required={!editId}
                disabled={!!editId}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="form-row">
          <label>
            Start date *
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </label>
          <label>
            End date *
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </label>
        </div>
        <label>
          Notes
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional instructions for this plan"
          />
        </label>
      </div>

      {dietTemplates.length > 0 && (
        <div className="import-template-row">
          <select
            value={importTemplateId}
            onChange={(e) => setImportTemplateId(e.target.value)}
            aria-label="Import from diet template"
          >
            <option value="">Import meals from diet template…</option>
            {dietTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={importFromDietTemplate}
            disabled={!importTemplateId}
          >
            Import
          </button>
        </div>
      )}

      <div className="form-section">
        <h3>Meals *</h3>
        <p className="muted form-hint">
          Add meals day by day — pick a food item from your catalog or a food template.
        </p>

        {!canAddMeals ? (
          <p className="muted">Add food items or food templates in your catalog first.</p>
        ) : (
          <div className="diet-meal-picker">
            <select
              value={mealDay}
              onChange={(e) => setMealDay(Number(e.target.value))}
              aria-label="Day of week"
            >
              {DIET_DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
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
                {sourceType === "food" ? "Select food…" : "Select food template…"}
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
            <button
              type="button"
              className="btn btn-outline"
              onClick={addMeal}
              disabled={!pickerId}
            >
              Add meal
            </button>
          </div>
        )}

        {form.meals.length === 0 ? (
          <p className="template-empty-items muted">No meals added yet.</p>
        ) : (
          <div className="template-items-table-wrap">
            <table className="data-table template-items-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Meal</th>
                  <th>Source</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {form.meals.map((m, idx) => (
                  <tr key={idx}>
                    <td>{dietDayLabel(m.day_of_week)}</td>
                    <td>{m.meal_type}</td>
                    <td>
                      <span className="meal-tag">
                        {m.template_id || m.sourceType === "template" ? "Template" : "Food"}
                      </span>
                    </td>
                    <td>{m.label}</td>
                    <td>{m.quantity}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeMeal(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
