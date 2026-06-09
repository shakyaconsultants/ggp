import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminApi } from "../../api/adminClient";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { formatAdminDate } from "../../utils/adminFormat";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

function formatDate(iso) {
  return formatAdminDate(iso);
}

export default function AdminClients() {
  const { notifyError } = useApiFeedback();
  const [searchParams] = useSearchParams();
  const preselectedNutritionist = searchParams.get("nutritionist") || "";
  const [nutritionists, setNutritionists] = useState([]);
  const [selectedNutritionistId, setSelectedNutritionistId] = useState(
    preselectedNutritionist
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [nutritionist, setNutritionist] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (preselectedNutritionist) {
      setSelectedNutritionistId(preselectedNutritionist);
    }
  }, [preselectedNutritionist]);

  useEffect(() => {
    setLoadingList(true);
    adminApi
      .nutritionists()
      .then((r) => setNutritionists(r.nutritionists || []))
      .catch((e) => notifyError(e))
      .finally(() => setLoadingList(false));
  }, [notifyError]);

  useEffect(() => {
    if (!selectedNutritionistId) {
      setNutritionist(null);
      setClients([]);
      return;
    }

    const nutritionistId = Number(selectedNutritionistId);
    let cancelled = false;
    setLoadingClients(true);

    adminApi
      .clients(nutritionistId, statusFilter || undefined)
      .then((r) => {
        if (cancelled) return;
        setNutritionist(r.nutritionist);
        const rows = r.clients || [];
        setClients(
          rows.filter(
            (c) => !c.nutritionist_id || Number(c.nutritionist_id) === nutritionistId
          )
        );
      })
      .catch((e) => {
        if (cancelled) return;
        notifyError(e);
        setNutritionist(null);
        setClients([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingClients(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedNutritionistId, statusFilter, notifyError]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const selectedMeta = nutritionists.find(
    (n) => String(n.id) === String(selectedNutritionistId)
  );

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Clients by practice"
        description="Select a nutritionist to view their clients — scoped per practice, never mixed."
        badge={selectedNutritionistId ? `${filteredClients.length} shown` : undefined}
      />

      <section className="card panel admin-toolbar admin-clients-filters">
        <div className="admin-filter-row">
          <label className="admin-filter-field">
            <span>Nutritionist</span>
            <select
              value={selectedNutritionistId}
              onChange={(e) => setSelectedNutritionistId(e.target.value)}
              disabled={loadingList}
            >
              <option value="">Select a nutritionist…</option>
              {nutritionists.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.first_name} {n.last_name} ({n.client_count ?? 0} clients)
                </option>
              ))}
            </select>
          </label>

          <label className="admin-filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={!selectedNutritionistId}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-filter-field admin-filter-field-grow">
            <span>Search clients</span>
            <input
              type="search"
              className="admin-search"
              placeholder="Name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!selectedNutritionistId}
            />
          </label>
        </div>
      </section>

      {!selectedNutritionistId ? (
        <div className="card panel admin-clients-empty">
          <p className="muted">
            {loadingList
              ? "Loading nutritionists…"
              : nutritionists.length === 0
                ? "No nutritionists registered yet."
                : "Choose a nutritionist from the filter above to see their client list."}
          </p>
        </div>
      ) : (
        <>
          {nutritionist && (
            <div className="admin-clients-practice card panel">
              <div>
                <strong>
                  <Link to={`/admin/nutritionists/${nutritionist.id}`} className="admin-practice-link">
                    {nutritionist.first_name} {nutritionist.last_name}
                  </Link>
                </strong>
                <span className="muted admin-cell-sub">{nutritionist.email}</span>
              </div>
              <div className="admin-clients-practice-meta">
                <span>{nutritionist.specialty || "No specialty"}</span>
                <span>{selectedMeta?.client_count ?? clients.length} total clients</span>
              </div>
            </div>
          )}

          <div className="card panel table-wrap">
            {loadingClients ? (
              <p className="muted">Loading clients…</p>
            ) : filteredClients.length === 0 ? (
              <p className="empty-cell">
                {clients.length === 0
                  ? "This nutritionist has no linked clients yet."
                  : "No clients match your search."}
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Email</th>
                    <th>App profile</th>
                    <th>Status</th>
                    <th>Linked</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((c) => (
                    <tr key={c.client_id}>
                      <td>
                        <strong>{c.name || "—"}</strong>
                      </td>
                      <td>{c.email}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            c.onboarded ? "status-active" : "status-pending"
                          }`}
                        >
                          {c.onboarded ? "Complete" : "Pending in app"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${c.relationship_status || "active"}`}
                        >
                          {c.relationship_status || "active"}
                        </span>
                      </td>
                      <td>{formatDate(c.linked_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
