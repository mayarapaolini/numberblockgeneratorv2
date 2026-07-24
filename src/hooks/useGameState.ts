import { useMemo, useReducer } from "react";
import {
  type HugeNumber,
  fromDecimalString,
  fromSafeInteger,
  fromPowerOfTen,
  compare,
  negate,
  HugeNumberError,
  orderOfMagnitude,
} from "../engine/HugeNumber";
import { add, multiply, divide, clamp as clampHuge } from "../engine/operations";
import {
  type GameState,
  type GameMode,
  type AutoModeConfig,
  type Settings,
  DEFAULT_SETTINGS,
  DEFAULT_AUTO_CONFIG,
  MIN_VALUE_INTEGER,
  HISTORY_LIMIT,
} from "../types/game";
import { clampExponent } from "../modes/exponentialMode";

const MIN_VALUE = fromSafeInteger(MIN_VALUE_INTEGER);
const MAX_FREE_VALUE = fromPowerOfTen(3_000_003n);

function clampToGameRange(value: HugeNumber, mode: GameMode): HugeNumber {
  if (mode === "exponential") {
    return compare(value, fromSafeInteger(0)) < 0 ? fromSafeInteger(0) : value;
  }
  return clampHuge(value, MIN_VALUE, MAX_FREE_VALUE);
}

export function createInitialState(): GameState {
  return {
    value: fromSafeInteger(1),
    mode: "free",
    exponent: 0n,
    history: [],
    future: [],
    auto: { ...DEFAULT_AUTO_CONFIG },
    settings: { ...DEFAULT_SETTINGS },
    greenScreen: { active: false, hidePanels: false, hideText: false, watermarkPosition: "bottom-right" },
    lastMessage: null,
    lastError: null,
    planetIndex: 0,
  };
}

export type GameAction =
  | { type: "APPLY_DELTA"; delta: HugeNumber; message?: string }
  | { type: "MULTIPLY_BY"; text: string }
  | { type: "DIVIDE_BY"; text: string }
  | { type: "SET_VALUE"; value: HugeNumber; message?: string }
  | { type: "RESET_ZERO" }
  | { type: "RESET_ONE" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "SET_EXPONENT"; exponent: bigint }
  | { type: "ADJUST_EXPONENT"; delta: bigint }
  | { type: "SET_AUTO_CONFIG"; config: Partial<AutoModeConfig> }
  | { type: "TOGGLE_AUTO_RUNNING" }
  | { type: "AUTO_TICK"; value: HugeNumber; exponent: bigint; planetIndex?: number }
  | { type: "SET_SETTINGS"; settings: Partial<Settings> }
  | { type: "SET_GREEN_SCREEN"; config: Partial<GameState["greenScreen"]> }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR_MESSAGE" }
  | { type: "CLEAR_PROGRESS" }
  | { type: "HYDRATE"; state: Partial<GameState> };

