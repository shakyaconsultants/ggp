import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../../api/adminClient";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import AdminPageHeader, {
  AdminBackLink,
  AdminStatStrip,
  PracticeAvatar,
} from "../../components/admin/AdminPageHeader";
import { formatAdminDate, practiceName } from "../../utils/adminFormat";

function DetailField({ label, value }) {
  return (
    <div className="admin-detail-field">
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export default function AdminNutritionistDetail() {
  const { id } = useParams();
  const { notifyError } = useApiFeedback();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .nutritionist(id)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch((e) => {
        if (!cancelled) notifyError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, notifyError]);

  if (loading) {
    return (
      <div className="admin-page">
        <p className="muted">Loading practice profile…</p>
      </div>
    );
  }

  if (!data?.nutritionist) {
    return (
      <div className="admin-page">
        <AdminBackLink to="/admin/nutritionists" />
        <p className="muted">Practice not found.</p>
      </div>
    );
  }

  const n = data.nutritionist;
  const s = data.stats || {};

  return (
    <div className="admin-page">
      <AdminBackLink to="/admin/nutritionists">← All nutritionists</AdminBackLink>

      <div className="admin-detail-hero card panel">
        <PracticeAvatar person={n} size="lg" />
        <div className="admin-detail-hero-body">
          <h1>{practiceName(n)}</h1>
          <p className="muted">{n.email}</p>
          <div className="admin-detail-hero-meta">
            {n.specialty && <span className="admin-pill">{n.specialty}</span>}
            {n.current_organisation && (
              <span className="admin-pill admin-pill-muted">{n.current_organisation}</span>
            )}
            <span className="admin-pill admin-pill-muted">
              Joined {formatAdminDate(n.created_at)}
            </span>
          </div>
        </div>
        <div className="admin-detail-hero-actions">
          <Link to={`/admin/clients?nutritionist=${n.id}`} className="btn btn-primary">
            View clients
          </Link>
        </div>
      </div>

      <AdminStatStrip
        items={[
          { label: "Total clients", value: s.clients ?? 0 },
          { label: "Active", value: s.active_clients ?? 0 },
          { label: "Profiles complete", value: s.profiles_complete ?? 0 },
          { label: "Diet plans", value: s.diet_plans ?? 0 },
          { label: "Food items", value: s.food_items ?? 0 },
          { label: "Exercises", value: s.exercises ?? 0 },
        ]}
      />

      <div className="admin-detail-grid">
        <section className="card panel">
          <h2 className="admin-section-title">Practice details</h2>
          <dl className="admin-detail-dl">
            <DetailField label="Phone" value={n.phone_number} />
            <DetailField label="Years of experience" value={n.years_of_experience} />
            <DetailField label="Organisation" value={n.current_organisation} />
            <DetailField label="Address" value={n.address} />
            <DetailField label="Last updated" value={formatAdminDate(n.updated_at)} />
          </dl>
        </section>

        <section className="card panel">
          <div className="admin-section-head-inline">
            <h2 className="admin-section-title">Clients</h2>
            <Link to={`/admin/clients?nutritionist=${n.id}`} className="admin-link">
              View all
            </Link>
          </div>
          {!data.clients?.length ? (
            <p className="muted">No clients linked to this practice yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table data-table-compact">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Profile</th>
                    <th>Status</th>
                    <th>Linked</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients.slice(0, 8).map((c) => (
                    <tr key={c.client_id}>
                      <td>
                        <strong>{c.name || c.email}</strong>
                        <span className="admin-cell-sub">{c.email}</span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            c.onboarded ? "status-active" : "status-pending"
                          }`}
                        >
                          {c.onboarded ? "Complete" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${c.relationship_status || "active"}`}
                        >
                          {c.relationship_status || "active"}
                        </span>
                      </td>
                      <td>{formatAdminDate(c.linked_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
