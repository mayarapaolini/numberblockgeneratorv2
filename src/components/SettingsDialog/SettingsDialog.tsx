import { useEffect, useRef, useState } from "react";
import type { Settings } from "../../types/game";
import styles from "./SettingsDialog.module.css";

interface SettingsDialogProps {
  settings: Settings;
  narrationSupported: boolean;
  onChange: (partial: Partial<Settings>) => void;
  onClearProgress: () => void;
  onClose: () => void;
}

export function SettingsDialog({ settings, narrationSupported, onChange, onClearProgress, onClose }: SettingsDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Configurações" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Configurações</h2>
          <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar configurações">
            ✖️
          </button>
        </div>

        <div className={styles.row}>
          <label htmlFor="setting-sound">Som</label>
          <input
            id="setting-sound"
            className={styles.switch}
            type="checkbox"
            checked={settings.soundOn}
            onChange={(e) => onChange({ soundOn: e.target.checked })}
            aria-label="Ligar ou desligar som"
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="setting-volume">Volume</label>
          <input
            id="setting-volume"
            className={styles.slider}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => onChange({ volume: Number(e.target.value) })}
            aria-label="Ajustar volume"
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="setting-motion">Reduzir animações</label>
          <input
            id="setting-motion"
            className={styles.switch}
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => onChange({ reduceMotion: e.target.checked })}
            aria-label="Reduzir movimento e animações"
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="setting-effects">Ocultar efeitos visuais</label>
          <input
            id="setting-effects"
            className={styles.switch}
            type="checkbox"
            checked={settings.hideEffects}
            onChange={(e) => onChange({ hideEffects: e.target.checked })}
            aria-label="Ocultar efeitos visuais extras"
          />
        </div>

        {narrationSupported ? (
          <>
            <div className={styles.row}>
              <label htmlFor="setting-narration">Narração por voz</label>
              <input
                id="setting-narration"
                className={styles.switch}
                type="checkbox"
                checked={settings.narrationOn}
                onChange={(e) => onChange({ narrationOn: e.target.checked })}
                aria-label="Ligar ou desligar narração por voz"
              />
            </div>
            <div className={styles.row}>
              <label htmlFor="setting-narration-lang">Idioma da narração</label>
              <select
                id="setting-narration-lang"
                className={styles.select}
                value={settings.narrationLang}
                onChange={(e) => onChange({ narrationLang: e.target.value as Settings["narrationLang"] })}
                aria-label="Escolher idioma da narração"
              >
                <option value="pt-BR">Português</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </>
        ) : null}

        <button
          type="button"
          className={styles.dangerButton}
          onClick={() => {
            if (confirmingClear) {
              onClearProgress();
              setConfirmingClear(false);
            } else {
              setConfirmingClear(true);
            }
          }}
          aria-label="Apagar todo o progresso salvo"
        >
          {confirmingClear ? "Confirmar: apagar tudo?" : "🗑️ Apagar progresso"}
        </button>
      </div>
    </div>
  );
}
