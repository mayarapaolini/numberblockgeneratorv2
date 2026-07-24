import type { HugeNumber } from "../../engine/HugeNumber";
import type { GreenScreenConfig } from "../../types/game";
import { NumberCharacter } from "../NumberCharacter/NumberCharacter";
import { NumberDisplay } from "../NumberDisplay/NumberDisplay";
import styles from "./GreenScreen.module.css";

interface GreenScreenProps {
  value: HugeNumber;
  config: GreenScreenConfig;
  reduceMotion: boolean;
  onChange: (partial: Partial<GreenScreenConfig>) => void;
  onExit: () => void;
}

const POSITIONS: GreenScreenConfig["watermarkPosition"][] = [
  "bottom-right",
  "bottom-left",
  "top-left",
  "top-right",
];

export function GreenScreen({ value, config, reduceMotion, onChange, onExit }: GreenScreenProps) {
  const cyclePosition = () => {
    const idx = POSITIONS.indexOf(config.watermarkPosition);
    onChange({ watermarkPosition: POSITIONS[(idx + 1) % POSITIONS.length] });
  };

  return (
    <div className={styles.stage} aria-label="Modo tela verde" data-testid="green-screen-stage">
      <div className={styles.character}>
        <NumberCharacter value={value} reduceMotion={reduceMotion} />
      </div>

      {!config.hideText ? <NumberDisplay value={value} /> : null}

      {!config.hidePanels ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.button}
            onClick={() => onChange({ hidePanels: true })}
            aria-label="Esconder painéis"
          >
            🙈
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => onChange({ hideText: !config.hideText })}
            aria-label={config.hideText ? "Mostrar texto" : "Esconder texto"}
          >
            🔤
          </button>
          <button type="button" className={styles.button} onClick={onExit} aria-label="Sair da tela verde">
            ✖️
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.button}
          style={{ position: "absolute", top: "calc(0.75rem + var(--safe-top))", right: "calc(0.75rem + var(--safe-right))" }}
          onClick={() => onChange({ hidePanels: false })}
          aria-label="Mostrar painéis"
        >
          👁️
        </button>
      )}

      <button
        type="button"
        className={styles.watermark}
        data-position={config.watermarkPosition}
        onClick={cyclePosition}
        aria-label="Marca d'água — toque para reposicionar"
      >
        Laboratório dos Números
      </button>
    </div>
  );
}
