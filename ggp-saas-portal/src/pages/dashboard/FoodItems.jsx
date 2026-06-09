import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { useNutritionist } from "../../context/NutritionistContext";
import Modal from "../../components/Modal";
import { useApiFeedback } from "../../hooks/useApiFeedback";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const emptyForm = {
  name: "",
  quantity: "1 serving",
  kcal: "",
  p: "",
  c: "",
  f: "",
  image: "",
  mealType: "Lunch",
  isVeg: true,
};

function toPayload(form) {
  return {
    name: form.name.trim(),
    quantity: String(form.quantity).trim() || "1 serving",
    kcal: Number(form.kcal),
    p: Number(form.p),
    c: Number(form.c),
    f: Number(form.f),
    image: form.image.trim() || null,
    isVeg: form.isVeg ? 1 : 0,
    mealType: form.mealType,
  };
}

function itemToForm(item) {
  return {
    name: item.name || "",
    quantity: item.quantity ?? "1 serving",
    kcal: item.kcal ?? "",
    p: item.p ?? "",
    c: item.c ?? "",
    f: item.f ?? "",
    image: item.image || "",
    mealType: item.mealType || "Lunch",
    isVeg: !!item.isVeg,
  };
}

export default function FoodItems() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    try {
      const data = filter
        ? await api.foodItems(nutritionist.id, filter)
        : await api.foodItems(nutritionist.id);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      notifyError(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter, nutritionist?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name?.toLowerCase().includes(q));
  }, [items, search]);

  const stats = useMemo(() => {
    const byMeal = MEAL_TYPES.reduce((acc, t) => {
      acc[t] = items.filter((i) => i.mealType === t).length;
      return acc;
    }, {});
    return { total: items.length, byMeal };
  }, [items]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
      };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm(itemToForm(item));
    setShowForm(true);
      };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
        setSubmitting(true);
    try {
      const body = { ...toPayload(form), nutritionist_id: nutritionist?.id };
      if (editId) {
        await api.updateFoodItem(editId, body);
        notifySuccess(`"${body.name}" updated successfully.`);
      } else {
        await api.createFoodItem(body);
        notifySuccess(`"${body.name}" added to your catalog.`);
      }
      cancelForm();
      load();
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (item) => {
    if (!confirm(`Delete "${item.name}" from the catalog?`)) return;
    try {
      await api.deleteFoodItem(item.id);
      notifySuccess(`"${item.name}" removed.`);
      if (editId === item.id) cancelForm();
      load();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="page food-catalog-page">
      <header className="page-header">
        <div>
          <h1>Food catalog</h1>
          <p className="muted">
            Add and manage foods with macros and serving sizes for your diet plans and templates.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add food item
        </button>
      </header>
      <div className="food-stats-row">
        <div className="food-stat-card">
          <strong>{stats.total}</strong>
          <span>Total items</span>
        </div>
        {MEAL_TYPES.map((t) => (
          <div key={t} className="food-stat-card">
            <strong>{stats.byMeal[t]}</strong>
            <span>{t}</span>
          </div>
        ))}
      </div>

      <div className="food-toolbar card panel">
        <div className="food-toolbar-filters">
          <label className="toolbar-field">
            <span>Meal type</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All meal types</option>
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="toolbar-field toolbar-field-grow">
            <span>Search by name</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods…"
            />
          </label>
        </div>
        <p className="muted food-toolbar-meta">
          Showing {filtered.length} of {items.length} items
          {filter ? ` in ${filter}` : ""}
        </p>
      </div>

      {showForm && (
        <Modal
          open={showForm}
          onClose={cancelForm}
          title={editId ? "Edit food item" : "Add food item"}
          footer={
            <>
              <button type="button" className="btn btn-outline" onClick={cancelForm} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                form="food-item-form"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving…" : editId ? "Save changes" : "Add to catalog"}
              </button>
            </>
          }
        >
          <form id="food-item-form" onSubmit={submit} className="form food-form">
            <div className="form-section">
              <h3>Basic details</h3>
              <label>
                Food name *
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Grilled chicken breast"
                  required
                  autoFocus
                />
              </label>
              <div className="form-row">
                <label>
                  Meal type *
                  <select
                    value={form.mealType}
                    onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                    required
                  >
                    {MEAL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity / serving size *
                  <input
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 100g, 1 cup"
                    required
                  />
                </label>
              </div>
              <label>
                Image URL <span className="label-hint">(optional)</span>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://…"
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isVeg}
                  onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                />
                Vegetarian
              </label>
            </div>

            <div className="form-section">
              <h3>Macros (per serving)</h3>
              <div className="macro-grid">
                <label>
                  Calories (kcal) *
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.kcal}
                    onChange={(e) => setForm({ ...form, kcal: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Protein (g) *
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.p}
                    onChange={(e) => setForm({ ...form, p: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Carbs (g) *
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.c}
                    onChange={(e) => setForm({ ...form, c: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Fat (g) *
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.f}
                    onChange={(e) => setForm({ ...form, f: e.target.value })}
                    required
                  />
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <div className="table-wrap card panel food-table-wrap">
        {loading ? (
          <p className="empty-cell">Loading food catalog…</p>
        ) : filtered.length === 0 ? (
          <p className="empty-cell">
            {items.length === 0
              ? "No food items yet. Add your first item to build your catalog."
              : "No items match your search."}
          </p>
        ) : (
          <table className="data-table food-table">
            <thead>
              <tr>
                <th>Food</th>
                <th>Meal</th>
                <th>Serving</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="food-name-cell">
                      {item.image ? (
                        <img src={item.image} alt="" className="food-thumb" />
                      ) : (
                        <span className="food-thumb food-thumb-placeholder">🥗</span>
                      )}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="meal-tag">{item.mealType}</span>
                  </td>
                  <td>{item.quantity || "—"}</td>
                  <td>
                    <strong>{item.kcal}</strong> kcal
                  </td>
                  <td>{item.p}g</td>
                  <td>{item.c}g</td>
                  <td>{item.f}g</td>
                  <td>
                    <span className={`veg-badge ${item.isVeg ? "veg" : "non-veg"}`}>
                      {item.isVeg ? "Veg" : "Non-veg"}
                    </span>
                  </td>
                  <td>
                    <div className="list-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => remove(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
