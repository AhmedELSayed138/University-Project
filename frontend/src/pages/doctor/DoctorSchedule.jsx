import { useEffect, useState } from "react";
import { appointmentsApi } from "../../api/services";
import { Empty, ErrorMessage, Loading } from "../../components/Status.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    try {
      const data = await appointmentsApi.list();
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load schedule");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setError("");
    try {
      await appointmentsApi.updateStatus(id, status);
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update appointment");
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Doctor</p>
          <h2>My Schedule</h2>
        </div>
      </div>
      <ErrorMessage message={error} />
      {loading ? <Loading /> : appointments.length === 0 ? <Empty text="No appointments in your schedule." /> : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.patient_name}</td>
                  <td>{formatDateTime(item.start_time)}</td>
                  <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                  <td className="actions">
                    {item.status === "scheduled" && (
                      <>
                        <button className="success-btn" onClick={() => updateStatus(item.id, "completed")}>Complete</button>
                        <button className="danger" onClick={() => updateStatus(item.id, "cancelled")}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
