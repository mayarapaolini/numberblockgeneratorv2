export interface TemperatureReference {
  id: string;
  name: string;
  location: string;
  celsius: number;
  emoji: string;
  funFact: string;
}

/**
 * Real-world and planetary temperatures, ordered mild to extreme cold, used
 * to give negative numbers a second concrete meaning alongside ocean depth:
 * "below zero" is also "colder and colder, like a thermometer dropping".
 * Same fixed -1..-49 game range, mapped linearly like `DEPTH_REFERENCES`.
 */
export const TEMPERATURE_REFERENCES: TemperatureReference[] = [
  { id: "geladeira", name: "dentro de uma geladeira", location: "em qualquer casa", celsius: -4, emoji: "🧊", funFact: "É por isso que a geladeira mantém a comida fresquinha!" },
  { id: "diadeneve", name: "um dia de neve forte", location: "em lugares frios do mundo", celsius: -15, emoji: "❄️", funFact: "Frio o suficiente para fazer um boneco de neve!" },
  { id: "freezer", name: "dentro de um freezer", location: "em qualquer casa", celsius: -18, emoji: "🥶", funFact: "É a temperatura ideal para guardar sorvete!" },
  { id: "antartida", name: "a Antártida no inverno", location: "no polo sul da Terra", celsius: -60, emoji: "🐧", funFact: "Só pinguins e cientistas bem agasalhados aguentam esse frio!" },
  { id: "marte", name: "a superfície de Marte", location: "no planeta Marte", celsius: -65, emoji: "🔴", funFact: "Marte é o planeta vermelho, mas é friíssimo a maior parte do tempo!" },
  { id: "jupiter", name: "a superfície de Júpiter", location: "no planeta Júpiter", celsius: -110, emoji: "🟠", funFact: "Júpiter é o maior planeta do Sistema Solar — e um gigante gelado por fora!" },
  { id: "saturno", name: "a superfície de Saturno", location: "no planeta Saturno", celsius: -140, emoji: "🪐", funFact: "Os anéis de Saturno são feitos de gelo e pedra." },
  { id: "urano", name: "a superfície de Urano", location: "no planeta Urano", celsius: -195, emoji: "🔵", funFact: "Urano é o planeta mais frio do Sistema Solar!" },
  { id: "netuno", name: "a superfície de Netuno", location: "no planeta Netuno", celsius: -200, emoji: "🔷", funFact: "Netuno tem os ventos mais fortes de todos os planetas." },
  { id: "plutao", name: "a superfície de Plutão", location: "no planeta anão Plutão", celsius: -225, emoji: "⚪", funFact: "Plutão fica tão longe do Sol que o dia lá parece um crepúsculo eterno." },
];

/** Maps |value| in the fixed -1..-49 game range onto a temperature reference. */
export function findClosestTemperatureReference(absoluteValue: number): TemperatureReference {
  const clamped = Math.min(49, Math.max(1, Math.round(absoluteValue)));
  const index = Math.round(((clamped - 1) / 48) * (TEMPERATURE_REFERENCES.length - 1));
  return TEMPERATURE_REFERENCES[index];
}

export function describeTemperatureComparison(absoluteValue: number): string {
  const reference = findClosestTemperatureReference(absoluteValue);
  return `🌡️ Números negativos também são como a temperatura caindo abaixo de zero! Nessa marca, estaria tão frio quanto ${reference.name}, ${reference.location}. ${reference.emoji} ${reference.funFact}`;
}
