import { useState } from "react";
import { usersApi } from "../../api/services";
import { ErrorMessage } from "../../components/Status.jsx";
import { useAuth } from "../../state/AuthContext.jsx";

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await usersApi.updateMe(form);
      setUser(data.user);
      localStorage.setItem("smartClinicUser", JSON.stringify(data.user));
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    }
  }

  return (
    <section className="page narrow">
      <div className="page-title">
        <div>
          <p className="muted">Patient</p>
          <h2>Profile</h2>
        </div>
      </div>
      <form className="card form" onSubmit={submit}>
        <label>Name<input name="name" value={form.name} onChange={updateField} /></label>
        <label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label>
        <label>Location<input name="location" value={form.location} onChange={updateField} /></label>
        <label>Medical Notes<textarea name="bio" value={form.bio} onChange={updateField} rows="4" /></label>
        <ErrorMessage message={error} />
        {message && <div className="success">{message}</div>}
        <button className="primary">Save Profile</button>
      </form>
    </section>
  );
}