function pushHistory(state: GameState): Pick<GameState, "history" | "future"> {
  const history = [...state.history, state.value].slice(-HISTORY_LIMIT);
  return { history, future: [] };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "APPLY_DELTA": {
      const nextValue = clampToGameRange(add(state.value, action.delta), state.mode);
      return {
        ...state,
        ...pushHistory(state),
        value: nextValue,
        lastMessage: action.message ?? null,
        lastError: null,
      };
    }
    case "MULTIPLY_BY": {
      try {
        const multiplier = fromDecimalString(action.text);
        const nextValue = clampToGameRange(multiply(state.value, multiplier), state.mode);
        return { ...state, ...pushHistory(state), value: nextValue, lastError: null };
      } catch (error) {
        return { ...state, lastError: friendlyError(error) };
      }
    }
    case "DIVIDE_BY": {
      try {
        const divisor = fromDecimalString(action.text);
        const nextValue = clampToGameRange(divide(state.value, divisor), state.mode);
        return { ...state, ...pushHistory(state), value: nextValue, lastError: null };
      } catch (error) {
        return { ...state, lastError: friendlyError(error) };
      }
    }
    case "SET_VALUE": {
      return {
        ...state,
        ...pushHistory(state),
        value: clampToGameRange(action.value, state.mode),
        lastMessage: action.message ?? null,
        lastError: null,
      };
    }
    case "RESET_ZERO":
      return { ...state, ...pushHistory(state), value: fromSafeInteger(0), lastError: null };
    case "RESET_ONE":
      return { ...state, ...pushHistory(state), value: fromSafeInteger(1), lastError: null };
    case "UNDO": {
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return {
        ...state,
        value: previous,
        history: state.history.slice(0, -1),
        future: [state.value, ...state.future].slice(0, HISTORY_LIMIT),
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        value: next,
        future: rest,
        history: [...state.history, state.value].slice(-HISTORY_LIMIT),
      };
    }
    case "SET_MODE": {
      const exponent = action.mode === "exponential" ? deriveExponent(state.value) : state.exponent;
      return { ...state, mode: action.mode, exponent, lastError: null };
    }
    case "SET_EXPONENT": {
      const exponent = clampExponent(action.exponent);
      return {
        ...state,
        ...pushHistory(state),
        exponent,
        value: fromPowerOfTen(exponent),
        lastError: null,
      };
    }
    case "ADJUST_EXPONENT": {
      const exponent = clampExponent(state.exponent + action.delta);
      return {
        ...state,
        ...pushHistory(state),
        exponent,
        value: fromPowerOfTen(exponent),
        lastError: null,
      };
    }
    case "SET_AUTO_CONFIG":
      return { ...state, auto: { ...state.auto, ...action.config } };
    case "TOGGLE_AUTO_RUNNING":
      return { ...state, auto: { ...state.auto, running: !state.auto.running } };
    case "AUTO_TICK":
      return {
        ...state,
        value: action.value,
        exponent: action.exponent,
        planetIndex: action.planetIndex ?? state.planetIndex,
      };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "SET_GREEN_SCREEN":
      return { ...state, greenScreen: { ...state.greenScreen, ...action.config } };
    case "CLEAR_ERROR":
      return { ...state, lastError: null };
    case "CLEAR_MESSAGE":
      return { ...state, lastMessage: null };
    case "CLEAR_PROGRESS":
      return createInitialState();
    case "HYDRATE":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

function deriveExponent(value: HugeNumber): bigint {
  if (compare(value, fromSafeInteger(0)) <= 0) return 0n;
  return clampExponent(orderOfMagnitude(value) < 0n ? 0n : orderOfMagnitude(value));
}

function friendlyError(error: unknown): string {
  if (error instanceof HugeNumberError) {
    switch (error.code) {
      case "DIVIDE_BY_ZERO":
        return "Ops! Não dá para dividir por zero. Tente outro número!";
      case "EXPONENT_OUT_OF_RANGE":
        return "Esse número é grande demais até para este jogo!";
      default:
        return "Esse número não é válido. Tente algo como 2, 0.5 ou -3.";
    }
  }
  return "Algo deu errado com essa operação. Tente novamente!";
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const actions = useMemo(
    () => ({
      increment: (amount = "1") =>
        dispatch({ type: "APPLY_DELTA", delta: fromDecimalString(amount) }),
      decrement: (amount = "1") =>
        dispatch({ type: "APPLY_DELTA", delta: negateSafe(amount) }),
      multiplyBy: (text: string) => dispatch({ type: "MULTIPLY_BY", text }),
      divideBy: (text: string) => dispatch({ type: "DIVIDE_BY", text }),
      setValue: (value: HugeNumber, message?: string) => dispatch({ type: "SET_VALUE", value, message }),
      resetToZero: () => dispatch({ type: "RESET_ZERO" }),
      resetToOne: () => dispatch({ type: "RESET_ONE" }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      setMode: (mode: GameMode) => dispatch({ type: "SET_MODE", mode }),
      setExponent: (exponent: bigint) => dispatch({ type: "SET_EXPONENT", exponent }),
      adjustExponent: (delta: bigint) => dispatch({ type: "ADJUST_EXPONENT", delta }),
      setAutoConfig: (config: Partial<AutoModeConfig>) => dispatch({ type: "SET_AUTO_CONFIG", config }),
      toggleAutoRunning: () => dispatch({ type: "TOGGLE_AUTO_RUNNING" }),
      autoTick: (value: HugeNumber, exponent: bigint, planetIndex?: number) =>
        dispatch({ type: "AUTO_TICK", value, exponent, planetIndex }),
      setSettings: (settings: Partial<Settings>) => dispatch({ type: "SET_SETTINGS", settings }),
      setGreenScreen: (config: Partial<GameState["greenScreen"]>) =>
        dispatch({ type: "SET_GREEN_SCREEN", config }),
      clearError: () => dispatch({ type: "CLEAR_ERROR" }),
      clearMessage: () => dispatch({ type: "CLEAR_MESSAGE" }),
      clearProgress: () => dispatch({ type: "CLEAR_PROGRESS" }),
      hydrate: (partial: Partial<GameState>) => dispatch({ type: "HYDRATE", state: partial }),
    }),
    [],
  );

  return { state, dispatch, actions };
}

function negateSafe(text: string): HugeNumber {
  try {
    return negate(fromDecimalString(text));
  } catch {
    return fromSafeInteger(-1);
  }
}
