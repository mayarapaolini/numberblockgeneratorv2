import { useEffect, useState } from "react";
import { MAX_EXPONENT } from "../../engine/HugeNumber";
import { EXPONENT_LANDMARKS } from "../../modes/exponentialMode";
import styles from "./ControlPanel.module.css";

interface ExponentialControlsProps {
  exponent: bigint;
  onSetExponent: (exponent: bigint) => void;
  onAdjust: (delta: bigint) => void;
}

export function ExponentialControls({ exponent, onSetExponent, onAdjust }: ExponentialControlsProps) {
  const [text, setText] = useState(exponent.toString());

  useEffect(() => {
    setText(exponent.toString());
  }, [exponent]);

  const applyText = () => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    if (digitsOnly === "") {
      setText(exponent.toString());
      return;
    }
    onSetExponent(BigInt(digitsOnly));
  };

  return (
    <div className={styles.section} aria-label="Controles do modo potências de 10">
      <h2 className={styles.sectionTitle}>Potências de 10 — expoente atual: {exponent.toString()}</h2>
      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={() => onAdjust(-1n)} aria-label="Diminuir expoente em 1">
          -1
        </button>
        <button type="button" className={styles.button} onClick={() => onAdjust(1n)} aria-label="Aumentar expoente em 1">
          +1
        </button>
        <button type="button" className={styles.button} onClick={() => onAdjust(10n)} aria-label="Aumentar expoente em 10">
          +10
        </button>
        <button type="button" className={styles.button} onClick={() => onAdjust(100n)} aria-label="Aumentar expoente em 100">
          +100
        </button>
        <button type="button" className={styles.button} onClick={() => onAdjust(1000n)} aria-label="Aumentar expoente em 1000">
          +1.000
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => onSetExponent(MAX_EXPONENT)}
          aria-label="Ir para o expoente máximo, 10 elevado a 3000003"
        >
          🚀 Expoente máximo
        </button>
      </div>

      <div className={styles.inputRow}>
        <label className={styles.label}>
          Digitar expoente
          <input
            className={styles.textInput}
            type="text"
            inputMode="numeric"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={applyText}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyText();
            }}
            aria-label="Digitar novo expoente"
          />
        </label>
      </div>

      <h3 className={styles.sectionTitle}>Marcos especiais</h3>
      <div className={styles.row}>
        {EXPONENT_LANDMARKS.map((landmark) => (
          <button
            key={landmark.toString()}
            type="button"
            className={styles.button}
            onClick={() => onSetExponent(landmark)}
            aria-label={`Ir para 10 elevado a ${landmark.toString()}`}
          >
            10^{landmark.toString()}
          </button>
        ))}
      </div>
    </div>
  );
}
