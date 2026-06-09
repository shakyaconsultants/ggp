import { apiRequest } from "./http";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function getAdminToken() {
  return localStorage.getItem("saas_admin_token");
}

export function setAdminToken(token) {
  if (token) localStorage.setItem("saas_admin_token", token);
  else localStorage.removeItem("saas_admin_token");
}

function adminRequest(path, options = {}) {
  return apiRequest(API_BASE, path, {
    ...options,
    tokenGetter: getAdminToken,
    onUnauthorized: () => {
      window.dispatchEvent(new CustomEvent("saas:admin-auth-expired"));
    },
  });
}

export const adminApi = {
  login: (body) =>
    adminRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),
  analytics: () => adminRequest("/admin/analytics"),
  nutritionists: () => adminRequest("/admin/nutritionists"),
  nutritionist: (id) => adminRequest(`/admin/nutritionists/${id}`),
  clients: (nutritionistId, status) => {
    const params = new URLSearchParams({ nutritionist_id: String(nutritionistId) });
    if (status) params.set("status", status);
    return adminRequest(`/admin/clients?${params}`);
  },
  products: () => adminRequest("/admin/products"),
  createProduct: (body) =>
    adminRequest("/admin/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    adminRequest(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) =>
    adminRequest(`/admin/products/${id}`, { method: "DELETE" }),
};
