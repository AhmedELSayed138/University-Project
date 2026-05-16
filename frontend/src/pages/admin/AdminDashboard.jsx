import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/services";
import { ErrorMessage, Loading } from "../../components/Status.jsx";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.stats()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard"));
  }, []);

  if (!data && !error) return <Loading />;

  const statCards = data ? [
    ["Doctors", data.stats.totalDoctors],
    ["Patients", data.stats.totalPatients],
    ["Available Slots", data.stats.availableSlots],
    ["Appointments", data.stats.totalAppointments],
    ["Scheduled", data.stats.scheduled],
    ["Completed", data.stats.completed],
    ["Cancelled", data.stats.cancelled]
  ] : [];

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Admin</p>
          <h2>Clinic Dashboard</h2>
        </div>
      </div>
      <ErrorMessage message={error} />
      <div className="stats-grid">
        {statCards.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {data?.recent.map((item) => (
            <p key={item.id}>
              {item.patient_name} with {item.doctor_name} is <strong>{item.status}</strong>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
