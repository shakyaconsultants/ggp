import { useFlashItems } from "../context/FlashContext";

export default function FlashStack() {
  const { items, dismiss } = useFlashItems();

  if (!items.length) return null;

  return (
    <div className="flash-stack" aria-live="polite" aria-relevant="additions">
      {items.map((item) => (
        <div key={item.id} className={`flash flash-${item.type}`} role="alert">
          <span className="flash-message">{item.message}</span>
          <button
            type="button"
            className="flash-close"
            onClick={() => dismiss(item.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
