import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

/** Prompts the user when a new offline-cached build is ready to activate. */
export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [reload, setReload] = useState<(() => void) | null>(null);

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh: () => setNeedRefresh(true),
    });
    setReload(() => () => updateSW(true));
  }, []);

  return {
    needRefresh,
    applyUpdate: () => reload?.(),
    dismiss: () => setNeedRefresh(false),
  };
}
