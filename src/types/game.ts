import type { HugeNumber } from "../engine/HugeNumber";

export type GameMode =
  | "free"
  | "elongation"
  | "automatic"
  | "negative"
  | "exponential"
  | "planet100"
  | "greenscreen";

export type AutoOperation =
  | "increment"
  | "decrement"
  | "multiply"
  | "divide"
  | "specials"
  | "powersOfTen";

export interface AutoModeConfig {
  operation: AutoOperation;
  step: string;
  speed: number;
  limit: string | null;
  repeat: boolean;
  running: boolean;
}

export interface Settings {
  volume: number;
  soundOn: boolean;
  reduceMotion: boolean;
  narrationOn: boolean;
  hideEffects: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.6,
  soundOn: true,
  reduceMotion: false,
  narrationOn: false,
  hideEffects: false,
};

export const DEFAULT_AUTO_CONFIG: AutoModeConfig = {
  operation: "increment",
  step: "1",
  speed: 1,
  limit: null,
  repeat: false,
  running: false,
};

export const MIN_VALUE_INTEGER = -49;
export const HISTORY_LIMIT = 50;

export interface GreenScreenConfig {
  active: boolean;
  hidePanels: boolean;
  hideText: boolean;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface GameState {
  value: HugeNumber;
  mode: GameMode;
  exponent: bigint;
  history: HugeNumber[];
  future: HugeNumber[];
  auto: AutoModeConfig;
  settings: Settings;
  greenScreen: GreenScreenConfig;
  lastMessage: string | null;
  lastError: string | null;
  planetIndex: number;
}
