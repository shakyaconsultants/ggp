import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import { AuthBrand } from "../../components/AuthLayout";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAdmin();
  const { notifyError } = useApiFeedback();
  const navigate = useNavigate();

  if (!loading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <AuthBrand />
        <h1>Platform admin</h1>
        <p className="muted">SaaS analytics and shop catalog for Good Gut Product.</p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Admin email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/">← Back to marketing site</Link>
          {" · "}
          <Link to="/login">Nutritionist login</Link>
        </p>
      </div>
    </div>
  );
}
