import { PLANET_STOPS } from "../../modes/planet100Mode";
import styles from "./ControlPanel.module.css";

interface Planet100PanelProps {
  index: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Planet100Panel({ index, onPrev, onNext }: Planet100PanelProps) {
  const stop = PLANET_STOPS[index];

  return (
    <div className={styles.section} aria-label="Painel Planet 100">
      <h2 className={styles.sectionTitle}>
        Planet 100 — parada {index + 1} de {PLANET_STOPS.length}
      </h2>
      <div
        style={{
          borderRadius: 16,
          padding: "0.9rem",
          background: `linear-gradient(135deg, ${stop.color}55, transparent)`,
          border: `2px solid ${stop.color}`,
          marginBottom: "0.6rem",
        }}
      >
        <strong style={{ fontSize: "1.05rem" }}>{stop.name}</strong>
        <p className={styles.helpText}>{stop.description}</p>
        <p className={styles.helpText}>{stop.comparison}</p>
      </div>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={onPrev}
          disabled={index === 0}
          aria-label="Planeta anterior"
        >
          ⬅️ Anterior
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={onNext}
          disabled={index === PLANET_STOPS.length - 1}
          aria-label="Próximo planeta"
        >
          Próximo ➡️
        </button>
      </div>
    </div>
  );
}
