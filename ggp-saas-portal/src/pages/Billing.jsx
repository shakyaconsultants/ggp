import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNutritionist } from "../context/NutritionistContext";
import { api } from "../api/client";
import { useApiFeedback } from "../hooks/useApiFeedback";
import { useSubscriptionPayment } from "../hooks/useSubscriptionPayment";
import { AuthHeader, AuthLayout } from "../components/AuthLayout";
import { formatInr } from "../utils/billingFormat";

export default function Billing() {
  const { nutritionist, refreshSubscription, logout } = useNutritionist();
  const { notifyError } = useApiFeedback();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .billingPlans()
      .then(setPlans)
      .catch((e) => notifyError(e))
      .finally(() => setLoading(false));
  }, [notifyError]);

  const { pay, paying } = useSubscriptionPayment({
    onSuccess: async () => {
      await refreshSubscription();
      navigate("/dashboard/billing", { replace: true });
    },
  });

  const price = plans?.annual_price_inr ?? nutritionist?.annual_price_inr ?? 1000;
  const trialDays = plans?.trial_days ?? 15;

  return (
    <AuthLayout wide>
      <AuthHeader
        title="Subscription required"
        subtitle="Your free trial has ended. Complete payment to restore your dashboard and your clients' mobile app access."
      />

      <div className="billing-paywall card panel">
        {loading ? (
          <p className="muted">Loading plan details…</p>
        ) : (
          <>
            <div className="billing-paywall-badge">Annual plan</div>
            <div className="billing-price-row">
              <span className="billing-price">{formatInr(price)}</span>
              <span className="muted">/ year</span>
            </div>
            <ul className="billing-features">
              <li>Instant dashboard access for 1 year</li>
              <li>Client mobile app access restored immediately</li>
              <li>Tax invoice generated after payment</li>
              <li>Secure checkout powered by Razorpay</li>
            </ul>
            {!plans?.razorpay_configured && (
              <p className="billing-note muted">
                Razorpay is not configured on the API server yet. Add keys to `.env` and restart
                the API.
              </p>
            )}
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={pay}
              disabled={paying || !plans?.razorpay_configured}
            >
              {paying ? "Opening checkout…" : `Pay ${formatInr(price)} with Razorpay`}
            </button>
          </>
        )}
      </div>

      <p className="auth-footer muted billing-footnote">
        New accounts receive a {trialDays}-day free trial (worth {formatInr(price)}). Invoices
        appear under Account → Billing after payment.
      </p>

      <p className="auth-footer">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}>
          Sign out
        </button>
        {" · "}
        <Link to="/">Back to home</Link>
      </p>
    </AuthLayout>
  );
}
