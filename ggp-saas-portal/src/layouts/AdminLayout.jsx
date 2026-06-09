import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

const NAV = [
  {
    label: "Analytics",
    links: [{ to: "/admin", label: "Overview", end: true }],
  },
  {
    label: "Tenants",
    links: [
      { to: "/admin/nutritionists", label: "Nutritionists" },
      { to: "/admin/clients", label: "Clients" },
    ],
  },
  {
    label: "Commerce",
    links: [{ to: "/admin/catalog", label: "Shop catalog" }],
  },
];

function AdminLayout({ onLogout }) {
  const location = useLocation();
  const { admin } = useAdmin();

  const isActive = (link) =>
    link.end ? location.pathname === link.to : location.pathname.startsWith(link.to);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link to="/" className="admin-brand">
            <span className="brand-mark">GG</span>
            <span>
              Good Gut <em>Admin</em>
            </span>
          </Link>
        </div>
        <nav className="admin-nav">
          {NAV.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <span className="admin-nav-group-label">{group.label}</span>
              {group.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={isActive(link) ? "admin-nav-link active" : "admin-nav-link"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-chip">
            <strong>{admin?.name || "Platform admin"}</strong>
            <span>{admin?.email}</span>
          </div>
          <button type="button" className="btn btn-admin-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminGate() {
  const { isAuthenticated, loading, logout } = useAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-screen admin-loading-screen">
        <p>Loading admin…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout
      onLogout={() => {
        logout();
        navigate("/admin/login");
      }}
    />
  );
}
