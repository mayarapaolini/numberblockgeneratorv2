import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

const CHECK_INTERVAL_MS = 60_000;

/** Prompts the user when a new offline-cached build is ready to activate. */
export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [reload, setReload] = useState<(() => void) | null>(null);

  useEffect(() => {
    let registration: ServiceWorkerRegistration | undefined;

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh: () => setNeedRefresh(true),
      onRegisteredSW: (_url, reg) => {
        registration = reg;
      },
    });
    setReload(() => () => updateSW(true));

    const checkForUpdate = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };
    const intervalId = window.setInterval(checkForUpdate, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", checkForUpdate);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  return {
    needRefresh,
    applyUpdate: () => reload?.(),
    dismiss: () => setNeedRefresh(false),
  };
}
