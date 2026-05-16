import { useEffect, useState } from "react";
import { appointmentsApi, doctorsApi, slotsApi } from "../../api/services";
import { Empty, ErrorMessage, Loading } from "../../components/Status.jsx";
import { formatDateTime } from "../../utils/format.js";

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors(params = {}) {
    setLoading(true);
    try {
      const data = await doctorsApi.list(params);
      setDoctors(data.doctors);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load doctors");
    } finally {
      setLoading(false);
    }
  }

  async function openDoctor(doctor) {
    setSelectedDoctor(doctor);
    setError("");
    try {
      const data = await slotsApi.list({ doctorId: doctor.id });
      setSlots(data.slots.filter((slot) => slot.status === "available" && new Date(slot.start_time) > new Date()));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load slots");
    }
  }

  async function book(slotId) {
    setError("");
    try {
      await appointmentsApi.book({ slotId });
      setSelectedDoctor(null);
      await loadDoctors({ search });
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    loadDoctors({ search });
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <p className="muted">Patient</p>
          <h2>Browse Doctors</h2>
        </div>
        <form onSubmit={submitSearch} className="inline-form">
          <input placeholder="Search doctors or specialization" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="primary">Search</button>
        </form>
      </div>

      <ErrorMessage message={error} />
      {loading ? <Loading /> : doctors.length === 0 ? <Empty text="No doctors found." /> : (
        <div className="cards">
          {doctors.map((doctor) => (
            <article className="card" key={doctor.id}>
              <div className="avatar">{doctor.name.slice(0, 2).toUpperCase()}</div>
              <h3>{doctor.name}</h3>
              <p className="tag">{doctor.specialization}</p>
              <p className="muted">{doctor.bio || "Clinic specialist"}</p>
              <p><strong>{doctor.available_slots}</strong> available slots</p>
              <button className="primary" onClick={() => openDoctor(doctor)}>View Slots</button>
            </article>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{selectedDoctor.name}</h2>
                <p className="muted">{selectedDoctor.specialization}</p>
              </div>
              <button className="ghost" onClick={() => setSelectedDoctor(null)}>Close</button>
            </div>
            {slots.length === 0 ? <Empty text="No available slots for this doctor." /> : (
              <div className="slot-list">
                {slots.map((slot) => (
                  <div className="slot-row" key={slot.id}>
                    <span>{formatDateTime(slot.start_time)}</span>
                    <button className="primary" onClick={() => book(slot.id)}>Book</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
