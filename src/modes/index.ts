import type { GameMode } from "../types/game";

export interface ModeDefinition {
  id: GameMode;
  label: string;
  icon: string;
  description: string;
}

export const MODE_DEFINITIONS: ModeDefinition[] = [
  { id: "free", label: "Livre", icon: "🎮", description: "Controle o número manualmente." },
  { id: "elongation", label: "Alongamento", icon: "📏", description: "Veja o personagem crescer de verdade." },
  { id: "automatic", label: "Automático", icon: "⚙️", description: "Deixe o número mudar sozinho." },
  { id: "negative", label: "Negativos", icon: "❄️", description: "Explore números abaixo do zero." },
  { id: "exponential", label: "Potências de 10", icon: "🚀", description: "Viaje pelas potências de dez." },
  { id: "planet100", label: "Planet 100", icon: "🪐", description: "Uma viagem espacial pelo sistema decimal." },
  { id: "greenscreen", label: "Tela Verde", icon: "🟩", description: "Modo chroma key para gravações." },
];

export * from "./freeMode";
export * from "./elongationMode";
export * from "./automaticMode";
export * from "./negativeMode";
export * from "./exponentialMode";
export * from "./planet100Mode";
