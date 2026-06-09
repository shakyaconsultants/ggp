export function formatInr(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatBillingDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function subscriptionStatusLabel(status) {
  switch (status) {
    case "trialing":
      return "Free trial";
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    default:
      return status || "Unknown";
  }
}

export function subscriptionStatusClass(status) {
  switch (status) {
    case "trialing":
      return "billing-badge billing-badge-trial";
    case "active":
      return "billing-badge billing-badge-active";
    case "expired":
      return "billing-badge billing-badge-expired";
    default:
      return "billing-badge";
  }
}
