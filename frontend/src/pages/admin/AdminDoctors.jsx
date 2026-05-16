import { useEffect, useState } from "react";
import { doctorsApi } from "../../api/services";
import { Empty, ErrorMessage, Loading } from "../../components/Status.jsx";

const emptyDoctor = {
  name: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
  bio: "",
  location: "",
  status: "active"
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyDoctor);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    setLoading(true);
    try {
      const data = await doctorsApi.list();
      setDoctors(data.doctors);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load doctors");
    } finally {
      setLoading(false);
    }
  }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function editDoctor(doctor) {
    setEditingId(doctor.id);
    setForm({ ...doctor, password: "" });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await doctorsApi.update(editingId, form);
      } else {
        await doctorsApi.create(form);
      }
      setEditingId(null);
      setForm(emptyDoctor);
      await loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save doctor");
    }
  }

  async function removeDoctor(id) {
    if (!confirm("Deactivate this doctor?")) return;
    await doctorsApi.remove(id);
    await loadDoctors();
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Admin</p>
          <h2>Manage Doctors</h2>
        </div>
      </div>
      <ErrorMessage message={error} />
      <div className="split">
        <form className="card form" onSubmit={submit}>
          <h3>{editingId ? "Edit Doctor" : "Add Doctor"}</h3>
          <label>Name<input name="name" value={form.name || ""} onChange={updateField} required /></label>
          <label>Email<input name="email" type="email" value={form.email || ""} onChange={updateField} required /></label>
          {!editingId && <label>Password<input name="password" type="password" value={form.password} onChange={updateField} required /></label>}
          <label>Specialization<input name="specialization" value={form.specialization || ""} onChange={updateField} required /></label>
          <label>Phone<input name="phone" value={form.phone || ""} onChange={updateField} /></label>
          <label>Location<input name="location" value={form.location || ""} onChange={updateField} /></label>
          <label>Bio<textarea name="bio" value={form.bio || ""} onChange={updateField} /></label>
          {editingId && (
            <label>Status
              <select name="status" value={form.status || "active"} onChange={updateField}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          )}
          <button className="primary">{editingId ? "Update Doctor" : "Create Doctor"}</button>
          {editingId && <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(emptyDoctor); }}>Cancel Edit</button>}
        </form>

        {loading ? <Loading /> : doctors.length === 0 ? <Empty text="No doctors found." /> : (
          <div className="table-card">
            <table>
              <thead>
                <tr><th>Name</th><th>Specialization</th><th>Email</th><th>Slots</th><th></th></tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.available_slots}</td>
                    <td className="actions">
                      <button className="ghost" onClick={() => editDoctor(doctor)}>Edit</button>
                      <button className="danger" onClick={() => removeDoctor(doctor.id)}>Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
