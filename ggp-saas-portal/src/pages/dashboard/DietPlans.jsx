import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import DietPlanForm from "../../components/diet/DietPlanForm";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import {
  dietDayLabel,
  emptyDietPlanForm,
  formatDietDate,
  normalizeDietMeals,
  toApiDietMeals,
} from "../../utils/dietPlanForm";

export default function DietPlans() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [foodCatalog, setFoodCatalog] = useState([]);
  const [foodTemplates, setFoodTemplates] = useState([]);
  const [dietTemplates, setDietTemplates] = useState([]);
  const [form, setForm] = useState(emptyDietPlanForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supportReady, setSupportReady] = useState(false);

  const clientMap = useMemo(() => {
    const m = new Map();
    clients.forEach((c) => m.set(c.client_id, c));
    return m;
  }, [clients]);

  const loadPlans = async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    try {
      const data = await api.dietPlans(nutritionist.id);
      setPlans(Array.isArray(data) ? data : data?.diet_plans || []);
    } catch (e) {
      notifyError(e);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSupporting = async () => {
    if (!nutritionist?.id) return;
    setSupportReady(false);
    try {
      const [clientList, foods, fTemplates, dTemplates] = await Promise.all([
        api.nutritionistClients(nutritionist.id),
        api.foodItems(nutritionist.id),
        api.foodTemplates(nutritionist.id),
        api.dietTemplates(nutritionist.id),
      ]);
      setClients(Array.isArray(clientList) ? clientList : []);
      setFoodCatalog(Array.isArray(foods) ? foods : []);
      setFoodTemplates(Array.isArray(fTemplates) ? fTemplates : fTemplates?.templates || []);
      setDietTemplates(Array.isArray(dTemplates) ? dTemplates : dTemplates?.templates || []);
      setSupportReady(true);
    } catch (e) {
      notifyError(e);
      setSupportReady(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadSupporting();
  }, [nutritionist?.id]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyDietPlanForm);
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const p = await api.dietPlan(id);
      setEditId(id);
      setForm({
        client_id: String(p.client_id),
        start_date: formatDietDate(p.start_date),
        end_date: formatDietDate(p.end_date),
        notes: p.notes || "",
        meals: normalizeDietMeals(p.meals),
      });
      setShowModal(true);
    } catch (err) {
      notifyError(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyDietPlanForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editId && !form.client_id) {
      notifyError("Select a client.");
      return;
    }
    if (form.meals.length === 0) {
      notifyError("Add at least one meal entry.");
      return;
    }

    setSubmitting(true);
    try {
      const meals = toApiDietMeals(form.meals);
      if (editId) {
        await api.updateDietPlan(editId, {
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes.trim() || null,
          meals,
        });
        notifySuccess("Diet plan updated.");
      } else {
        await api.createDietPlan({
          nutritionist_id: nutritionist.id,
          client_id: Number(form.client_id),
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes.trim() || null,
          meals,
        });
        notifySuccess("Diet plan created.");
      }
      closeModal();
      loadPlans();
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (p) => {
    const clientName = clientMap.get(p.client_id)?.name || `Client #${p.client_id}`;
    if (!confirm(`Delete diet plan for ${clientName}?`)) return;
    try {
      await api.deleteDietPlan(p.id);
      notifySuccess("Diet plan deleted.");
      if (editId === p.id) closeModal();
      loadPlans();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="page template-page">
      <header className="page-header">
        <div>
          <h1>Diet plans</h1>
          <p className="muted">
            Assign personalized meal plans to clients with date ranges and structured meals.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreate}
          disabled={clients.length === 0}
        >
          + Create diet plan
        </button>
      </header>
      {supportReady && clients.length === 0 && plans.length === 0 && (
        <Alert type="info">
          <Link to="/dashboard/clients">Add clients</Link> first, then create diet plans for
          them here.
        </Alert>
      )}

      <div className="template-grid">
        {loading ? (
          <p className="empty-cell card panel">Loading diet plans…</p>
        ) : plans.length === 0 ? (
          <p className="empty-cell card panel">
            No diet plans yet. Create a plan and assign meals for a client.
          </p>
        ) : (
          plans.map((p) => {
            const meals = normalizeDietMeals(p.meals);
            const client = clientMap.get(p.client_id);
            return (
              <article key={p.id} className="template-card card panel">
                <div className="template-card-head">
                  <h3>{client?.name || `Client #${p.client_id}`}</h3>
                  <p className="muted">
                    {formatDietDate(p.start_date)} → {formatDietDate(p.end_date)}
                  </p>
                  {p.notes && <p className="plan-notes">{p.notes}</p>}
                </div>
                <div className="template-card-meta">
                  <span>{meals.length} meal{meals.length !== 1 ? "s" : ""}</span>
                  <span>Plan #{p.id}</span>
                </div>
                {meals.length > 0 && (
                  <ul className="template-preview-list">
                    {meals.slice(0, 4).map((m, idx) => (
                      <li key={idx}>
                        {dietDayLabel(m.day_of_week)} · {m.meal_type} · {m.label}
                      </li>
                    ))}
                    {meals.length > 4 && (
                      <li className="muted">+{meals.length - 4} more</li>
                    )}
                  </ul>
                )}
                <div className="template-card-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(p.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => remove(p)}
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
        title={editId ? "Edit diet plan" : "Create diet plan"}
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
              form="diet-plan-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : editId ? "Save plan" : "Create plan"}
            </button>
          </>
        }
      >
        <form id="diet-plan-form" onSubmit={submit} className="form template-form">
          <DietPlanForm
            form={form}
            setForm={setForm}
            editId={editId}
            clients={clients}
            foodCatalog={foodCatalog}
            foodTemplates={foodTemplates}
            dietTemplates={dietTemplates}
          />
        </form>
      </Modal>
    </div>
  );
}
