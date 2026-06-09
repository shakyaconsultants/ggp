import { useEffect, useMemo, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import {
  formatDisplayDate,
  formatPlanDate,
  groupExercisesByDate,
} from "../../utils/clientPlanHelpers";
import {
  buildDatePickerDays,
  formatWeekRange,
  getWeekDates,
  getWeekStartSunday,
  shiftWeek,
} from "../../utils/daySchedule";
import ClientDayScheduleLayout from "./ClientDayScheduleLayout";

function ExerciseCard({ exercise, onRemove }) {
  return (
    <article className="client-exercise-card">
      <div className="client-exercise-card-head">
        <strong>{exercise.exerciseName}</strong>
        <span className="meal-tag">{exercise.type}</span>
      </div>
      {exercise.muscleType && (
        <p className="client-exercise-muscle">{exercise.muscleType}</p>
      )}
      {exercise.workoutSteps && (
        <p className="client-exercise-steps">{exercise.workoutSteps}</p>
      )}
      <div className="client-exercise-card-foot">
        {exercise.videoLink && (
          <a
            href={exercise.videoLink}
            target="_blank"
            rel="noreferrer"
            className="client-exercise-video"
          >
            Watch demo →
          </a>
        )}
        {onRemove && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onRemove(exercise.assignment_id)}
          >
            Remove
          </button>
        )}
      </div>
    </article>
  );
}

export default function ClientExercisesTab({
  clientId,
  exercises,
  onExercisesChange,
}) {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [library, setLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getWeekStartSunday());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [assignExerciseId, setAssignExerciseId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const dayGroups = groupExercisesByDate(exercises);
  const upcomingDays = dayGroups.filter((d) => d.date >= new Date().toISOString().slice(0, 10));

  const pickerDays = useMemo(
    () => buildDatePickerDays(weekStart, exercises, selectedDate),
    [weekStart, exercises, selectedDate]
  );

  const dayAssignments = useMemo(
    () =>
      exercises.filter((ex) => formatPlanDate(ex.date) === selectedDate),
    [exercises, selectedDate]
  );

  useEffect(() => {
    if (!nutritionist?.id) return;
    let cancelled = false;
    setLoadingLibrary(true);

    api
      .exercises(nutritionist.id)
      .then((data) => {
        if (!cancelled) setLibrary(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) {
          notifyError(e);
          setLibrary([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLibrary(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nutritionist?.id, notifyError]);

  const shiftWeekAndKeepWeekday = (delta) => {
    const newStart = shiftWeek(weekStart, delta);
    setWeekStart(newStart);
    const weekday = new Date(`${selectedDate}T12:00:00`).getDay();
    const match = getWeekDates(newStart).find((d) => d.value === weekday);
    if (match) setSelectedDate(match.date);
  };

  const goToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setWeekStart(getWeekStartSunday());
    setSelectedDate(today);
  };

  const assignToDay = async (e) => {
    e.preventDefault();
    if (!assignExerciseId) return;
    setAssigning(true);
    try {
      await api.assignClientExercise(nutritionist.id, clientId, {
        exerciseId: Number(assignExerciseId),
        date: selectedDate,
      });
      notifySuccess(`Workout assigned for ${formatDisplayDate(selectedDate)}.`);
      setAssignExerciseId("");
      await onExercisesChange?.();
    } catch (err) {
      notifyError(err);
    } finally {
      setAssigning(false);
    }
  };

  const unassign = async (assignmentId) => {
    if (!confirm("Remove this workout from the client's schedule?")) return;
    try {
      await api.unassignClientExercise(nutritionist.id, clientId, assignmentId);
      notifySuccess("Assignment removed.");
      await onExercisesChange?.();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="client-tab-panel">
      <div className="client-tab-toolbar">
        <div>
          <p className="client-tab-toolbar-title">Day-wise workout schedule</p>
          <p className="muted">
            Select a day in the week, then assign workouts for that date only.
          </p>
        </div>
      </div>

      {exercises.length > 0 && (
        <div className="client-exercise-summary card panel">
          <div className="client-exercise-summary-stat">
            <strong>{dayGroups.length}</strong>
            <span>Scheduled days</span>
          </div>
          <div className="client-exercise-summary-stat">
            <strong>{exercises.length}</strong>
            <span>Total workouts</span>
          </div>
          <div className="client-exercise-summary-stat">
            <strong>{upcomingDays.length}</strong>
            <span>Upcoming days</span>
          </div>
        </div>
      )}

      <ClientDayScheduleLayout
        pickerLabel="Pick a day in the week"
        days={pickerDays}
        selectedKey={selectedDate}
        onSelectDay={setSelectedDate}
        weekNav={{
          label: formatWeekRange(weekStart),
          onPrev: () => shiftWeekAndKeepWeekday(-1),
          onNext: () => shiftWeekAndKeepWeekday(1),
          onToday: goToToday,
        }}
        editorTitle={formatDisplayDate(selectedDate)}
        editorSubtitle="Assign workouts from your library for this day"
        editorCount={dayAssignments.length}
      >
        {loadingLibrary ? (
          <p className="muted">Loading exercise library…</p>
        ) : library.length === 0 ? (
          <p className="muted">
            Your exercise library is empty. Add exercises under Exercises in the sidebar first.
          </p>
        ) : (
          <form onSubmit={assignToDay} className="client-assign-form client-assign-form--inline">
            <label>
              <span className="cred-label">Exercise</span>
              <select
                value={assignExerciseId}
                onChange={(e) => setAssignExerciseId(e.target.value)}
                required
              >
                <option value="">Select from library…</option>
                {library.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.exerciseName} · {ex.type}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-primary" disabled={assigning}>
              {assigning ? "Assigning…" : "Assign to this day"}
            </button>
          </form>
        )}

        {dayAssignments.length === 0 ? (
          <p className="template-empty-items muted">No workouts on this day yet.</p>
        ) : (
          <div className="client-exercise-day-grid client-exercise-day-grid--panel">
            {dayAssignments.map((ex) => (
              <ExerciseCard key={ex.assignment_id} exercise={ex} onRemove={unassign} />
            ))}
          </div>
        )}
      </ClientDayScheduleLayout>
    </div>
  );
}
