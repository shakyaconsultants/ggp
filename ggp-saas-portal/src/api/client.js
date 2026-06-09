import { apiRequest } from "./http";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function getToken() {
  return localStorage.getItem("saas_nutritionist_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("saas_nutritionist_token", token);
  else localStorage.removeItem("saas_nutritionist_token");
}

function request(path, options = {}) {
  const { auth = true, ...rest } = options;
  return apiRequest(API_BASE, path, {
    ...rest,
    auth,
    tokenGetter: getToken,
    onUnauthorized: () => {
      window.dispatchEvent(new CustomEvent("saas:auth-expired"));
    },
  });
}

const pub = { auth: false };
const nut = { auth: true };

export const api = {
  nutritionistSignup: (body) =>
    request("/nutritionists/signup", { method: "POST", body: JSON.stringify(body), ...pub }),
  nutritionistLogin: (body) =>
    request("/nutritionists/login", { method: "POST", body: JSON.stringify(body), ...pub }),
  updateNutritionist: (id, body) =>
    request(`/nutritionists/${id}`, { method: "PUT", body: JSON.stringify(body), ...pub }),

  nutritionistClients: (id) => request(`/nutritionists/${id}/clients`, nut),
  clientProfile: (nutritionistId, clientId) =>
    request(`/nutritionists/${nutritionistId}/clients/${clientId}/profile`, nut),
  updateNutritionistClient: (nid, cid, body) =>
    request(`/nutritionists/${nid}/clients/${cid}`, {
      method: "PUT",
      body: JSON.stringify(body),
      ...nut,
    }),
  removeNutritionistClient: (nid, cid) =>
    request(`/nutritionists/${nid}/clients/${cid}`, { method: "DELETE", ...nut }),

  registerClient: (nutritionistId, body) =>
    request(`/saas/nutritionists/${nutritionistId}/clients/signup`, {
      method: "POST",
      body: JSON.stringify(body),
      ...nut,
    }),

  updateSlots: (body) =>
    request("/nutritionist/slots", { method: "POST", body: JSON.stringify(body), ...nut }),
  getSlots: (nutritionistId, date) =>
    request(`/nutritionist/slots/${nutritionistId}/${date}`, nut),

  createFoodTemplate: (body) =>
    request("/foodtemplates", { method: "POST", body: JSON.stringify(body), ...nut }),
  foodTemplates: (nutritionistId) =>
    request(`/foodtemplates/nutritionist/${nutritionistId}`, nut),
  foodTemplate: (id) => request(`/foodtemplates/${id}`, nut),
  updateFoodTemplate: (id, body) =>
    request(`/foodtemplates/${id}`, { method: "PUT", body: JSON.stringify(body), ...nut }),
  deleteFoodTemplate: (id) => request(`/foodtemplates/${id}`, { method: "DELETE", ...nut }),

  createDietPlan: (body) =>
    request("/dietplans", { method: "POST", body: JSON.stringify(body), ...nut }),
  dietPlans: (nutritionistId) => request(`/dietplans/nutritionist/${nutritionistId}`, nut),
  dietPlan: (id) => request(`/dietplans/${id}`, nut),
  updateDietPlan: (id, body) =>
    request(`/dietplans/${id}`, { method: "PUT", body: JSON.stringify(body), ...nut }),
  deleteDietPlan: (id) => request(`/dietplans/${id}`, { method: "DELETE", ...nut }),

  createDietTemplate: (body) =>
    request("/diettemplates", { method: "POST", body: JSON.stringify(body), ...nut }),
  dietTemplates: (nutritionistId) =>
    request(`/diettemplates/nutritionist/${nutritionistId}`, nut),
  dietTemplate: (id) => request(`/diettemplates/${id}`, nut),
  updateDietTemplate: (id, body) =>
    request(`/diettemplates/${id}`, { method: "PUT", body: JSON.stringify(body), ...nut }),
  deleteDietTemplate: (id) => request(`/diettemplates/${id}`, { method: "DELETE", ...nut }),

  foodItems: (nutritionistId, mealType) => {
    const params = new URLSearchParams({ nutritionist_id: String(nutritionistId) });
    const path = mealType ? `/fooditems/${mealType}?${params}` : `/fooditems?${params}`;
    return request(path, pub);
  },
  createFoodItem: (body) =>
    request("/fooditems", { method: "POST", body: JSON.stringify(body), ...pub }),
  updateFoodItem: (id, body) =>
    request(`/fooditems/${id}`, { method: "PUT", body: JSON.stringify(body), ...pub }),
  deleteFoodItem: (id) => request(`/fooditems/${id}`, { method: "DELETE", ...pub }),

  exercises: (nutritionistId) => request(`/nutritionists/${nutritionistId}/exercises`, nut),
  createExercise: (nutritionistId, body) =>
    request(`/nutritionists/${nutritionistId}/exercises`, {
      method: "POST",
      body: JSON.stringify(body),
      ...nut,
    }),
  updateExercise: (nutritionistId, exerciseId, body) =>
    request(`/nutritionists/${nutritionistId}/exercises/${exerciseId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      ...nut,
    }),
  deleteExercise: (nutritionistId, exerciseId) =>
    request(`/nutritionists/${nutritionistId}/exercises/${exerciseId}`, {
      method: "DELETE",
      ...nut,
    }),
  clientExerciseAssignments: (nutritionistId, clientId) =>
    request(`/nutritionists/${nutritionistId}/clients/${clientId}/exercises`, nut),
  assignClientExercise: (nutritionistId, clientId, body) =>
    request(`/nutritionists/${nutritionistId}/clients/${clientId}/exercises`, {
      method: "POST",
      body: JSON.stringify(body),
      ...nut,
    }),
  unassignClientExercise: (nutritionistId, clientId, assignmentId) =>
    request(
      `/nutritionists/${nutritionistId}/clients/${clientId}/exercises/${assignmentId}`,
      { method: "DELETE", ...nut }
    ),

  billingPlans: () => request("/billing/plans", pub),
  billingStatus: () => request("/billing/status", nut),
  billingCreateOrder: () => request("/billing/create-order", { method: "POST", ...nut }),
  billingVerifyPayment: (body) =>
    request("/billing/verify-payment", {
      method: "POST",
      body: JSON.stringify(body),
      ...nut,
    }),
  billingOverview: () => request("/billing/overview", nut),
  billingInvoice: (id) => request(`/billing/invoices/${id}`, nut),

  chatMessages: (nutritionistId, clientId, limit) => {
    const q = limit ? `?limit=${encodeURIComponent(limit)}` : "";
    return request(
      `/nutritionists/${nutritionistId}/clients/${clientId}/chat/messages${q}`,
      nut
    );
  },
  sendChatMessage: (nutritionistId, clientId, body) =>
    request(`/nutritionists/${nutritionistId}/clients/${clientId}/chat/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
      ...nut,
    }),
  markChatRead: (nutritionistId, clientId) =>
    request(`/nutritionists/${nutritionistId}/clients/${clientId}/chat/read`, {
      method: "POST",
      ...nut,
    }),

  nutritionistCalls: (nutritionistId) =>
    request(`/nutritionists/${nutritionistId}/calls`, nut),
  callJoinInfo: (nutritionistId, callId) =>
    request(`/nutritionists/${nutritionistId}/calls/${callId}/join`, nut),
  updateNutritionistCall: (nutritionistId, callId, body) =>
    request(`/nutritionists/${nutritionistId}/calls/${callId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      ...nut,
    }),
};
