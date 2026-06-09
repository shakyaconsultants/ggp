import { useState } from "react";
import { api } from "../api/client";
import { useApiFeedback } from "./useApiFeedback";
import { loadRazorpayScript, openRazorpayCheckout } from "../utils/razorpay";

export function useSubscriptionPayment({ onSuccess }) {
  const { notifyError, notifySuccess } = useApiFeedback();
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    setPaying(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready) {
        notifyError("Unable to load Razorpay checkout. Check your connection.");
        setPaying(false);
        return;
      }

      const order = await api.billingCreateOrder();
      openRazorpayCheckout(order, {
        async onSuccess(response) {
          try {
            const result = await api.billingVerifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            notifySuccess(result.message || "Payment successful.");
            await onSuccess?.(result);
          } catch (err) {
            notifyError(err);
          } finally {
            setPaying(false);
          }
        },
        onDismiss() {
          setPaying(false);
        },
      });
    } catch (err) {
      notifyError(err);
      setPaying(false);
    }
  };

  return { pay, paying };
}
