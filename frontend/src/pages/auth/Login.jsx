import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/AuthContext.jsx";
import { routeForRole } from "../../utils/format.js";
import { ErrorMessage } from "../../components/Status.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "patient" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      navigate(routeForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h1>Smart Clinic</h1>
        <p className="muted">Sign in to manage appointments, doctors and schedules.</p>
        <form onSubmit={submit} className="form">
          <label>
            Role
            <select name="role" value={form.role} onChange={updateField}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} required />
          </label>
          <ErrorMessage message={error} />
          <button disabled={loading} className="primary">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="muted">No account? <Link to="/register">Create patient account</Link></p>
      </div>
    </section>
  );
}
