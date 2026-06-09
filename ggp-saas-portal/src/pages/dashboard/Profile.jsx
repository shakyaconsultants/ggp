import { useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import { useApiFeedback } from "../../hooks/useApiFeedback";

export default function Profile() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist, setNutritionist } = useNutritionist();
  const [form, setForm] = useState({
    first_name: nutritionist?.first_name || "",
    last_name: nutritionist?.last_name || "",
    specialty: nutritionist?.specialty || "",
    phone_number: nutritionist?.phone_number || "",
    current_organisation: nutritionist?.current_organisation || "",
    address: nutritionist?.address || "",
  });

  const save = async (e) => {
    e.preventDefault();
    if (!nutritionist?.id) {
      notifyError("Session expired. Please sign in again.");
      return;
    }
    try {
      await api.updateNutritionist(nutritionist.id, form);
      setNutritionist({ ...nutritionist, ...form });
      notifySuccess("Profile updated.");
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Profile</h1>
        <p className="muted">Your professional details visible in your practice.</p>
      </header>
      <form onSubmit={save} className="card panel form grid-2">
        <label>
          First name
          <input
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </label>
        <label>
          Last name
          <input
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </label>
        <label>
          Specialty
          <input
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          />
        </label>
        <label>
          Practice / Organisation
          <input
            value={form.current_organisation}
            onChange={(e) => setForm({ ...form, current_organisation: e.target.value })}
          />
        </label>
        <label>
          Address
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <div className="form-full">
          <p className="muted">
            Email: <strong>{nutritionist?.email}</strong> (cannot be changed here)
          </p>
        </div>
        <button type="submit" className="btn btn-primary">
          Save profile
        </button>
      </form>
    </div>
  );
}
