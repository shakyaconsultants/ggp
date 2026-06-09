import { useCallback } from "react";
import { useFlash } from "../context/FlashContext";
import { getErrorMessage } from "../utils/errors";

export function useApiFeedback() {
  const flash = useFlash();

  const notifyError = useCallback(
    (err, fallback) => {
      flash.error(getErrorMessage(err, fallback));
    },
    [flash]
  );

  const notifySuccess = useCallback(
    (message) => {
      flash.success(message);
    },
    [flash]
  );

  const runSafe = useCallback(
    async (fn, { fallback, silent = false } = {}) => {
      try {
        return await fn();
      } catch (err) {
        if (!silent) notifyError(err, fallback);
        return undefined;
      }
    },
    [notifyError]
  );

  return { flash, notifyError, notifySuccess, runSafe };
}
