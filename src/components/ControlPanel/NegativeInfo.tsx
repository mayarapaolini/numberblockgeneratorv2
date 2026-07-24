import { NEGATIVE_EXPLANATION, NEGATIVE_FLOOR, REFERENCE_NEGATIVE_VALUE } from "../../modes/negativeMode";
import styles from "./ControlPanel.module.css";

interface NegativeInfoProps {
  onGoTo: (value: number) => void;
}

export function NegativeInfo({ onGoTo }: NegativeInfoProps) {
  return (
    <div className={styles.section} aria-label="Explicação sobre números negativos">
      <h2 className={styles.sectionTitle}>Números negativos</h2>
      <p className={styles.helpText}>{NEGATIVE_EXPLANATION}</p>
      <p className={styles.helpText}>Neste jogo, o número mais baixo que dá para chegar é {NEGATIVE_FLOOR}.</p>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={() => onGoTo(REFERENCE_NEGATIVE_VALUE)}
          aria-label="Ir para menos quinze"
        >
          Ver -15
        </button>
        <button type="button" className={styles.button} onClick={() => onGoTo(NEGATIVE_FLOOR)} aria-label="Ir para o menor número">
          Ver {NEGATIVE_FLOOR}
        </button>
      </div>
    </div>
  );
}
