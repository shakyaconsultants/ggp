import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getToken, setToken } from "../api/client";
import { createApiError } from "../utils/errors";

const NutritionistContext = createContext(null);

function clearStoredSession() {
  setToken(null);
  localStorage.removeItem("saas_nutritionist");
}

function mergeSubscription(profile, status) {
  if (!profile) return null;
  return {
    ...profile,
    subscription_active: status?.allowed ?? profile.subscription_active,
    subscription_status: status?.status ?? profile.subscription_status,
    trial_ends_at: status?.trial_ends_at ?? profile.trial_ends_at,
    subscription_ends_at: status?.subscription_ends_at ?? profile.subscription_ends_at,
    days_remaining: status?.days_remaining ?? profile.days_remaining,
    annual_price_inr: status?.annual_price_inr ?? profile.annual_price_inr,
  };
}

export function NutritionistProvider({ children }) {
  const [nutritionist, setNutritionist] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredSession();
    setNutritionist(null);
  }, []);

  const refreshSubscription = useCallback(async () => {
    const status = await api.billingStatus();
    setNutritionist((prev) => {
      const merged = mergeSubscription(prev, status);
      if (merged) {
        localStorage.setItem("saas_nutritionist", JSON.stringify(merged));
      }
      return merged;
    });
    return status;
  }, []);

  useEffect(() => {
    const onAuthExpired = () => logout();
    window.addEventListener("saas:auth-expired", onAuthExpired);
    return () => window.removeEventListener("saas:auth-expired", onAuthExpired);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getToken();
      const raw = localStorage.getItem("saas_nutritionist");

      if (!token || !raw) {
        clearStoredSession();
        if (!cancelled) {
          setNutritionist(null);
          setLoading(false);
        }
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        clearStoredSession();
        if (!cancelled) {
          setNutritionist(null);
          setLoading(false);
        }
        return;
      }

      if (!parsed?.id) {
        clearStoredSession();
        if (!cancelled) {
          setNutritionist(null);
          setLoading(false);
        }
        return;
      }

      try {
        const status = await api.billingStatus();
        if (!cancelled) {
          const merged = mergeSubscription(parsed, status);
          setNutritionist(merged);
          localStorage.setItem("saas_nutritionist", JSON.stringify(merged));
        }
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          clearStoredSession();
          if (!cancelled) setNutritionist(null);
        } else if (!cancelled) {
          setNutritionist(parsed);
          window.dispatchEvent(
            new CustomEvent("saas:flash", {
              detail: { type: "error", message: err },
            })
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = (data) => {
    if (!data?.token || !data?.nutritionist) {
      throw createApiError({
        status: 502,
        fallback: "Invalid login response from server.",
      });
    }
    setToken(data.token);
    localStorage.setItem("saas_nutritionist", JSON.stringify(data.nutritionist));
    setNutritionist(data.nutritionist);
    return data;
  };

  const signup = async (body) => applySession(await api.nutritionistSignup(body));

  const login = async (email, password) =>
    applySession(await api.nutritionistLogin({ email, password }));

  const updateNutritionist = (data) => {
    setNutritionist(data);
    localStorage.setItem("saas_nutritionist", JSON.stringify(data));
  };

  const isAuthenticated = Boolean(nutritionist && getToken());
  const subscriptionActive = Boolean(nutritionist?.subscription_active);
  const isTrialing = nutritionist?.subscription_status === "trialing" && subscriptionActive;

  return (
    <NutritionistContext.Provider
      value={{
        nutritionist,
        setNutritionist: updateNutritionist,
        signup,
        login,
        logout,
        loading,
        isAuthenticated,
        subscriptionActive,
        isTrialing,
        refreshSubscription,
      }}
    >
      {children}
    </NutritionistContext.Provider>
  );
}

export function useNutritionist() {
  const ctx = useContext(NutritionistContext);
  if (!ctx) throw new Error("useNutritionist must be used within NutritionistProvider");
  return ctx;
}
