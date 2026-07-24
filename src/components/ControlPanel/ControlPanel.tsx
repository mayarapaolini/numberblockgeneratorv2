import { useState } from "react";
import type { GameState } from "../../types/game";
import type { useGameState } from "../../hooks/useGameState";
import { fromSafeInteger } from "../../engine/HugeNumber";
import { QUICK_INCREMENTS, QUICK_MULTIPLIERS } from "../../modes/freeMode";
import { MODE_DEFINITIONS } from "../../modes";
import { PLANET_STOPS, planetValue } from "../../modes/planet100Mode";
import type { SoundName } from "../../hooks/useSound";
import { AutomaticControls } from "./AutomaticControls";
import { ExponentialControls } from "./ExponentialControls";
import { Planet100Panel } from "./Planet100Panel";
import { NegativeInfo } from "./NegativeInfo";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  state: GameState;
  actions: ReturnType<typeof useGameState>["actions"];
  playSound: (name: SoundName) => void;
}

export function ControlPanel({ state, actions, playSound }: ControlPanelProps) {
  const [multiplierText, setMultiplierText] = useState("2");

  const runIncrement = (amount: string) => {
    actions.increment(amount);
    playSound("grow");
  };
  const runDecrement = (amount: string) => {
    actions.decrement(amount);
    playSound("shrink");
  };
  const runMultiply = (text: string) => {
    actions.multiplyBy(text);
    playSound("multiply");
  };
  const runDivide = (text: string) => {
    actions.divideBy(text);
    playSound("divide");
  };

  const nextModeIndex = (MODE_DEFINITIONS.findIndex((m) => m.id === state.mode) + 1) % MODE_DEFINITIONS.length;

  return (
    <div className={styles.panel} aria-label="Painel de controles">
      {state.lastError ? (
        <p className={styles.errorBanner} role="alert">
          {state.lastError}
        </p>
      ) : null}

      {state.mode === "automatic" ? (
        <AutomaticControls
          auto={state.auto}
          onChange={(partial) => actions.setAutoConfig(partial)}
          onToggleRunning={actions.toggleAutoRunning}
        />
      ) : null}

      {state.mode === "exponential" ? (
        <ExponentialControls
          exponent={state.exponent}
          onSetExponent={actions.setExponent}
          onAdjust={actions.adjustExponent}
        />
      ) : null}

      {state.mode === "planet100" ? (
        <Planet100Panel
          index={state.planetIndex}
          onPrev={() => {
            const nextIndex = Math.max(0, state.planetIndex - 1);
            actions.setValue(planetValue(PLANET_STOPS[nextIndex]));
            actions.hydrate({ planetIndex: nextIndex });
          }}
          onNext={() => {
            const nextIndex = Math.min(PLANET_STOPS.length - 1, state.planetIndex + 1);
            actions.setValue(planetValue(PLANET_STOPS[nextIndex]));
            actions.hydrate({ planetIndex: nextIndex });
          }}
        />
      ) : null}

      {state.mode === "negative" ? (
        <NegativeInfo value={state.value} onGoTo={(value) => actions.setValue(fromSafeInteger(value))} />
      ) : null}

      <section className={styles.section} aria-label="Somar e subtrair">
        <h2 className={styles.sectionTitle}>Somar e subtrair</h2>
        <div className={styles.row}>
          {QUICK_INCREMENTS.map((op) => (
            <button
              key={op.id}
              type="button"
              className={styles.button}
              aria-label={op.ariaLabel}
              onClick={() => (op.label.startsWith("-") ? runDecrement(op.label.slice(1)) : runIncrement(op.label.slice(1)))}
            >
              {op.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-label="Multiplicar e dividir">
        <h2 className={styles.sectionTitle}>Multiplicar e dividir</h2>
        <div className={styles.row}>
          {QUICK_MULTIPLIERS.map((op) => (
            <button
              key={op.id}
              type="button"
              className={styles.button}
              aria-label={op.ariaLabel}
              onClick={() => (op.id.startsWith("mul") ? runMultiply(op.label.slice(1)) : runDivide(op.label.slice(1)))}
            >
              {op.label}
            </button>
          ))}
        </div>
        <div className={styles.inputRow}>
          <label className={styles.label}>
            Multiplicador personalizado
            <input
              className={styles.textInput}
              type="text"
              inputMode="decimal"
              value={multiplierText}
              onChange={(e) => setMultiplierText(e.target.value)}
              aria-label="Valor do multiplicador ou divisor personalizado"
              placeholder="ex: 1.5"
            />
          </label>
          <button type="button" className={styles.button} onClick={() => runMultiply(multiplierText)} aria-label="Multiplicar pelo valor digitado">
            ✖️ Multiplicar
          </button>
          <button type="button" className={styles.button} onClick={() => runDivide(multiplierText)} aria-label="Dividir pelo valor digitado">
            ➗ Dividir
          </button>
        </div>
        <p className={styles.helpText}>Aceita números como 0.5, 1.25 ou -3 (até três casas decimais).</p>
      </section>

      <section className={styles.section} aria-label="Navegação e histórico">
        <h2 className={styles.sectionTitle}>Navegação</h2>
        <div className={styles.row}>
          <button type="button" className={styles.button} onClick={() => actions.resetToZero()} aria-label="Voltar para zero">
            0️⃣ Voltar para 0
          </button>
          <button type="button" className={styles.button} onClick={() => actions.resetToOne()} aria-label="Voltar para um">
            1️⃣ Voltar para 1
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => actions.undo()}
            disabled={state.history.length === 0}
            aria-label="Desfazer última ação"
          >
            ↩️ Desfazer
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => actions.redo()}
            disabled={state.future.length === 0}
            aria-label="Refazer última ação desfeita"
          >
            ↪️ Refazer
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => actions.toggleAutoRunning()}
            disabled={state.mode !== "automatic"}
            aria-label={state.auto.running ? "Pausar automação" : "Continuar automação"}
          >
            {state.auto.running ? "⏸️ Pausar automação" : "▶️ Continuar automação"}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => actions.setMode(MODE_DEFINITIONS[nextModeIndex].id)}
            aria-label={`Trocar para o modo ${MODE_DEFINITIONS[nextModeIndex].label}`}
          >
            🔀 Trocar modo
          </button>
        </div>
      </section>
    </div>
  );
}
