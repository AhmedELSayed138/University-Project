export function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function toInputDateTime(value) {
  const date = value ? new Date(value) : new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function routeForRole(role) {
  return {
    patient: "/patient/doctors",
    doctor: "/doctor/schedule",
    admin: "/admin/dashboard"
  }[role] || "/login";
}
