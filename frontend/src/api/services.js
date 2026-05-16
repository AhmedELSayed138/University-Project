import api from "./client";

export const authApi = {
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  register: (payload) => api.post("/auth/register", payload).then((res) => res.data),
  me: () => api.get("/auth/me").then((res) => res.data)
};

export const doctorsApi = {
  list: (params) => api.get("/doctors", { params }).then((res) => res.data),
  create: (payload) => api.post("/doctors", payload).then((res) => res.data),
  update: (id, payload) => api.put(`/doctors/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/doctors/${id}`).then((res) => res.data)
};

export const slotsApi = {
  list: (params) => api.get("/slots", { params }).then((res) => res.data),
  create: (payload) => api.post("/slots", payload).then((res) => res.data),
  remove: (id) => api.delete(`/slots/${id}`).then((res) => res.data)
};

export const appointmentsApi = {
  list: (params) => api.get("/appointments", { params }).then((res) => res.data),
  book: (payload) => api.post("/appointments", payload).then((res) => res.data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }).then((res) => res.data)
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((res) => res.data)
};

export const usersApi = {
  updateMe: (payload) => api.put("/users/me", payload).then((res) => res.data)
};
