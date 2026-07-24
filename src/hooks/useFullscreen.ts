import { useCallback, useEffect, useState } from "react";

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

/**
 * Wraps the Fullscreen API where available (desktop Chrome/Edge). iPad
 * Safari does not support requesting fullscreen on arbitrary elements, so
 * `apiSupported` lets the UI fall back to a CSS-simulated fullscreen mode
 * that still maximizes the play area.
 */
export function useFullscreen() {
  const doc = typeof document !== "undefined" ? (document as FullscreenDocument) : null;
  const apiSupported = !!doc && (!!document.documentElement.requestFullscreen || !!(document.documentElement as FullscreenElement).webkitRequestFullscreen);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!doc) return undefined;
    const onChange = () => {
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [doc]);

  const toggle = useCallback(() => {
    if (!apiSupported) {
      setIsFullscreen((prev) => !prev);
      return;
    }
    const el = document.documentElement as FullscreenElement;
    if (!document.fullscreenElement && !(document as FullscreenDocument).webkitFullscreenElement) {
      (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch(() => setIsFullscreen((p) => !p));
    } else {
      const d = document as FullscreenDocument;
      void (d.exitFullscreen?.() ?? d.webkitExitFullscreen?.());
    }
  }, [apiSupported]);

  return { isFullscreen, toggle, apiSupported };
}
