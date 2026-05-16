import { useAuth } from "../../state/AuthContext.jsx";

export default function DoctorProfile() {
  const { user } = useAuth();

  return (
    <section className="page narrow">
      <div className="profile-hero">
        <div className="avatar large">{user.name.slice(0, 2).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p className="tag">{user.specialization || "Doctor"}</p>
        <p className="muted">{user.bio || "No profile bio yet."}</p>
      </div>
      <div className="card details-grid">
        <div><span>Email</span><strong>{user.email}</strong></div>
        <div><span>Phone</span><strong>{user.phone || "Not set"}</strong></div>
        <div><span>Location</span><strong>{user.location || "Not set"}</strong></div>
      </div>
    </section>
  );
}
