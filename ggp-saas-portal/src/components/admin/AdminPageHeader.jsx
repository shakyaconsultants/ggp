import { Link } from "react-router-dom";

export default function AdminPageHeader({ title, description, badge, actions }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      <div className="admin-page-header-right">
        {badge != null && <span className="admin-count-badge">{badge}</span>}
        {actions}
      </div>
    </header>
  );
}

export function AdminStatStrip({ items }) {
  return (
    <div className="admin-stat-strip">
      {items.map((item) => (
        <div key={item.label} className="admin-stat-strip-item">
          <span className="admin-stat-strip-value">{item.value}</span>
          <span className="admin-stat-strip-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function PracticeAvatar({ person, size = "md" }) {
  return (
    <span className={`admin-practice-avatar admin-practice-avatar--${size}`}>
      {(person?.first_name?.[0] || person?.email?.[0] || "?").toUpperCase()}
      {(person?.last_name?.[0] || "").toUpperCase()}
    </span>
  );
}

export function AdminBackLink({ to, children = "← Back" }) {
  return (
    <Link to={to} className="admin-back-link">
      {children}
    </Link>
  );
}
