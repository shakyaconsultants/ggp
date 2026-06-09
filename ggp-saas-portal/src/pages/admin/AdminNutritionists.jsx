import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminClient";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import AdminPageHeader, { AdminStatStrip, PracticeAvatar } from "../../components/admin/AdminPageHeader";
import { formatAdminDate, practiceName } from "../../utils/adminFormat";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "clients", label: "Most clients" },
];

export default function AdminNutritionists() {
  const { notifyError } = useApiFeedback();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setLoading(true);
    adminApi
      .nutritionists()
      .then(setData)
      .catch((e) => notifyError(e))
      .finally(() => setLoading(false));
  }, [notifyError]);

  const specialties = useMemo(() => {
    const set = new Set();
    (data?.nutritionists || []).forEach((n) => {
      const s = n.specialty?.trim();
      if (s) set.add(s);
    });
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(() => {
    let list = [...(data?.nutritionists || [])];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (n) =>
          practiceName(n).toLowerCase().includes(q) ||
          n.email?.toLowerCase().includes(q) ||
          n.current_organisation?.toLowerCase().includes(q) ||
          n.specialty?.toLowerCase().includes(q)
      );
    }

    if (specialtyFilter) {
      list = list.filter((n) => n.specialty === specialtyFilter);
    }

    list.sort((a, b) => {
      if (sort === "name") {
        return practiceName(a).localeCompare(practiceName(b));
      }
      if (sort === "clients") {
        return (Number(b.client_count) || 0) - (Number(a.client_count) || 0);
      }
      if (sort === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return list;
  }, [data, search, specialtyFilter, sort]);

  const summary = data?.summary;

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Nutritionists"
        description="All registered practices on the Good Gut Product SaaS platform."
        badge={filtered.length ? `${filtered.length} shown` : undefined}
      />

      {summary && (
        <AdminStatStrip
          items={[
            { label: "Total practices", value: summary.practices },
            { label: "Linked clients", value: summary.linked_clients },
            { label: "Active clients", value: summary.active_clients },
          ]}
        />
      )}

      <section className="card panel admin-toolbar">
        <div className="admin-filter-row admin-filter-row-4">
          <label className="admin-filter-field admin-filter-field-grow">
            <span>Search</span>
            <input
              type="search"
              className="admin-search"
              placeholder="Name, email, organisation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="admin-filter-field">
            <span>Specialty</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-filter-field">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="card panel table-wrap admin-practices-table">
        {loading ? (
          <p className="muted admin-table-loading">Loading nutritionists…</p>
        ) : filtered.length === 0 ? (
          <p className="empty-cell">
            {data?.nutritionists?.length
              ? "No practices match your filters."
              : "No nutritionists have registered yet."}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Practice</th>
                <th>Specialty</th>
                <th>Organisation</th>
                <th>Clients</th>
                <th>Active</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td>
                    <div className="admin-practice-cell">
                      <PracticeAvatar person={n} />
                      <div>
                        <Link to={`/admin/nutritionists/${n.id}`} className="admin-practice-link">
                          <strong>{practiceName(n)}</strong>
                        </Link>
                        <span className="admin-cell-sub">{n.email}</span>
                        {n.phone_number && (
                          <span className="admin-cell-sub">{n.phone_number}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{n.specialty || "—"}</td>
                  <td>{n.current_organisation || "—"}</td>
                  <td>
                    <strong>{n.client_count ?? 0}</strong>
                  </td>
                  <td>{n.active_clients ?? 0}</td>
                  <td>{formatAdminDate(n.created_at)}</td>
                  <td className="admin-table-actions">
                    <Link
                      to={`/admin/nutritionists/${n.id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Profile
                    </Link>
                    <Link
                      to={`/admin/clients?nutritionist=${n.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Clients
                    </Link>
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
