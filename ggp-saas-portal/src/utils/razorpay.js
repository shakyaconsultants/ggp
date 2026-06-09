export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout(order, { onSuccess, onDismiss }) {
  const options = {
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    name: order.name || "Good Gut Product",
    description: order.description || "Annual subscription",
    order_id: order.order_id,
    prefill: order.prefill || {},
    theme: { color: "#0d7a55" },
    handler(response) {
      onSuccess?.(response);
    },
    modal: {
      ondismiss() {
        onDismiss?.();
      },
    },
  };

  const checkout = new window.Razorpay(options);
  checkout.open();
  return checkout;
}
