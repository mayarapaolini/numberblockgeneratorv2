import type { AutoModeConfig, AutoOperation } from "../../types/game";
import { AUTO_SPEED_MAX, AUTO_SPEED_MIN } from "../../modes/automaticMode";
import styles from "./ControlPanel.module.css";

interface AutomaticControlsProps {
  auto: AutoModeConfig;
  onChange: (partial: Partial<AutoModeConfig>) => void;
  onToggleRunning: () => void;
}

const OPERATIONS: Array<{ id: AutoOperation; label: string }> = [
  { id: "increment", label: "Crescer (+)" },
  { id: "decrement", label: "Diminuir (-)" },
  { id: "multiply", label: "Multiplicar (×)" },
  { id: "divide", label: "Dividir (÷)" },
  { id: "specials", label: "Números especiais" },
  { id: "powersOfTen", label: "Potências de 10" },
];

export function AutomaticControls({ auto, onChange, onToggleRunning }: AutomaticControlsProps) {
  const showStep = auto.operation === "increment" || auto.operation === "decrement" || auto.operation === "multiply" || auto.operation === "divide";

  return (
    <div className={styles.section} aria-label="Controles do modo automático">
      <h2 className={styles.sectionTitle}>Modo automático</h2>
      <div className={styles.inputRow}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={onToggleRunning}
          aria-pressed={auto.running}
          aria-label={auto.running ? "Pausar modo automático" : "Iniciar modo automático"}
        >
          {auto.running ? "⏸️ Pausar" : "▶️ Iniciar"}
        </button>

        <label className={styles.label}>
          Operação
          <select
            className={styles.select}
            value={auto.operation}
            onChange={(e) => onChange({ operation: e.target.value as AutoOperation })}
            aria-label="Operação automática"
          >
            {OPERATIONS.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
        </label>

        {showStep ? (
          <label className={styles.label}>
            Passo
            <input
              className={styles.textInput}
              type="text"
              inputMode="decimal"
              value={auto.step}
              onChange={(e) => onChange({ step: e.target.value })}
              aria-label="Passo do modo automático"
            />
          </label>
        ) : null}

        <label className={styles.label}>
          Velocidade ({auto.speed.toFixed(2)}x)
          <input
            className={styles.slider}
            type="range"
            min={AUTO_SPEED_MIN}
            max={AUTO_SPEED_MAX}
            step={0.25}
            value={auto.speed}
            onChange={(e) => onChange({ speed: Number(e.target.value) })}
            aria-label="Velocidade do modo automático"
          />
        </label>

        <label className={styles.label}>
          Limite (opcional)
          <input
            className={styles.textInput}
            type="text"
            inputMode="decimal"
            value={auto.limit ?? ""}
            placeholder="sem limite"
            onChange={(e) => onChange({ limit: e.target.value === "" ? null : e.target.value })}
            aria-label="Valor limite do modo automático"
          />
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={auto.repeat}
            onChange={(e) => onChange({ repeat: e.target.checked })}
            aria-label="Repetir ao atingir o limite"
          />
          Repetir ao atingir o limite
        </label>
      </div>
      <p className={styles.helpText}>
        O número muda sozinho enquanto o modo estiver rodando. Aperte espaço para pausar.
      </p>
    </div>
  );
}
