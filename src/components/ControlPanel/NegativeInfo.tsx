import type { HugeNumber } from "../../engine/HugeNumber";
import { NEGATIVE_EXPLANATION, NEGATIVE_FLOOR, REFERENCE_NEGATIVE_VALUE } from "../../modes/negativeMode";
import { describeWorldComparison } from "../../engine/worldReferences";
import styles from "./ControlPanel.module.css";

interface NegativeInfoProps {
  value: HugeNumber;
  onGoTo: (value: number) => void;
}

export function NegativeInfo({ value, onGoTo }: NegativeInfoProps) {
  return (
    <div className={styles.section} aria-label="Explicação sobre números negativos">
      <h2 className={styles.sectionTitle}>Números negativos</h2>
      <p className={styles.helpText}>{NEGATIVE_EXPLANATION}</p>
      <p className={styles.helpText}>Neste jogo, o número mais baixo que dá para chegar é {NEGATIVE_FLOOR}.</p>
      {value.sign === -1 ? (
        <p className={styles.helpText} role="status">
          {describeWorldComparison(value)}
        </p>
      ) : (
        <p className={styles.helpText}>Toque em "-1" para começar a mergulhar abaixo do zero!</p>
      )}
      <div className={styles.row}>
        <button
          type="button"
          className={styles.button}
          onClick={() => onGoTo(REFERENCE_NEGATIVE_VALUE)}
          aria-label="Ir para menos quinze"
        >
          Ver -15
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() => onGoTo(NEGATIVE_FLOOR)}
          aria-label="Ir para menos quarenta e nove, a Fossa das Marianas"
        >
          🐙 Ver {NEGATIVE_FLOOR} (Fossa das Marianas)
        </button>
      </div>
    </div>
  );
}
