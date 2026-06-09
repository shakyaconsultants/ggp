import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNutritionist } from "../context/NutritionistContext";
import { useApiFeedback } from "../hooks/useApiFeedback";
import { AuthHeader, AuthLayout } from "../components/AuthLayout";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    specialty: "",
    years_of_experience: "",
    current_organisation: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useNutritionist();
  const { notifyError, notifySuccess } = useApiFeedback();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup({
        ...form,
        years_of_experience: form.years_of_experience
          ? Number(form.years_of_experience)
          : undefined,
      });
      notifySuccess("Welcome! Your 15-day free trial has started.");
      navigate("/dashboard");
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout wide>
      <AuthHeader
        title="Create your account"
        subtitle="Start your Good Gut Product practice in minutes."
      />
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>
            First name *
            <input name="first_name" value={form.first_name} onChange={handleChange} required />
          </label>
          <label>
            Last name *
            <input name="last_name" value={form.last_name} onChange={handleChange} required />
          </label>
        </div>
        <label>
          Email *
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password * (min 6 characters)
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </label>
        <div className="form-row">
          <label>
            Phone
            <input name="phone_number" value={form.phone_number} onChange={handleChange} />
          </label>
          <label>
            Specialty
            <input
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              placeholder="Clinical nutrition"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Years of experience
            <input
              type="number"
              name="years_of_experience"
              value={form.years_of_experience}
              onChange={handleChange}
              min={0}
            />
          </label>
          <label>
            Practice name
            <input
              name="current_organisation"
              value={form.current_organisation}
              onChange={handleChange}
            />
          </label>
        </div>
        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account…" : "Start 15-day free trial"}
        </button>
      </form>
      <p className="auth-footer muted">
        Includes full dashboard + client app access for 15 days. Then ₹1,000/year via Razorpay.
      </p>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
