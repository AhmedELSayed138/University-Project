import { useEffect, useState } from "react";
import { appointmentsApi } from "../../api/services";
import { Empty, ErrorMessage, Loading } from "../../components/Status.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, [status]);

  async function loadAppointments() {
    setLoading(true);
    try {
      const data = await appointmentsApi.list(status ? { status } : {});
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load appointments");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Admin</p>
          <h2>All Appointments</h2>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <ErrorMessage message={error} />
      {loading ? <Loading /> : appointments.length === 0 ? <Empty text="No appointments found." /> : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.patient_name}</td>
                  <td>{item.doctor_name}</td>
                  <td>{item.specialization}</td>
                  <td>{formatDateTime(item.start_time)}</td>
                  <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
