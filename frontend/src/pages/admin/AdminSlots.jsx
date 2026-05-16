import { useEffect, useState } from "react";
import { doctorsApi, slotsApi } from "../../api/services";
import { Empty, ErrorMessage, Loading } from "../../components/Status.jsx";
import { formatDateTime, toInputDateTime } from "../../utils/format.js";

export default function AdminSlots() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctorId: "", startTime: toInputDateTime(), endTime: toInputDateTime(new Date(Date.now() + 30 * 60000)) });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([doctorsApi.list(), slotsApi.list()])
      .then(([doctorData, slotData]) => {
        setDoctors(doctorData.doctors);
        setSlots(slotData.slots);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load slots"))
      .finally(() => setLoading(false));
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function reloadSlots() {
    const data = await slotsApi.list();
    setSlots(data.slots);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await slotsApi.create(form);
      await reloadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create slot");
    }
  }

  async function deleteSlot(id) {
    try {
      await slotsApi.remove(id);
      await reloadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete slot");
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Admin</p>
          <h2>Manage Slots</h2>
        </div>
      </div>
      <ErrorMessage message={error} />
      <div className="split">
        <form className="card form" onSubmit={submit}>
          <h3>Create Slot</h3>
          <label>Doctor
            <select name="doctorId" value={form.doctorId} onChange={updateField} required>
              <option value="">Choose doctor</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select>
          </label>
          <label>Start<input type="datetime-local" name="startTime" value={form.startTime} onChange={updateField} required /></label>
          <label>End<input type="datetime-local" name="endTime" value={form.endTime} onChange={updateField} required /></label>
          <button className="primary">Create Slot</button>
        </form>

        {loading ? <Loading /> : slots.length === 0 ? <Empty text="No slots found." /> : (
          <div className="table-card">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Start</th><th>End</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id}>
                    <td>{slot.doctor_name}</td>
                    <td>{formatDateTime(slot.start_time)}</td>
                    <td>{formatDateTime(slot.end_time)}</td>
                    <td><span className={`badge ${slot.status}`}>{slot.status}</span></td>
                    <td>{slot.status === "available" && <button className="danger" onClick={() => deleteSlot(slot.id)}>Delete</button>}</td>
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
