import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import Modal from "../../components/Modal";
import { useApiFeedback } from "../../hooks/useApiFeedback";

const EXERCISE_TYPES = ["HIIT", "Strength", "Cardio", "Stretching", "Rehab", "Other"];

const emptyForm = {
  exerciseName: "",
  type: "Strength",
  videoLink: "",
  muscleType: "",
  workoutSteps: "",
};

export default function Exercises() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [exercises, setExercises] = useState([]);
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignClientId, setAssignClientId] = useState("");
  const [assignExerciseId, setAssignExerciseId] = useState("");
  const [assignDate, setAssignDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const loadExercises = async () => {
    if (!nutritionist?.id) return;
    try {
      const data = await api.exercises(nutritionist.id);
      setExercises(Array.isArray(data) ? data : []);
    } catch (e) {
      notifyError(e);
      setExercises([]);
    }
  };

  const loadClients = async () => {
    if (!nutritionist?.id) return;
    try {
      const data = await api.nutritionistClients(nutritionist.id);
      setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      notifyError(e);
      setClients([]);
    }
  };

  const loadAssignments = async (clientId) => {
    if (!nutritionist?.id || !clientId) {
      setAssignments([]);
      return;
    }
    try {
      const data = await api.clientExerciseAssignments(nutritionist.id, clientId);
      setAssignments(data.assignments || []);
    } catch (e) {
      notifyError(e);
      setAssignments([]);
    }
  };

  const loadAll = async () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    try {
      await Promise.all([loadExercises(), loadClients()]);
      if (assignClientId) await loadAssignments(assignClientId);
    } catch {
      /* errors surfaced in loaders */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [nutritionist?.id]);

  useEffect(() => {
    if (!nutritionist?.id) return;
    if (assignClientId) loadAssignments(assignClientId);
    else setAssignments([]);
  }, [assignClientId, nutritionist?.id]);

  const stats = useMemo(
    () => ({ total: exercises.length, assigned: assignments.length }),
    [exercises, assignments]
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      exerciseName: item.exerciseName || "",
      type: item.type || "Strength",
      videoLink: item.videoLink || "",
      muscleType: item.muscleType || "",
      workoutSteps: item.workoutSteps || "",
    });
    setShowForm(true);
  };

  const saveExercise = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.updateExercise(nutritionist.id, editId, form);
        notifySuccess("Exercise updated.");
      } else {
        await api.createExercise(nutritionist.id, form);
        notifySuccess("Exercise added to your library.");
      }
      setShowForm(false);
      await loadExercises();
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const removeExercise = async (id) => {
    if (!confirm("Delete this exercise from your library?")) return;
    try {
      await api.deleteExercise(nutritionist.id, id);
      notifySuccess("Exercise deleted.");
      await loadExercises();
    } catch (err) {
      notifyError(err);
    }
  };

  const assignToClient = async (e) => {
    e.preventDefault();
    if (!assignClientId || !assignExerciseId) return;
    try {
      await api.assignClientExercise(nutritionist.id, assignClientId, {
        exerciseId: Number(assignExerciseId),
        date: assignDate,
      });
      notifySuccess("Exercise assigned to client. They will see it in the mobile app.");
      await loadAssignments(assignClientId);
      setAssignExerciseId("");
    } catch (err) {
      notifyError(err);
    }
  };

  const unassign = async (assignmentId) => {
    if (!confirm("Remove this assignment from the client?")) return;
    try {
      await api.unassignClientExercise(
        nutritionist.id,
        assignClientId,
        assignmentId
      );
      notifySuccess("Assignment removed.");
      await loadAssignments(assignClientId);
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Exercises</h1>
          <p className="muted">
            Build your exercise library and assign workouts to clients. Clients see
            only exercises you assign in the mobile app.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add exercise
        </button>
      </header>
      <div className="stats-grid" style={{ marginBottom: "1rem" }}>
        <div className="stat-card">
          <span className="stat-label">Library</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        {assignClientId && (
          <div className="stat-card">
            <span className="stat-label">Assigned to client</span>
            <span className="stat-value">{stats.assigned}</span>
          </div>
        )}
      </div>

      <div className="card panel" style={{ marginBottom: "1.5rem" }}>
        <h2>Assign to client</h2>
        <p className="muted form-hint">
          Pick a client and exercise. Assigned workouts appear on the client&apos;s
          Exercises tab in the app.
        </p>
        <form onSubmit={assignToClient} className="form form-row compact-form">
          <select
            value={assignClientId}
            onChange={(e) => setAssignClientId(e.target.value)}
            required
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.client_id} value={c.client_id}>
                {c.name || c.email}
              </option>
            ))}
          </select>
          <select
            value={assignExerciseId}
            onChange={(e) => setAssignExerciseId(e.target.value)}
            required
          >
            <option value="">Select exercise</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.exerciseName}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={assignDate}
            onChange={(e) => setAssignDate(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Assign
          </button>
        </form>

        {assignClientId && assignments.length > 0 && (
          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.assignment_id}>
                    <td>{a.exerciseName}</td>
                    <td>{a.type}</td>
                    <td>{String(a.date || "").slice(0, 10)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => unassign(a.assignment_id)}
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

      <div className="table-wrap card panel">
        <h2>Your exercise library</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : exercises.length === 0 ? (
          <p className="muted empty-cell">
            No exercises yet. Add exercises your clients can be assigned.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Muscle</th>
                <th>Video</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.exerciseName}</td>
                  <td>{ex.type}</td>
                  <td>{ex.muscleType || "—"}</td>
                  <td>
                    {ex.videoLink ? (
                      <a href={ex.videoLink} target="_blank" rel="noreferrer">
                        Link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openEdit(ex)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeExercise(ex.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit exercise" : "Add exercise"}>
        <form onSubmit={saveExercise} className="form">
          <label>
            Name *
            <input
              value={form.exerciseName}
              onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
              required
            />
          </label>
          <label>
            Type *
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Muscle group
            <input
              value={form.muscleType}
              onChange={(e) => setForm({ ...form, muscleType: e.target.value })}
              placeholder="e.g. Full body, Upper body"
            />
          </label>
          <label>
            Video URL
            <input
              value={form.videoLink}
              onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
              placeholder="https://..."
            />
          </label>
          <label>
            Instructions
            <textarea
              value={form.workoutSteps}
              onChange={(e) => setForm({ ...form, workoutSteps: e.target.value })}
              rows={3}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : editId ? "Update" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
