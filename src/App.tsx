import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameState } from "./hooks/useGameState";
import { usePersistence, loadPersistedState, clearPersistedState } from "./hooks/usePersistence";
import { useSound } from "./hooks/useSound";
import { useNarration } from "./hooks/useNarration";
import { useFullscreen } from "./hooks/useFullscreen";
import { useAutoMode } from "./hooks/useAutoMode";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { usePwaUpdate } from "./hooks/usePwaUpdate";
import { GameStage } from "./components/GameStage/GameStage";
import { ModeSelector } from "./components/ModeSelector/ModeSelector";
import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import { SpecialNumbers } from "./components/SpecialNumbers/SpecialNumbers";
import { SettingsDialog } from "./components/SettingsDialog/SettingsDialog";
import { GreenScreen } from "./components/GreenScreen/GreenScreen";
import type { HugeNumber } from "./engine/HugeNumber";
import { nameHugeNumber } from "./engine/numberNames";
import { nameHugeNumberEn } from "./engine/numberNamesEn";
import { getEducationalTip } from "./engine/education";
import { isPowerOfTen, isExactlyHundred, getVisualLevel } from "./engine/visualLevel";
import { EXPONENT_LANDMARKS } from "./modes/exponentialMode";
import styles from "./App.module.css";

const narrationSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export default function App() {
  const { state, actions } = useGameState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [specialNumbersOpen, setSpecialNumbersOpen] = useState(false);

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) actions.hydrate(persisted);
    // Runs once on mount to hydrate from localStorage; actions is a stable memoized object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePersistence(state);

  const { play } = useSound(state.settings.soundOn, state.settings.volume);
  const { speak } = useNarration(state.settings.narrationOn);
  const { isFullscreen, toggle: toggleFullscreen, apiSupported } = useFullscreen();
  const { needRefresh, applyUpdate, dismiss } = usePwaUpdate();

  const level = useMemo(() => getVisualLevel(state.value), [state.value]);

  useEffect(() => {
    if (state.lastError) play("error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastError]);

  useEffect(() => {
    if (isPowerOfTen(state.value) || isExactlyHundred(state.value)) {
      play("powerOfTen");
    } else if (level === 4) {
      play("cosmic");
    }
    if (state.settings.narrationOn) {
      const text =
        state.settings.narrationLang === "en-US" ? nameHugeNumberEn(state.value) : nameHugeNumber(state.value);
      speak(text, state.settings.narrationLang);
    }
    // Only the value itself should retrigger reactions, not every settings change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value]);

  const handleAutoTick = useCallback(
    (value: HugeNumber, exponent: bigint, planetIndex?: number) => {
      actions.autoTick(value, exponent, planetIndex);
    },
    [actions],
  );

  const handleAutoLimitReached = useCallback(() => {
    actions.setAutoConfig({ running: false });
  }, [actions]);

  useAutoMode({
    active: state.mode === "automatic",
    value: state.value,
    exponent: state.exponent,
    auto: state.auto,
    planetIndex: state.planetIndex,
    onTick: handleAutoTick,
    onLimitReached: handleAutoLimitReached,
  });

  const goToMilestoneOffset = useCallback(
    (direction: 1 | -1) => {
      const currentExp = state.exponent;
      const index = EXPONENT_LANDMARKS.findIndex((landmark) => landmark >= currentExp);
      const nextIndex =
        direction === 1
          ? Math.min(EXPONENT_LANDMARKS.length - 1, index === -1 ? EXPONENT_LANDMARKS.length - 1 : index + 1)
          : Math.max(0, (index === -1 ? EXPONENT_LANDMARKS.length - 1 : index) - 1);
      actions.setExponent(EXPONENT_LANDMARKS[nextIndex]);
    },
    [actions, state.exponent],
  );

  useKeyboardControls({
    onIncrease: () => {
      actions.increment("1");
      play("grow");
    },
    onDecrease: () => {
      actions.decrement("1");
      play("shrink");
    },
    onNextMilestone: () => goToMilestoneOffset(1),
    onPreviousMilestone: () => goToMilestoneOffset(-1),
    onTogglePause: () => actions.toggleAutoRunning(),
    onToggleSound: () => actions.setSettings({ soundOn: !state.settings.soundOn }),
    onToggleFullscreen: () => toggleFullscreen(),
    onToggleGreenScreen: () => actions.setGreenScreen({ active: !state.greenScreen.active }),
    onResetToOne: () => actions.resetToOne(),
  });

  const simulatedFullscreen = isFullscreen && !apiSupported;

  if (state.greenScreen.active) {
    return (
      <GreenScreen
        value={state.value}
        config={state.greenScreen}
        reduceMotion={state.settings.reduceMotion}
        onChange={(partial) => actions.setGreenScreen(partial)}
        onExit={() => actions.setGreenScreen({ active: false })}
      />
    );
  }

  return (
    <div className={styles.app} data-simulated-fullscreen={simulatedFullscreen}>
      <a href="#control-panel" className={styles.skipLink}>
        Pular para os controles
      </a>

      <div className={styles.layout}>
        <div className={styles.stageColumn}>
          <GameStage
            value={state.value}
            reduceMotion={state.settings.reduceMotion}
            message={state.lastMessage ?? getEducationalTip(state.value, state.mode)}
            soundOn={state.settings.soundOn}
            isFullscreen={isFullscreen}
            fullscreenSupported
            onOpenSettings={() => setSettingsOpen(true)}
            onToggleFullscreen={toggleFullscreen}
            onToggleSound={() => actions.setSettings({ soundOn: !state.settings.soundOn })}
            onOpenSpecialNumbers={() => setSpecialNumbersOpen(true)}
          />

          <ModeSelector mode={state.mode} onSelect={(mode) => actions.setMode(mode)} />
        </div>

        <div id="control-panel" className={styles.sidebar}>
          <ControlPanel state={state} actions={actions} playSound={play} />
        </div>
      </div>

      {needRefresh ? (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111827",
            color: "#fff",
            padding: "0.6rem 1rem",
            borderRadius: 12,
            zIndex: 200,
          }}
        >
          Nova versão disponível!{" "}
          <button type="button" onClick={applyUpdate} style={{ marginLeft: 8 }}>
            Atualizar
          </button>
          <button type="button" onClick={dismiss} style={{ marginLeft: 8 }} aria-label="Ignorar atualização">
            ✖️
          </button>
        </div>
      ) : null}

      {specialNumbersOpen ? (
        <SpecialNumbers
          onSelect={(value, label) => {
            actions.setValue(value, `Você foi para ${label}!`);
            setSpecialNumbersOpen(false);
          }}
          onClose={() => setSpecialNumbersOpen(false)}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsDialog
          settings={state.settings}
          narrationSupported={narrationSupported}
          onChange={(partial) => actions.setSettings(partial)}
          onClearProgress={() => {
            clearPersistedState();
            actions.clearProgress();
            setSettingsOpen(false);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
