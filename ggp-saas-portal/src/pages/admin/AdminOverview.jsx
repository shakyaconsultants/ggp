import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminClient";
import { useApiFeedback } from "../../hooks/useApiFeedback";

function formatMonth(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function formatDate(iso) {
  if (!iso) return "—";
  return String(iso).slice(0, 10);
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <article className={`analytics-kpi analytics-kpi--${accent || "default"}`}>
      <span className="analytics-kpi-label">{label}</span>
      <span className="analytics-kpi-value">{value}</span>
      {sub && <span className="analytics-kpi-sub">{sub}</span>}
    </article>
  );
}

function TrendChart({ title, series, color }) {
  const max = useMemo(
    () => Math.max(1, ...series.map((s) => Number(s.count) || 0)),
    [series]
  );

  return (
    <section className="analytics-panel">
      <h3>{title}</h3>
      {series.length === 0 ? (
        <p className="analytics-empty">No data for the last 6 months.</p>
      ) : (
        <div className="analytics-bars" role="img" aria-label={title}>
          {series.map((s) => (
            <div key={s.month} className="analytics-bar-col">
              <div
                className="analytics-bar"
                style={{
                  height: `${Math.max(8, (Number(s.count) / max) * 100)}%`,
                  background: color,
                }}
                title={`${formatMonth(s.month)}: ${s.count}`}
              />
              <span className="analytics-bar-label">{formatMonth(s.month)}</span>
              <span className="analytics-bar-value">{s.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RateBar({ label, pct, color }) {
  return (
    <div className="analytics-rate">
      <div className="analytics-rate-head">
        <span>{label}</span>
        <strong>{pct}%</strong>
      </div>
      <div className="analytics-rate-track">
        <div
          className="analytics-rate-fill"
          style={{ width: `${Math.min(100, pct)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function normalizeAnalytics(raw) {
  const totals = raw?.totals || {};
  const clients = Number(totals.clients) || 0;
  const nutritionists = Number(totals.nutritionists) || 0;
  const activeClients = Number(totals.active_clients) || 0;
  const profilesComplete = Number(totals.profiles_complete) || 0;

  const growth = raw?.growth || {};
  const rates = raw?.rates || {};

  return {
    generated_at: raw?.generated_at || new Date().toISOString(),
    totals: {
      nutritionists,
      clients,
      active_clients: activeClients,
      profiles_complete: profilesComplete,
    },
    growth: {
      nutritionists_last_30d: Number(growth.nutritionists_last_30d) || 0,
      clients_linked_last_30d: Number(growth.clients_linked_last_30d) || 0,
    },
    rates: {
      avg_clients_per_practice:
        Number(rates.avg_clients_per_practice) ||
        (nutritionists > 0 ? Math.round((clients / nutritionists) * 10) / 10 : 0),
      profile_completion_pct:
        Number(rates.profile_completion_pct) ||
        (clients > 0 ? Math.round((profilesComplete / clients) * 100) : 0),
      active_client_pct:
        Number(rates.active_client_pct) ||
        (clients > 0 ? Math.round((activeClients / clients) * 100) : 0),
    },
    trends: {
      nutritionist_signups: raw?.trends?.nutritionist_signups || [],
      client_links: raw?.trends?.client_links || [],
    },
    specialty_breakdown: raw?.specialty_breakdown || [],
    recent_nutritionists: raw?.recent_nutritionists || [],
    recent_clients: raw?.recent_clients || [],
    top_practices: raw?.top_practices || [],
  };
}

export default function AdminOverview() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await adminApi.analytics();
      setData(normalizeAnalytics(result));
    } catch (e) {
      notifyError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notifyError]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="analytics-page">
        <div className="analytics-skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="analytics-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="analytics-page">
        <p className="analytics-empty">Unable to load analytics. Use Refresh or check the API.</p>
      </div>
    );
  }

  if (!data) return null;

  const t = data.totals;
  const g = data.growth;
  const r = data.rates;

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">Platform overview</p>
          <h1>SaaS analytics</h1>
          <p className="analytics-lede">
            Live metrics across all nutritionist practices on Good Gut Product.
          </p>
        </div>
        <div className="analytics-header-actions">
          <span className="analytics-timestamp">
            Updated{" "}
            {data.generated_at
              ? new Date(data.generated_at).toLocaleString()
              : "just now"}
          </span>
          <button
            type="button"
            className="btn btn-analytics-refresh"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <section className="analytics-kpi-row">
        <KpiCard
          label="Practices"
          value={t.nutritionists}
          sub={`+${g.nutritionists_last_30d} last 30 days`}
          accent="teal"
        />
        <KpiCard
          label="Total clients"
          value={t.clients}
          sub={`+${g.clients_linked_last_30d} linked last 30 days`}
          accent="blue"
        />
        <KpiCard
          label="Active clients"
          value={t.active_clients}
          sub={`${r.active_client_pct}% of all clients`}
          accent="green"
        />
        <KpiCard
          label="Profiles complete"
          value={t.profiles_complete}
          sub={`${r.profile_completion_pct}% onboarding rate`}
          accent="violet"
        />
      </section>

      <section className="analytics-grid-3">
        <div className="analytics-panel analytics-panel--rates">
          <h3>Engagement</h3>
          <RateBar label="Profile completion" pct={r.profile_completion_pct} color="#7c3aed" />
          <RateBar label="Active client rate" pct={r.active_client_pct} color="#059669" />
          <div className="analytics-stat-inline">
            <span>Avg clients per practice</span>
            <strong>{r.avg_clients_per_practice}</strong>
          </div>
        </div>

        <TrendChart
          title="Practice signups (6 mo)"
          series={data.trends?.nutritionist_signups || []}
          color="#0d9488"
        />
        <TrendChart
          title="Client links (6 mo)"
          series={data.trends?.client_links || []}
          color="#2563eb"
        />
      </section>

      <section className="admin-quick-links">
        <Link to="/admin/nutritionists" className="admin-quick-link card panel">
          <strong>Nutritionists</strong>
          <span>View all practices →</span>
        </Link>
        <Link to="/admin/clients" className="admin-quick-link card panel">
          <strong>Clients</strong>
          <span>Browse by practice →</span>
        </Link>
        <Link to="/admin/catalog" className="admin-quick-link card panel">
          <strong>Shop catalog</strong>
          <span>Manage products →</span>
        </Link>
      </section>

      <section className="analytics-grid-2">
        <div className="analytics-panel">
          <div className="admin-section-head-inline">
            <h3>Top practices by clients</h3>
            <Link to="/admin/nutritionists" className="admin-link">
              View all
            </Link>
          </div>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Practice</th>
                  <th>Clients</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {!data.top_practices?.length ? (
                  <tr>
                    <td colSpan={3} className="analytics-empty">
                      No practices yet.
                    </td>
                  </tr>
                ) : (
                  data.top_practices.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <Link to={`/admin/nutritionists/${n.id}`} className="admin-practice-link">
                          <strong>
                            {n.first_name} {n.last_name}
                          </strong>
                        </Link>
                        <span className="analytics-cell-sub">{n.specialty || "—"}</span>
                      </td>
                      <td>{n.client_count}</td>
                      <td>{n.active_clients ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-panel">
          <h3>Practice specialties</h3>
          {!data.specialty_breakdown?.length ? (
            <p className="analytics-empty">No specialty data yet.</p>
          ) : (
            <ul className="analytics-breakdown">
              {data.specialty_breakdown.map((s) => (
                <li key={s.specialty}>
                  <span>{s.specialty}</span>
                  <strong>{s.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="analytics-grid-2">
        <div className="analytics-panel">
          <h3>Recent practice signups</h3>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {!data.recent_nutritionists?.length ? (
                  <tr>
                    <td colSpan={3} className="analytics-empty">
                      No signups yet.
                    </td>
                  </tr>
                ) : (
                  data.recent_nutritionists.map((n, i) => (
                    <tr key={`${n.email}-${i}`}>
                      <td>
                        <strong>
                          {n.first_name} {n.last_name}
                        </strong>
                        <span className="analytics-cell-sub">{n.email}</span>
                      </td>
                      <td>{n.specialty || "—"}</td>
                      <td>{formatDate(n.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-panel">
          <h3>Recent client links</h3>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Practice</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!data.recent_clients?.length ? (
                  <tr>
                    <td colSpan={3} className="analytics-empty">
                      No client links yet.
                    </td>
                  </tr>
                ) : (
                  data.recent_clients.map((c, i) => (
                    <tr key={`${c.email}-${i}`}>
                      <td>
                        <strong>{c.name || c.email}</strong>
                        <span className="analytics-cell-sub">{c.email}</span>
                      </td>
                      <td>
                        {c.nutritionist_first_name} {c.nutritionist_last_name}
                      </td>
                      <td>
                        <span className={`analytics-pill analytics-pill--${c.status || "active"}`}>
                          {c.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
