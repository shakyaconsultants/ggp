import {
  clientInitials,
  isProfileComplete,
  profileCompletionPercent,
} from "../../utils/clientProfileLabels";

export default function ClientProfileSidebar({ profile, onOpenTab }) {
  const complete = isProfileComplete(profile);
  const completion = profileCompletionPercent(profile);
  const clientSince =
    profile?.relationship?.start_date || profile?.relationship?.created_at;

  return (
    <aside className="card panel client-profile-sidebar">
      <div className="client-avatar-lg">{clientInitials(profile.name, profile.email)}</div>
      <h2 className="client-sidebar-name">{profile.name || "Client"}</h2>
      <p className="client-sidebar-email">{profile.email}</p>

      <div className="client-sidebar-badges">
        <span className={`status-badge ${complete ? "status-active" : "status-pending"}`}>
          {complete ? "Profile complete" : "Profile pending"}
        </span>
        <span className="client-completion-pill">{completion}% complete</span>
      </div>

      <div className="client-completion-bar" aria-hidden>
        <span style={{ width: `${completion}%` }} />
      </div>

      <ul className="client-sidebar-meta">
        <li>
          <span>Status</span>
          <strong>{profile.relationship?.status || "active"}</strong>
        </li>
        <li>
          <span>Client since</span>
          <strong>{clientSince ? String(clientSince).slice(0, 10) : "—"}</strong>
        </li>
        <li>
          <span>Onboarding</span>
          <strong>{Number(profile.onboarded) === 1 ? "Done in app" : "Not finished"}</strong>
        </li>
      </ul>

      {profile.relationship?.notes && (
        <div className="client-sidebar-notes">
          <span className="cred-label">Your notes</span>
          <p>{profile.relationship.notes}</p>
        </div>
      )}

      {onOpenTab && (
        <div className="client-sidebar-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm btn-block"
            onClick={() => onOpenTab("diets")}
          >
            Diet plans
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-block"
            onClick={() => onOpenTab("exercises")}
          >
            Exercises
          </button>
        </div>
      )}
    </aside>
  );
}
