import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNutritionist } from "../context/NutritionistContext";
import { useApiFeedback } from "../hooks/useApiFeedback";
import { AuthHeader, AuthLayout } from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useNutritionist();
  const { notifyError } = useApiFeedback();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Welcome back" subtitle="Sign in to your practice dashboard." />
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-footer">
        New here? <Link to="/register">Create an account</Link>
        <br />
        <Link to="/">← Back to home</Link>
      </p>
    </AuthLayout>
  );
}
