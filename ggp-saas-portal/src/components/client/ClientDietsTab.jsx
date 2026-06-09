import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import Modal from "../../components/Modal";
import DayMealPicker from "../diet/DayMealPicker";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import {
  formatDietDate,
  normalizeDietMeals,
  toApiDietMeals,
} from "../../utils/dietPlanForm";
import { dayLong, planStatus } from "../../utils/clientPlanHelpers";
import { buildWeekdayPickerDays } from "../../utils/daySchedule";
import ClientDayScheduleLayout from "./ClientDayScheduleLayout";
import ClientDietWeekBoard from "./ClientDietWeekBoard";

function defaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 28);
  return d.toISOString().slice(0, 10);
}

export default function ClientDietsTab({
  clientId,
  clientName,
  dietPlans,
  onPlansChange,
}) {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [foodCatalog, setFoodCatalog] = useState([]);
  const [foodTemplates, setFoodTemplates] = useState([]);
  const [dietTemplates, setDietTemplates] = useState([]);
  const [supportReady, setSupportReady] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedWeekday, setSelectedWeekday] = useState(() => new Date().getDay());
  const [draftMeals, setDraftMeals] = useState([]);
  const [planMeta, setPlanMeta] = useState({ start_date: "", end_date: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [importTemplateId, setImportTemplateId] = useState("");

  const sortedPlans = useMemo(() => {
    const order = { Active: 0, Upcoming: 1, Ended: 2 };
    return [...dietPlans].sort((a, b) => {
      const sa = planStatus(a.start_date, a.end_date).label;
      const sb = planStatus(b.start_date, b.end_date).label;
      return (order[sa] ?? 9) - (order[sb] ?? 9);
    });
  }, [dietPlans]);

  const selectedPlan =
    sortedPlans.find((p) => p.id === selectedPlanId) || sortedPlans[0];

  useEffect(() => {
    if (sortedPlans.length && !sortedPlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(sortedPlans[0].id);
    }
  }, [sortedPlans, selectedPlanId]);

  useEffect(() => {
    if (selectedPlan) {
      setDraftMeals(
        normalizeDietMeals(selectedPlan.meals).map((m) => ({
          ...m,
          _uid: m._uid || `${m.day_of_week}-${m.meal_type}-${m.label}-${Math.random()}`,
        }))
      );
      setPlanMeta({
        start_date: formatDietDate(selectedPlan.start_date),
        end_date: formatDietDate(selectedPlan.end_date),
        notes: selectedPlan.notes || "",
      });
    } else {
      setDraftMeals([]);
      setPlanMeta({
        start_date: new Date().toISOString().slice(0, 10),
        end_date: defaultEndDate(),
        notes: "",
      });
    }
  }, [selectedPlan?.id]);

  useEffect(() => {
    if (!nutritionist?.id) return;
    let cancelled = false;

    async function loadSupport() {
      try {
        const [foods, fTemplates, dTemplates] = await Promise.all([
          api.foodItems(nutritionist.id),
          api.foodTemplates(nutritionist.id),
          api.dietTemplates(nutritionist.id),
        ]);
        if (cancelled) return;
        setFoodCatalog(Array.isArray(foods) ? foods : []);
        setFoodTemplates(Array.isArray(fTemplates) ? fTemplates : fTemplates?.templates || []);
        setDietTemplates(Array.isArray(dTemplates) ? dTemplates : dTemplates?.templates || []);
        setSupportReady(true);
      } catch (e) {
        if (!cancelled) {
          notifyError(e);
          setSupportReady(false);
        }
      }
    }

    loadSupport();
    return () => {
      cancelled = true;
    };
  }, [nutritionist?.id, notifyError]);

  const dayMeals = useMemo(
    () => draftMeals.filter((m) => Number(m.day_of_week) === Number(selectedWeekday)),
    [draftMeals, selectedWeekday]
  );

  const pickerDays = useMemo(
    () => buildWeekdayPickerDays(draftMeals, selectedWeekday),
    [draftMeals, selectedWeekday]
  );

  const addDayMeal = (entry) => {
    setDraftMeals((prev) => [
      ...prev,
      {
        ...entry,
        day_of_week: Number(selectedWeekday),
        _uid: crypto.randomUUID(),
      },
    ]);
  };

  const removeDayMeal = (meal) => {
    setDraftMeals((prev) => prev.filter((m) => m._uid !== meal._uid));
  };

  const importTemplateForDay = async () => {
    if (!importTemplateId) return;
    try {
      const t = await api.dietTemplate(Number(importTemplateId));
      const imported = normalizeDietMeals(t.meals)
        .filter((m) => Number(m.day_of_week) === Number(selectedWeekday))
        .map((m) => ({ ...m, _uid: crypto.randomUUID() }));
      setDraftMeals((prev) => [
        ...prev.filter((m) => Number(m.day_of_week) !== Number(selectedWeekday)),
        ...imported,
      ]);
      notifySuccess(
        imported.length
          ? `Imported ${imported.length} meal(s) for ${dayLong(selectedWeekday)}.`
          : `No meals for ${dayLong(selectedWeekday)} in that template.`
      );
    } catch (err) {
      notifyError(err);
    }
  };

  const savePlan = async () => {
    if (!planMeta.start_date || !planMeta.end_date) {
      notifyError("Set plan start and end dates.");
      return;
    }
    if (draftMeals.length === 0) {
      notifyError("Add at least one meal on any day.");
      return;
    }

    setSaving(true);
    try {
      const meals = toApiDietMeals(draftMeals);
      const payload = {
        start_date: planMeta.start_date,
        end_date: planMeta.end_date,
        notes: planMeta.notes.trim() || null,
        meals,
      };

      if (selectedPlan) {
        await api.updateDietPlan(selectedPlan.id, payload);
        notifySuccess(`${dayLong(selectedWeekday)} saved — plan updated.`);
      } else {
        await api.createDietPlan({
          nutritionist_id: nutritionist.id,
          client_id: Number(clientId),
          ...payload,
        });
        notifySuccess("Diet plan created.");
      }
      await onPlansChange?.();
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };

  const removePlan = async () => {
    if (!selectedPlan || !confirm(`Delete diet plan #${selectedPlan.id}?`)) return;
    try {
      await api.deleteDietPlan(selectedPlan.id);
      notifySuccess("Diet plan deleted.");
      await onPlansChange?.();
    } catch (err) {
      notifyError(err);
    }
  };

  const openPlanSettings = () => setShowPlanModal(true);

  return (
    <div className="client-tab-panel">
      <div className="client-tab-toolbar">
        <div>
          <p className="client-tab-toolbar-title">Weekly meal schedule</p>
          <p className="muted">
            Select a day, build meals for that day only, then save. Uses food items and templates
            from your catalog.
          </p>
        </div>
        <div className="client-tab-toolbar-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={openPlanSettings}
            disabled={!supportReady}
          >
            Plan settings
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={savePlan}
            disabled={!supportReady || saving}
          >
            {saving ? "Saving…" : selectedPlan ? "Save plan" : "Create plan"}
          </button>
        </div>
      </div>

      {sortedPlans.length > 1 && (
        <div className="client-plan-selector card panel">
          <label htmlFor="plan-select">
            <span className="cred-label">Active plan</span>
            <select
              id="plan-select"
              value={selectedPlan?.id ?? ""}
              onChange={(e) => setSelectedPlanId(Number(e.target.value))}
            >
              {sortedPlans.map((p) => {
                const st = planStatus(p.start_date, p.end_date);
                return (
                  <option key={p.id} value={p.id}>
                    Plan #{p.id} · {st.label} · {String(p.start_date).slice(0, 10)}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
      )}

      {selectedPlan && (
        <p className="client-plan-meta muted">
          {formatDietDate(selectedPlan.start_date)} → {formatDietDate(selectedPlan.end_date)}
          {selectedPlan.notes && ` · ${selectedPlan.notes}`}
        </p>
      )}

      <ClientDayScheduleLayout
        pickerLabel="Pick a day of the week"
        days={pickerDays}
        selectedKey={selectedWeekday}
        onSelectDay={setSelectedWeekday}
        editorTitle={`Meals for ${dayLong(selectedWeekday)}`}
        editorSubtitle="Add breakfast, lunch, dinner, and snacks for this day only"
        editorCount={dayMeals.length}
        editorActions={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={savePlan}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save this day"}
          </button>
        }
      >
        {dietTemplates.length > 0 && (
          <div className="import-template-row day-import-row">
            <select
              value={importTemplateId}
              onChange={(e) => setImportTemplateId(e.target.value)}
              aria-label="Import template for this day"
            >
              <option value="">Import template meals for this day…</option>
              {dietTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={importTemplateForDay}
              disabled={!importTemplateId}
            >
              Import
            </button>
          </div>
        )}

        <DayMealPicker
          meals={dayMeals}
          onAdd={addDayMeal}
          onRemove={removeDayMeal}
          foodCatalog={foodCatalog}
          foodTemplates={foodTemplates}
        />
      </ClientDayScheduleLayout>

      {selectedPlan && draftMeals.length > 0 && (
        <details className="client-week-overview">
          <summary>Full week overview</summary>
          <div className="card panel client-diet-week-panel">
            <ClientDietWeekBoard plan={{ ...selectedPlan, meals: draftMeals }} onDelete={removePlan} />
          </div>
        </details>
      )}

      {!selectedPlan && dietPlans.length === 0 && (
        <p className="muted client-first-plan-hint">
          No plan yet for {clientName || "this client"}. Pick a day, add meals, then click{" "}
          <strong>Create plan</strong>.
        </p>
      )}

      <Modal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Plan settings"
        footer={
          <>
            {selectedPlan && (
              <button type="button" className="btn btn-ghost" onClick={removePlan}>
                Delete plan
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={() => setShowPlanModal(false)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowPlanModal(false);
                savePlan();
              }}
              disabled={saving}
            >
              Save settings
            </button>
          </>
        }
      >
        <div className="form">
          <p className="client-fixed-client muted">
            Client: <strong>{clientName || `#${clientId}`}</strong>
          </p>
          <div className="form-row">
            <label>
              Start date *
              <input
                type="date"
                value={planMeta.start_date}
                onChange={(e) => setPlanMeta({ ...planMeta, start_date: e.target.value })}
              />
            </label>
            <label>
              End date *
              <input
                type="date"
                value={planMeta.end_date}
                onChange={(e) => setPlanMeta({ ...planMeta, end_date: e.target.value })}
              />
            </label>
          </div>
          <label>
            Notes
            <textarea
              rows={2}
              value={planMeta.notes}
              onChange={(e) => setPlanMeta({ ...planMeta, notes: e.target.value })}
              placeholder="Optional instructions"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
