import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorMessage } from "../../components/Status.jsx";
import { useAuth } from "../../state/AuthContext.jsx";
import { routeForRole } from "../../utils/format.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "patient" });
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
      const user = await register(form);
      navigate(routeForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h1>Create Account</h1>
        <p className="muted">Patient self-registration. Doctors are created by admins.</p>
        <form onSubmit={submit} className="form">
          <label>
            Full Name
            <input name="name" value={form.name} onChange={updateField} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={updateField} />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} required minLength="8" />
          </label>
          <ErrorMessage message={error} />
          <button disabled={loading} className="primary">{loading ? "Creating..." : "Create Account"}</button>
        </form>
        <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </section>
  );
}
