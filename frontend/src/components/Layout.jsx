import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

const links = {
  patient: [
    ["Doctors", "/patient/doctors"],
    ["Appointments", "/patient/appointments"],
    ["Profile", "/patient/profile"]
  ],
  doctor: [
    ["Schedule", "/doctor/schedule"],
    ["Profile", "/doctor/profile"]
  ],
  admin: [
    ["Dashboard", "/admin/dashboard"],
    ["Doctors", "/admin/doctors"],
    ["Slots", "/admin/slots"],
    ["Appointments", "/admin/appointments"]
  ]
};

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">SC</span>
          <div>
            <strong>Smart Clinic</strong>
            <small>{role}</small>
          </div>
        </div>
        <nav className="side-nav">
          {links[role].map(([label, to]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost full" onClick={signOut}>Logout</button>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <p className="muted">Welcome back</p>
            <h1>{user?.name}</h1>
          </div>
          <span className="pill">{user?.role}</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
