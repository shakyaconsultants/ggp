export function formatAdminDate(iso) {
  if (!iso) return "—";
  return String(iso).slice(0, 10);
}

export function practiceName(n) {
  if (!n) return "—";
  return `${n.first_name || ""} ${n.last_name || ""}`.trim() || n.email || "—";
}

export function practiceInitials(n) {
  const first = n?.first_name?.[0] || "";
  const last = n?.last_name?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || (n?.email?.[0]?.toUpperCase() ?? "?");
}
