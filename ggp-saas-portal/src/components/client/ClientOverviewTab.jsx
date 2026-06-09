import {
  getFilledProfileFields,
  getProfileSections,
  profileCompletionPercent,
} from "../../utils/clientProfileLabels";
import { formatDisplayDate, formatPlanDate, planStatus } from "../../utils/clientPlanHelpers";

export default function ClientOverviewTab({ profile, dietPlans, exercises, onOpenTab }) {
  const completion = profileCompletionPercent(profile);
  const filledCount = getFilledProfileFields(profile).length;
  const activePlans = dietPlans.filter(
    (p) => planStatus(p.start_date, p.end_date).label === "Active"
  ).length;

  const stats = [
    { label: "Profile completion", value: `${completion}%`, hint: `${filledCount} fields filled` },
    { label: "Active diet plans", value: activePlans, hint: `${dietPlans.length} total` },
    { label: "Exercise assignments", value: exercises.length, hint: "Scheduled workouts" },
  ];

  const recentPlan = dietPlans[0];
  const recentExercise = exercises[0];

  return (
    <div className="client-tab-panel">
      <div className="client-stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="client-stat-card card panel">
            <span className="client-stat-label">{s.label}</span>
            <strong className="client-stat-value">{s.value}</strong>
            <span className="muted client-stat-hint">{s.hint}</span>
          </div>
        ))}
      </div>

      <div className="client-overview-grid">
        <section className="card panel">
          <h3>Profile snapshot</h3>
          {getProfileSections(profile).length === 0 ? (
            <p className="muted">
              Waiting for the client to complete their health profile in the mobile app.
            </p>
          ) : (
            <ul className="client-snapshot-list">
              {getProfileSections(profile)
                .slice(0, 2)
                .flatMap((sec) => sec.fields.slice(0, 2))
                .map((f) => (
                  <li key={f.key}>
                    <span>{f.label}</span>
                    <strong>{f.value}</strong>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="card panel">
          <h3>Recent activity</h3>
          <ul className="client-activity-list">
            {recentPlan ? (
              <li>
                <span className="client-activity-type">Diet plan</span>
                <p>
                  {formatPlanDate(recentPlan.start_date)} → {formatPlanDate(recentPlan.end_date)}
                </p>
                <span className="muted">
                  {recentPlan.meals?.length || 0} meals · weekly schedule
                </span>
              </li>
            ) : (
              <li className="muted">No diet plans assigned yet.</li>
            )}
            {recentExercise ? (
              <li>
                <span className="client-activity-type">Exercise</span>
                <p>{recentExercise.exerciseName}</p>
                <span className="muted">{formatDisplayDate(formatPlanDate(recentExercise.date))}</span>
              </li>
            ) : (
              <li className="muted">No exercises assigned yet.</li>
            )}
          </ul>
        </section>
      </div>

      {onOpenTab && (
        <div className="client-quick-actions card panel">
          <h3>Quick actions</h3>
          <div className="client-quick-actions-row">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onOpenTab("diets")}
            >
              Manage diet plans
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onOpenTab("exercises")}
            >
              Assign exercises
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
