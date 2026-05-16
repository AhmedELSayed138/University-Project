import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PatientDoctors from "./pages/patient/PatientDoctors.jsx";
import PatientAppointments from "./pages/patient/PatientAppointments.jsx";
import PatientProfile from "./pages/patient/PatientProfile.jsx";
import DoctorSchedule from "./pages/doctor/DoctorSchedule.jsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDoctors from "./pages/admin/AdminDoctors.jsx";
import AdminSlots from "./pages/admin/AdminSlots.jsx";
import AdminAppointments from "./pages/admin/AdminAppointments.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={["patient"]} />}>
        <Route element={<Layout role="patient" />}>
          <Route path="/patient" element={<Navigate to="/patient/doctors" replace />} />
          <Route path="/patient/doctors" element={<PatientDoctors />} />
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["doctor"]} />}>
        <Route element={<Layout role="doctor" />}>
          <Route path="/doctor" element={<Navigate to="/doctor/schedule" replace />} />
          <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<Layout role="admin" />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/slots" element={<AdminSlots />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
