import { MODE_DEFINITIONS } from "../../modes";
import type { GameMode } from "../../types/game";
import styles from "./ModeSelector.module.css";

interface ModeSelectorProps {
  mode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export function ModeSelector({ mode, onSelect }: ModeSelectorProps) {
  return (
    <nav className={styles.list} aria-label="Modos do jogo">
      {MODE_DEFINITIONS.map((def) => (
        <button
          key={def.id}
          type="button"
          className={styles.chip}
          aria-pressed={mode === def.id}
          onClick={() => onSelect(def.id)}
          aria-label={`Modo ${def.label}: ${def.description}`}
        >
          <span className={styles.icon} aria-hidden="true">
            {def.icon}
          </span>
          {def.label}
        </button>
      ))}
    </nav>
  );
}
