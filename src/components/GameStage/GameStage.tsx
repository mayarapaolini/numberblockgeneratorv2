import type { HugeNumber } from "../../engine/HugeNumber";
import { getVisualLevel } from "../../engine/visualLevel";
import { NumberCharacter } from "../NumberCharacter/NumberCharacter";
import { NumberDisplay } from "../NumberDisplay/NumberDisplay";
import styles from "./GameStage.module.css";

interface GameStageProps {
  value: HugeNumber;
  reduceMotion: boolean;
  message: string | null;
  soundOn: boolean;
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onOpenSpecialNumbers: () => void;
}

export function GameStage({
  value,
  reduceMotion,
  message,
  soundOn,
  isFullscreen,
  fullscreenSupported,
  onOpenSettings,
  onToggleFullscreen,
  onToggleSound,
  onOpenSpecialNumbers,
}: GameStageProps) {
  const level = getVisualLevel(value);

  return (
    <section
      className={styles.stage}
      data-level={level}
      data-negative={value.sign === -1}
      aria-label="Palco do jogo"
    >
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Laboratório dos Números</h1>
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenSpecialNumbers}
            aria-label="Abrir números especiais"
            title="Números especiais"
          >
            ⭐
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onToggleSound}
            aria-label={soundOn ? "Desligar som" : "Ligar som"}
            aria-pressed={soundOn}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          {fullscreenSupported ? (
            <button
              type="button"
              className={styles.iconButton}
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
              aria-pressed={isFullscreen}
            >
              {isFullscreen ? "⤢" : "⛶"}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.iconButton}
            onClick={onOpenSettings}
            aria-label="Abrir configurações"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className={styles.displayCard}>
        <NumberDisplay value={value} />
      </div>

      <div className={styles.characterArea}>
        <NumberCharacter value={value} reduceMotion={reduceMotion} />
        {message ? (
          <p className={styles.message} role="status">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
