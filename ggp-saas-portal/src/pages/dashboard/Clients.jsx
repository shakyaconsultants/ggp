import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNutritionist } from "../../context/NutritionistContext";
import { api } from "../../api/client";
import { isProfileComplete } from "../../utils/clientProfileLabels";
import { useApiFeedback } from "../../hooks/useApiFeedback";

function nameFromEmail(email) {
  const local = email.split("@")[0] || "Client";
  return local.replace(/[._+-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function generatePassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export default function Clients() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const { nutritionist } = useNutritionist();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editClient, setEditClient] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const load = () => {
    if (!nutritionist?.id) return;
    setLoading(true);
    api
      .nutritionistClients(nutritionist.id)
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch((e) => {
        notifyError(e);
        setClients([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [nutritionist?.id]);

  const handleGeneratePassword = () => {
    setPassword(generatePassword());
    setShowPassword(true);
  };

  const copyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Good Gut App Login\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      notifySuccess("Credentials copied to clipboard.");
    } catch {
      notifyError("Could not copy — please copy manually.");
    }
  };

  const registerClient = async (e) => {
    e.preventDefault();
        setCreatedCredentials(null);
    setSubmitting(true);
    try {
      const name = nameFromEmail(email);
      const result = await api.registerClient(nutritionist.id, {
        name,
        email: email.trim(),
        password,
        notes: notes || undefined,
      });
      setCreatedCredentials({ email: email.trim(), password, name });
      setEmail("");
      setPassword("");
      setNotes("");
      setShowForm(false);
      notifySuccess(
        `Account created for ${result.client?.email || email}. Share the login details — your client will complete their health profile in the app.`
      );
      load();
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateClient = async (e) => {
    e.preventDefault();
    try {
      await api.updateNutritionistClient(nutritionist.id, editClient, {
        notes: editNotes,
        status: editStatus,
      });
      notifySuccess("Client updated.");
      load();
    } catch (err) {
      notifyError(err);
    }
  };

  const removeClient = async (cid) => {
    if (!confirm("Remove this client from your practice? Their app account will remain.")) return;
    try {
      await api.removeNutritionistClient(nutritionist.id, cid);
      notifySuccess("Client removed from your practice.");
      load();
    } catch (err) {
      notifyError(err);
    }
  };

  const isProfileCompleteClient = (c) => isProfileComplete(c);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Clients</h1>
          <p className="muted">
            Create client login credentials. Clients sign into the app and complete their own health
            profile.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
                        setCreatedCredentials(null);
            if (!showForm && !password) handleGeneratePassword();
          }}
        >
          {showForm ? "Cancel" : "+ Add client"}
        </button>
      </header>
      {createdCredentials && (
        <div className="card panel credentials-card">
          <h3>Share with your client</h3>
          <p className="muted">
            They download the Good Gut app, log in with these details, then complete their profile
            in the app.
          </p>
          <div className="credentials-box">
            <div>
              <span className="cred-label">Email</span>
              <strong>{createdCredentials.email}</strong>
            </div>
            <div>
              <span className="cred-label">Password</span>
              <strong>{createdCredentials.password}</strong>
            </div>
          </div>
          <button type="button" className="btn btn-outline" onClick={copyCredentials}>
            Copy credentials
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={registerClient} className="card panel form client-form">
          <h2>Add client account</h2>
          <p className="muted form-hint">
            Enter the client&apos;s email and set a password. No health profile needed here — the
            client completes that after logging into the mobile app.
          </p>

          <label>
            Client email *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
            />
          </label>

          <label>
            App login password * (min 6 characters)
            <div className="password-row">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="btn btn-outline" onClick={handleGeneratePassword}>
                Generate
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label>
            Internal notes (optional — only visible to you)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Referred by Dr. Smith"
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating account…" : "Create client account"}
          </button>
        </form>
      )}

      <form onSubmit={updateClient} className="card panel form form-row compact-form">
        <select value={editClient} onChange={(e) => setEditClient(e.target.value)}>
          <option value="">Update client status / notes</option>
          {clients.map((c) => (
            <option key={c.client_id} value={c.client_id}>
              {c.name || c.email}
            </option>
          ))}
        </select>
        <input
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes"
        />
        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <button type="submit" className="btn btn-outline" disabled={!editClient}>
          Update
        </button>
      </form>

      <div className="table-wrap card panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>App profile</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  Loading clients…
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  No clients yet. Add your first client above.
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.client_id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>
                    <span
                      className={`status-badge ${isProfileCompleteClient(c) ? "status-active" : "status-pending"}`}
                    >
                      {isProfileCompleteClient(c) ? "Complete" : "Pending in app"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${c.status || "active"}`}>
                      {c.status || "active"}
                    </span>
                  </td>
                  <td className="table-actions">
                    <Link
                      to={`/dashboard/clients/${c.client_id}`}
                      className="btn btn-outline btn-sm"
                    >
                      View profile
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeClient(c.client_id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
