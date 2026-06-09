import { sanitizeUserMessage } from "../utils/errors";

function isPlainText(children) {
  return typeof children === "string" || typeof children === "number";
}

export default function Alert({ type = "error", children, onClose }) {
  const fallback =
    type === "success"
      ? "Success."
      : type === "info"
        ? "Note."
        : type === "warning"
          ? "Please note."
          : "Something went wrong.";

  const content = isPlainText(children)
    ? sanitizeUserMessage(String(children), fallback)
    : children;

  return (
    <div
      className={`alert alert-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="alert-body">{content}</div>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
