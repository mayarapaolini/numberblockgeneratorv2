import { useEffect } from "react";

export interface KeyboardHandlers {
  onIncrease: () => void;
  onDecrease: () => void;
  onNextMilestone: () => void;
  onPreviousMilestone: () => void;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onToggleGreenScreen: () => void;
  onResetToOne: () => void;
}

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** Global keyboard shortcuts. Ignored while the user is typing in a form field. */
export function useKeyboardControls(handlers: KeyboardHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable)) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          handlers.onIncrease();
          break;
        case "ArrowDown":
          event.preventDefault();
          handlers.onDecrease();
          break;
        case "ArrowRight":
          event.preventDefault();
          handlers.onNextMilestone();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlers.onPreviousMilestone();
          break;
        case " ":
        case "Spacebar":
          event.preventDefault();
          handlers.onTogglePause();
          break;
        case "m":
        case "M":
          handlers.onToggleSound();
          break;
        case "f":
        case "F":
          handlers.onToggleFullscreen();
          break;
        case "g":
        case "G":
          handlers.onToggleGreenScreen();
          break;
        case "r":
        case "R":
          handlers.onResetToOne();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, handlers]);
}
