import { Link, Outlet, useLocation } from "react-router-dom";
import { NavIcon } from "../components/NavIcon";
import { useNutritionist } from "../context/NutritionistContext";
import { formatInr } from "../utils/billingFormat";

const NAV_GROUPS = [
  {
    label: "Practice",
    items: [
      { to: "/dashboard/clients", label: "Clients", icon: "clients" },
      { to: "/dashboard/slots", label: "Slots", icon: "slots" },
      { to: "/dashboard/calls", label: "Video calls", icon: "calls" },
    ],
  },
  {
    label: "Nutrition",
    items: [
      { to: "/dashboard/diet-plans", label: "Diet plans", icon: "diet-plans" },
      { to: "/dashboard/diet-templates", label: "Diet templates", icon: "templates" },
      { to: "/dashboard/food-templates", label: "Food templates", icon: "templates" },
      { to: "/dashboard/food-items", label: "Food catalog", icon: "food" },
      { to: "/dashboard/exercises", label: "Exercises", icon: "exercises" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/dashboard/profile", label: "Profile", icon: "profile" },
      { to: "/dashboard/billing", label: "Billing", icon: "billing" },
    ],
  },
];

const PAGE_TITLES = {
  "/dashboard/clients": "Clients",
  "/dashboard/slots": "Consultation slots",
  "/dashboard/calls": "Video calls",
  "/dashboard/diet-plans": "Diet plans",
  "/dashboard/diet-templates": "Diet templates",
  "/dashboard/food-templates": "Food templates",
  "/dashboard/food-items": "Food catalog",
  "/dashboard/exercises": "Exercises",
  "/dashboard/profile": "Your profile",
  "/dashboard/billing": "Billing & subscription",
};

function getPageTitle(pathname) {
  if (pathname.startsWith("/dashboard/clients/")) return "Client profile";
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + "/")) return title;
  }
  return "Dashboard";
}

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(to + "/");
}

export default function DashboardLayout({ nutritionist, onLogout }) {
  const location = useLocation();
  const { isTrialing, nutritionist: ctxNutritionist } = useNutritionist();
  const n = nutritionist || ctxNutritionist;
  const pageTitle = getPageTitle(location.pathname);
  const initials = `${n?.first_name?.[0] || ""}${n?.last_name?.[0] || ""}`.toUpperCase() || "N";

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <Link to="/" className="sidebar-logo">
            <span className="logo-mark">GG</span>
            <span className="sidebar-brand-text">
              Good Gut <em>Product</em>
            </span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="sidebar-group">
              <span className="sidebar-group-label">{group.label}</span>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    isActive(location.pathname, item.to)
                      ? "sidebar-link active"
                      : "sidebar-link"
                  }
                >
                  <span className="sidebar-icon">
                    <NavIcon name={item.icon} size={18} />
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <strong>
                {n?.first_name} {n?.last_name}
              </strong>
              <span>{n?.email}</span>
            </div>
          </div>
          <button type="button" className="btn btn-sidebar-logout" onClick={onLogout}>
            <NavIcon name="logout" size={16} />
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="topbar-eyebrow">Dashboard</p>
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>
          {nutritionist?.current_organisation && (
            <span className="topbar-practice">{n.current_organisation}</span>
          )}
        </header>
        <main className="dashboard-main">
          {isTrialing && (
            <div className="trial-banner" role="status">
              Free trial · {n?.days_remaining ?? "—"} day
              {(n?.days_remaining ?? 0) === 1 ? "" : "s"} left · then{" "}
              {formatInr(n?.annual_price_inr ?? 1000)}/year —{" "}
              <Link to="/dashboard/billing">Manage billing</Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
