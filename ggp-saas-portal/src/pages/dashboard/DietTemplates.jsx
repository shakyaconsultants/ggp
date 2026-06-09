import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { useApiFeedback } from "../../hooks/useApiFeedback";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const emptyForm = { name: "", description: "", meals: [] };

function dayLabel(day) {
  return DAYS.find((d) => d.value === Number(day))?.label || `Day ${day}`;
}

function normalizeMeals(meals = []) {
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

function toApiMeals(meals) {
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

function uniqueDays(meals) {
  return new Set(meals.map((m) => Number(m.day_of_week))).size;
}

export default function DietTemplates() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [templates, setTemplates] = useState([]);
  const [foodCatalog, setFoodCatalog] = useState([]);
  const [foodTemplates, setFoodTemplates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pickersReady, setPickersReady] = useState(false);

  const [mealDay, setMealDay] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");
  const [sourceType, setSourceType] = useState("food");
  const [pickerId, setPickerId] = useState("");
  const [pickerQty, setPickerQty] = useState(1);

  const loadTemplates = async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    try {
      const data = await api.dietTemplates(nutritionist.id);
      setTemplates(Array.isArray(data) ? data : data?.templates || []);
    } catch (e) {
      notifyError(e);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPickers = async () => {
    if (!nutritionist?.id) return;
    setPickersReady(false);
    try {
      const [foods, fTemplates] = await Promise.all([
        api.foodItems(nutritionist.id),
        api.foodTemplates(nutritionist.id),
      ]);
      setFoodCatalog(Array.isArray(foods) ? foods : []);
      setFoodTemplates(Array.isArray(fTemplates) ? fTemplates : fTemplates?.templates || []);
      setPickersReady(true);
    } catch (e) {
      notifyError(e);
      setFoodCatalog([]);
      setFoodTemplates([]);
      setPickersReady(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadPickers();
  }, [nutritionist?.id]);

  const pickerOptions = useMemo(() => {
    if (sourceType === "template") {
      return foodTemplates.map((t) => ({
        id: t.id,
        label: t.name,
      }));
    }
    return foodCatalog.map((f) => ({
      id: f.id,
      label: `${f.name} — ${f.mealType} — ${f.kcal} kcal`,
    }));
  }, [sourceType, foodCatalog, foodTemplates]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    resetPicker();
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const t = await api.dietTemplate(id);
      setEditId(id);
      setForm({
        name: t.name || "",
        description: t.description || "",
        meals: normalizeMeals(t.meals),
      });
      resetPicker();
      setShowModal(true);
    } catch (err) {
      notifyError(err);
    }
  };

  const resetPicker = () => {
    setMealDay(1);
    setMealType("Breakfast");
    setSourceType("food");
    setPickerId("");
    setPickerQty(1);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    resetPicker();
  };

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

  const submit = async (e) => {
    e.preventDefault();
    if (form.meals.length === 0) {
      notifyError("Add at least one meal entry.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        meals: toApiMeals(form.meals),
      };

      if (editId) {
        await api.updateDietTemplate(editId, payload);
        notifySuccess(`Diet template "${payload.name}" updated.`);
      } else {
        await api.createDietTemplate({
          ...payload,
          nutritionist_id: nutritionist.id,
        });
        notifySuccess(`Diet template "${payload.name}" created.`);
      }
      closeModal();
      loadTemplates();
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (t) => {
    if (!confirm(`Delete diet template "${t.name}"?`)) return;
    try {
      await api.deleteDietTemplate(t.id);
      notifySuccess(`Diet template "${t.name}" deleted.`);
      if (editId === t.id) closeModal();
      loadTemplates();
    } catch (err) {
      notifyError(err);
    }
  };

  const canAddMeals =
    sourceType === "food" ? foodCatalog.length > 0 : foodTemplates.length > 0;

  return (
    <div className="page template-page">
      <header className="page-header">
        <div>
          <h1>Diet templates</h1>
          <p className="muted">
            Weekly meal plans using individual foods or food templates — reusable for client diet
            plans.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Create diet template
        </button>
      </header>
      {pickersReady &&
        templates.length === 0 &&
        foodCatalog.length === 0 &&
        foodTemplates.length === 0 && (
        <Alert type="info">
          Add{" "}
          <Link to="/dashboard/food-items">food items</Link> or{" "}
          <Link to="/dashboard/food-templates">food templates</Link> first, then build diet
          templates here.
        </Alert>
      )}

      <div className="template-grid">
        {loading ? (
          <p className="empty-cell card panel">Loading diet templates…</p>
        ) : templates.length === 0 ? (
          <p className="empty-cell card panel">
            No diet templates yet. Create a weekly meal structure for faster diet plan setup.
          </p>
        ) : (
          templates.map((t) => {
            const meals = normalizeMeals(t.meals);
            return (
              <article key={t.id} className="template-card card panel">
                <div className="template-card-head">
                  <h3>{t.name}</h3>
                  {t.description && <p className="muted">{t.description}</p>}
                </div>
                <div className="template-card-meta">
                  <span>{meals.length} meal{meals.length !== 1 ? "s" : ""}</span>
                  <span>{uniqueDays(meals)} day{uniqueDays(meals) !== 1 ? "s" : ""}</span>
                </div>
                {meals.length > 0 && (
                  <ul className="template-preview-list">
                    {meals.slice(0, 5).map((m, idx) => (
                      <li key={idx}>
                        {dayLabel(m.day_of_week)} · {m.meal_type} · {m.label} × {m.quantity}
                      </li>
                    ))}
                    {meals.length > 5 && (
                      <li className="muted">+{meals.length - 5} more</li>
                    )}
                  </ul>
                )}
                <div className="template-card-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(t.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => remove(t)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editId ? "Edit diet template" : "Create diet template"}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="diet-template-form"
              className="btn btn-primary"
              disabled={submitting || !canAddMeals}
            >
              {submitting ? "Saving…" : editId ? "Save template" : "Create template"}
            </button>
          </>
        }
      >
        <form id="diet-template-form" onSubmit={submit} className="form template-form">

          <label>
            Template name *
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 7-day weight loss plan"
              required
              autoFocus
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional summary of this diet template"
            />
          </label>

          <div className="form-section">
            <h3>Meals *</h3>
            <p className="muted form-hint">
              Each entry needs a day, meal type, and either a food item or a food template (not
              both).
            </p>

            {!canAddMeals ? (
              <p className="muted">Add foods or food templates first.</p>
            ) : (
              <div className="diet-meal-picker">
                <select
                  value={mealDay}
                  onChange={(e) => setMealDay(Number(e.target.value))}
                  aria-label="Day of week"
                >
                  {DAYS.map((d) => (
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
                        <td>{dayLabel(m.day_of_week)}</td>
                        <td>{m.meal_type}</td>
                        <td>
                          <span className="meal-tag">
                            {m.template_id || m.sourceType === "template"
                              ? "Template"
                              : "Food"}
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
        </form>
      </Modal>
    </div>
  );
}
