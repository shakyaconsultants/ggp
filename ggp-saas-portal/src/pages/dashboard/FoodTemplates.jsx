import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { useApiFeedback } from "../../hooks/useApiFeedback";

const emptyForm = { name: "", description: "", food_items: [] };

function toApiItems(items) {
  return items.map(({ food_item_id, quantity }) => ({
    food_item_id: Number(food_item_id),
    quantity: Number(quantity) || 1,
  }));
}

function normalizeTemplateItems(items = []) {
  return items.map((item) => ({
    food_item_id: item.food_item_id,
    quantity: Number(item.quantity) || 1,
    name: item.name,
    kcal: item.kcal,
    p: item.p,
    c: item.c,
    f: item.f,
    mealType: item.mealType,
    isVeg: item.isVeg,
  }));
}

function macroTotals(items) {
  return items.reduce(
    (acc, item) => {
      const q = Number(item.quantity) || 1;
      acc.kcal += (Number(item.kcal) || 0) * q;
      acc.p += (Number(item.p) || 0) * q;
      acc.c += (Number(item.c) || 0) * q;
      acc.f += (Number(item.f) || 0) * q;
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

export default function FoodTemplates() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [templates, setTemplates] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pickerId, setPickerId] = useState("");
  const [pickerQty, setPickerQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);

  const loadTemplates = async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    try {
      const data = await api.foodTemplates(nutritionist.id);
      setTemplates(Array.isArray(data) ? data : data?.templates || []);
    } catch (e) {
      notifyError(e);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    if (!nutritionist?.id) return;
    setCatalogReady(false);
    try {
      const data = await api.foodItems(nutritionist.id);
      setCatalog(Array.isArray(data) ? data : []);
      setCatalogReady(true);
    } catch (e) {
      notifyError(e);
      setCatalog([]);
      setCatalogReady(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadCatalog();
  }, [nutritionist?.id]);

  const catalogMap = useMemo(() => {
    const m = new Map();
    catalog.forEach((f) => m.set(f.id, f));
    return m;
  }, [catalog]);

  const formTotals = useMemo(() => macroTotals(form.food_items), [form.food_items]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setPickerId("");
    setPickerQty(1);
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const t = await api.foodTemplate(id);
      setEditId(id);
      setForm({
        name: t.name || "",
        description: t.description || "",
        food_items: normalizeTemplateItems(t.food_items),
      });
      setPickerId("");
      setPickerQty(1);
      setShowModal(true);
    } catch (err) {
      notifyError(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    setPickerId("");
    setPickerQty(1);
  };

  const addFoodItem = () => {
    if (!pickerId) return;
    const food = catalogMap.get(Number(pickerId));
    if (!food) return;

    const existing = form.food_items.find(
      (i) => Number(i.food_item_id) === Number(pickerId)
    );

    if (existing) {
      setForm({
        ...form,
        food_items: form.food_items.map((i) =>
          Number(i.food_item_id) === Number(pickerId)
            ? { ...i, quantity: Number(pickerQty) || 1 }
            : i
        ),
      });
    } else {
      setForm({
        ...form,
        food_items: [
          ...form.food_items,
          {
            food_item_id: food.id,
            quantity: Number(pickerQty) || 1,
            name: food.name,
            kcal: food.kcal,
            p: food.p,
            c: food.c,
            f: food.f,
            mealType: food.mealType,
            isVeg: food.isVeg,
          },
        ],
      });
    }
    setPickerId("");
    setPickerQty(1);
  };

  const removeFoodItem = (foodItemId) => {
    setForm({
      ...form,
      food_items: form.food_items.filter(
        (i) => Number(i.food_item_id) !== Number(foodItemId)
      ),
    });
  };

  const updateItemQty = (foodItemId, quantity) => {
    setForm({
      ...form,
      food_items: form.food_items.map((i) =>
        Number(i.food_item_id) === Number(foodItemId)
          ? { ...i, quantity: Number(quantity) || 1 }
          : i
      ),
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.food_items.length === 0) {
      notifyError("Add at least one food item from your catalog.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        food_items: toApiItems(form.food_items),
      };

      if (editId) {
        await api.updateFoodTemplate(editId, payload);
        notifySuccess(`Template "${payload.name}" updated.`);
      } else {
        await api.createFoodTemplate({
          ...payload,
          nutritionist_id: nutritionist.id,
        });
        notifySuccess(`Template "${payload.name}" created.`);
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
    if (!confirm(`Delete template "${t.name}"?`)) return;
    try {
      await api.deleteFoodTemplate(t.id);
      notifySuccess(`Template "${t.name}" deleted.`);
      if (editId === t.id) closeModal();
      loadTemplates();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="page template-page">
      <header className="page-header">
        <div>
          <h1>Food templates</h1>
          <p className="muted">
            Combine foods from your catalog into reusable meal templates for diet plans.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Create template
        </button>
      </header>
      {catalogReady && catalog.length === 0 && templates.length === 0 && (
        <Alert type="info">
          Your food catalog is empty.{" "}
          <Link to="/dashboard/food-items">Add food items</Link> first, then create templates
          here.
        </Alert>
      )}

      <div className="template-grid">
        {loading ? (
          <p className="empty-cell card panel">Loading templates…</p>
        ) : templates.length === 0 ? (
          <p className="empty-cell card panel">
            No food templates yet. Create one to group foods for quick diet planning.
          </p>
        ) : (
          templates.map((t) => {
            const items = normalizeTemplateItems(t.food_items);
            const totals = macroTotals(items);
            return (
              <article key={t.id} className="template-card card panel">
                <div className="template-card-head">
                  <h3>{t.name}</h3>
                  {t.description && <p className="muted">{t.description}</p>}
                </div>
                <div className="template-card-meta">
                  <span>{items.length} food{items.length !== 1 ? "s" : ""}</span>
                  <span>{Math.round(totals.kcal)} kcal total</span>
                </div>
                {items.length > 0 && (
                  <ul className="template-preview-list">
                    {items.slice(0, 4).map((item) => (
                      <li key={item.food_item_id}>
                        {item.name || `Item #${item.food_item_id}`} × {item.quantity}
                      </li>
                    ))}
                    {items.length > 4 && (
                      <li className="muted">+{items.length - 4} more</li>
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
        title={editId ? "Edit food template" : "Create food template"}
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
              form="food-template-form"
              className="btn btn-primary"
              disabled={submitting || catalog.length === 0}
            >
              {submitting ? "Saving…" : editId ? "Save template" : "Create template"}
            </button>
          </>
        }
      >
        <form id="food-template-form" onSubmit={submit} className="form template-form">

          <label>
            Template name *
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. High protein breakfast"
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
              placeholder="Optional notes about this template"
            />
          </label>

          <div className="form-section">
            <h3>Food items *</h3>
            <p className="muted form-hint">
              Select foods from your catalog and set quantity for each item in this template.
            </p>

            {catalog.length === 0 ? (
              <p className="muted">Add foods in Food catalog first.</p>
            ) : (
              <div className="template-picker">
                <select
                  value={pickerId}
                  onChange={(e) => setPickerId(e.target.value)}
                  aria-label="Select food item"
                >
                  <option value="">Select food from catalog…</option>
                  {catalog.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.mealType} — {f.kcal} kcal
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={pickerQty}
                  onChange={(e) => setPickerQty(e.target.value)}
                  placeholder="Qty"
                  aria-label="Quantity"
                  className="template-picker-qty"
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={addFoodItem}
                  disabled={!pickerId}
                >
                  Add
                </button>
              </div>
            )}

            {form.food_items.length === 0 ? (
              <p className="template-empty-items muted">No items added yet.</p>
            ) : (
              <div className="template-items-table-wrap">
                <table className="data-table template-items-table">
                  <thead>
                    <tr>
                      <th>Food</th>
                      <th>Meal</th>
                      <th>Qty</th>
                      <th>Kcal</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {form.food_items.map((item) => (
                      <tr key={item.food_item_id}>
                        <td>{item.name || `#${item.food_item_id}`}</td>
                        <td>{item.mealType || "—"}</td>
                        <td>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQty(item.food_item_id, e.target.value)
                            }
                            className="qty-input"
                          />
                        </td>
                        <td>
                          {Math.round((Number(item.kcal) || 0) * (Number(item.quantity) || 1))}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeFoodItem(item.food_item_id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="template-totals">
                  <span>
                    <strong>{Math.round(formTotals.kcal)}</strong> kcal
                  </span>
                  <span>P: {formTotals.p.toFixed(1)}g</span>
                  <span>C: {formTotals.c.toFixed(1)}g</span>
                  <span>F: {formTotals.f.toFixed(1)}g</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
