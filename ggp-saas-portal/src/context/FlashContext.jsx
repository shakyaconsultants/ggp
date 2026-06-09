import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getErrorMessage, sanitizeUserMessage } from "../utils/errors";

const FlashContext = createContext(null);

let idCounter = 0;

function flashText(type, message) {
  if (type === "error") return getErrorMessage(message);
  const raw = typeof message === "string" ? message : String(message ?? "");
  return sanitizeUserMessage(raw, "Done.");
}

export function FlashProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration = 5200) => {
      const id = ++idCounter;
      const text = flashText(type, message);
      setItems((prev) => [...prev, { id, type, message: text }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const flash = useMemo(
    () => ({
      success: (message, duration) => push("success", message, duration),
      error: (message, duration) => push("error", message, duration),
      info: (message, duration) => push("info", message, duration),
      dismiss,
    }),
    [push, dismiss]
  );

  useEffect(() => {
    const onUnhandledRejection = (event) => {
      event.preventDefault();
      push("error", getErrorMessage(event.reason));
    };

    const onFlashEvent = (event) => {
      const { type = "error", message } = event.detail || {};
      push(type, message);
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("saas:flash", onFlashEvent);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("saas:flash", onFlashEvent);
    };
  }, [push]);

  return (
    <FlashContext.Provider value={{ flash, items, dismiss }}>
      {children}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const ctx = useContext(FlashContext);
  if (!ctx) {
    throw new Error("useFlash must be used within FlashProvider");
  }
  return ctx.flash;
}

export function useFlashItems() {
  const ctx = useContext(FlashContext);
  if (!ctx) {
    throw new Error("useFlashItems must be used within FlashProvider");
  }
  return { items: ctx.items, dismiss: ctx.dismiss };
}
