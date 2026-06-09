import { Link } from "react-router-dom";

export function AuthBrand() {
  return (
    <Link to="/" className="auth-brand">
      <span className="brand-mark">GG</span>
      <span className="brand-text">
        Good Gut <em>Product</em>
      </span>
    </Link>
  );
}

export function AuthLayout({ children, wide }) {
  return (
    <div className="auth-split">
      <aside className="auth-split-panel">
        <AuthBrand />
        <h2>Run your nutrition practice with confidence</h2>
        <p>
          Register clients, build diet plans, manage consultations, and deliver care
          through the Good Gut mobile app — all from one professional dashboard.
        </p>
        <ul className="auth-split-features">
          <li>Unlimited client accounts</li>
          <li>Diet & food template library</li>
          <li>Exercise assignment to clients</li>
          <li>Mobile app sync for your clients</li>
        </ul>
      </aside>
      <main className={`auth-split-main${wide ? " auth-split-main-wide" : ""}`}>
        <div className={`auth-card${wide ? " auth-card-wide auth-card-flat" : " auth-card-flat"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthHeader({ title, subtitle }) {
  return (
    <header className="auth-header">
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </header>
  );
}
