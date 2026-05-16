import { useEffect, useState } from "react";
import { appointmentsApi } from "../../api/services";
import { Empty, ErrorMessage, Loading } from "../../components/Status.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function PatientAppointments() {
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
      setError(err.response?.data?.message || "Could not load appointments");
    } finally {
      setLoading(false);
    }
  }

  async function cancelAppointment(id) {
    try {
      await appointmentsApi.updateStatus(id, "cancelled");
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel appointment");
    }
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Patient</p>
          <h2>My Appointments</h2>
        </div>
      </div>
      <ErrorMessage message={error} />
      {loading ? <Loading /> : appointments.length === 0 ? <Empty text="No appointments yet." /> : (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.doctor_name}</td>
                  <td>{item.specialization}</td>
                  <td>{formatDateTime(item.start_time)}</td>
                  <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                  <td>
                    {item.status === "scheduled" && (
                      <button className="danger" onClick={() => cancelAppointment(item.id)}>Cancel</button>
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
