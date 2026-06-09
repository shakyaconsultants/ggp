const HTML_PATTERN = /<\s*!?\s*doctype|<\s*html|<\s*head|<\s*body|<\s*div|<\s*span|<\s*p[\s>]/i;

const STATUS_MESSAGES = {
  400: "Invalid request. Please check your input and try again.",
  401: "Your session expired. Please sign in again.",
  402: "Your subscription is inactive. Please renew to continue.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data.",
  422: "Some fields are invalid. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our server. Please try again later.",
  502: "The server is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
};

export function looksLikeHtml(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return HTML_PATTERN.test(trimmed);
}

export function stripHtml(text) {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeUserMessage(text, fallback = "Something went wrong. Please try again.") {
  if (text == null) return fallback;
  const raw = String(text).trim();
  if (!raw) return fallback;
  if (looksLikeHtml(raw)) return fallback;
  if (raw.length > 280) return `${raw.slice(0, 277)}…`;
  return raw;
}

export function messageFromPayload(data) {
  if (!data) return null;
  if (typeof data === "string") return sanitizeUserMessage(data);
  const candidate =
    data.error ?? data.msg ?? data.message ?? data.detail ?? data.details ?? null;
  if (Array.isArray(candidate)) {
    return sanitizeUserMessage(candidate.filter(Boolean).join(". "));
  }
  if (candidate && typeof candidate === "object") {
    const values = Object.values(candidate).flat().filter(Boolean);
    if (values.length) return sanitizeUserMessage(values.join(". "));
  }
  return sanitizeUserMessage(candidate);
}

export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err) return fallback;
  if (typeof err === "string") return sanitizeUserMessage(err, fallback);

  const fromPayload = messageFromPayload(err.data);
  if (fromPayload && fromPayload !== fallback) return fromPayload;

  const statusMsg = STATUS_MESSAGES[err.status];
  if (statusMsg && (!err.message || looksLikeHtml(err.message))) return statusMsg;

  if (err.name === "TypeError" && /fetch|network/i.test(String(err.message))) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return sanitizeUserMessage(err.message, fallback);
}

export function createApiError({ status, data, rawText, fallback }) {
  const message =
    messageFromPayload(data) ||
    (status ? STATUS_MESSAGES[status] : null) ||
    sanitizeUserMessage(rawText, fallback || "Request failed. Please try again.");

  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}
