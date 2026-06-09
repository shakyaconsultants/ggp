const ACTIVE_CALL_STATUSES = ["pending", "scheduled", "in_progress"];

function normalizeDateValue(date) {
  if (date == null) return null;

  if (typeof date === "string") {
    const isoMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch && date.length === 10) {
      return isoMatch[1];
    }
    if (isoMatch) {
      const parsed = new Date(date);
      if (!Number.isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }
  }

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return String(date).slice(0, 10);
}

function formatDateLabel(date) {
  const dateStr = normalizeDateValue(date);
  if (!dateStr) return "";

  const [year, month, day] = dateStr.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeTimeValue(time) {
  if (time == null) return null;
  if (typeof time === "string") {
    const match = time.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = match[1].padStart(2, "0");
      return `${hours}:${match[2]}:00`;
    }
  }
  if (time instanceof Date && !Number.isNaN(time.getTime())) {
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const seconds = String(time.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
  return String(time);
}

function formatTimeLabel(time) {
  const normalized = normalizeTimeValue(time);
  if (!normalized) return "";

  const [hours, minutes] = normalized.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function parseScheduledDateTime(scheduledDate, scheduledTime) {
  const dateStr = normalizeDateValue(scheduledDate);
  const timeStr = normalizeTimeValue(scheduledTime);
  if (!dateStr || !timeStr) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
  const start = new Date(year, month - 1, day, hours, minutes, seconds);

  return Number.isNaN(start.getTime()) ? null : start;
}

function getJoinWindow(now = new Date()) {
  const before = Number(process.env.CALL_JOIN_MINUTES_BEFORE || 15);
  const after = Number(process.env.CALL_JOIN_MINUTES_AFTER || 60);
  return { before, after };
}

function canJoinCall(scheduledDate, scheduledTime, status, now = new Date()) {
  if (status === "cancelled" || status === "completed") {
    return false;
  }
  if (status === "in_progress") {
    return true;
  }

  const start = parseScheduledDateTime(scheduledDate, scheduledTime);
  if (!start) return false;

  const { before, after } = getJoinWindow(now);
  const windowStart = new Date(start.getTime() - before * 60_000);
  const windowEnd = new Date(start.getTime() + after * 60_000);
  return now >= windowStart && now <= windowEnd;
}

function joinWindowMessage(scheduledDate, scheduledTime) {
  const start = parseScheduledDateTime(scheduledDate, scheduledTime);
  if (!start) return "Invalid call time";

  const { before, after } = getJoinWindow();
  const windowStart = new Date(start.getTime() - before * 60_000);
  const windowEnd = new Date(start.getTime() + after * 60_000);

  const fmt = (date) =>
    date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return `You can join from ${fmt(windowStart)} until ${fmt(windowEnd)}.`;
}

module.exports = {
  ACTIVE_CALL_STATUSES,
  normalizeDateValue,
  formatDateLabel,
  normalizeTimeValue,
  formatTimeLabel,
  parseScheduledDateTime,
  canJoinCall,
  joinWindowMessage,
  getJoinWindow,
};
