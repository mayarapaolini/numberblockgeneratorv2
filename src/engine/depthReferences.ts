export interface DepthReference {
  id: string;
  name: string;
  location: string;
  depthMeters: number;
  emoji: string;
  funFact: string;
}

/**
 * Real-world depths, ordered shallow to deep, used to give negative numbers
 * a concrete meaning: "below zero" becomes "below the surface of the water".
 * The game's negative range is fixed at -1..-49, so instead of a log scale
 * (too coarse over such a small range) we map |value| linearly across this
 * curated list.
 */
export const DEPTH_REFERENCES: DepthReference[] = [
  { id: "poca", name: "uma poça d'água", location: "no seu quintal", depthMeters: 0.05, emoji: "💧", funFact: "Rasinha, mal molha os pés!" },
  { id: "piscina", name: "uma piscina", location: "em qualquer lugar do mundo", depthMeters: 3, emoji: "🏊", funFact: "A parte funda de uma piscina normal." },
  { id: "lagorasoo", name: "um lago raso", location: "em qualquer lugar do mundo", depthMeters: 10, emoji: "🏞️", funFact: "Dá pra ver o fundo em água limpa." },
  { id: "mergulhador", name: "um mergulhador com cilindro", location: "em recifes de coral", depthMeters: 18, emoji: "🤿", funFact: "É a profundidade máxima recomendada para mergulho recreativo." },
  { id: "submarino", name: "um submarino", location: "no oceano", depthMeters: 300, emoji: "🚤", funFact: "Submarinos militares conseguem mergulhar bem fundo." },
  { id: "titanic", name: "os destroços do Titanic", location: "no Oceano Atlântico", depthMeters: 3800, emoji: "🚢", funFact: "O navio afundou em 1912 e está lá até hoje." },
  { id: "fossaportorico", name: "a Fossa de Porto Rico", location: "no Oceano Atlântico", depthMeters: 8400, emoji: "🌊", funFact: "É o ponto mais profundo do Oceano Atlântico." },
  { id: "fossamarianas", name: "a Fossa das Marianas", location: "no Oceano Pacífico", depthMeters: 10_935, emoji: "🐙", funFact: "É o ponto mais profundo já medido em todos os oceanos do mundo!" },
];

/** Maps |value| in the fixed -1..-49 game range onto a depth reference. */
export function findClosestDepthReference(absoluteValue: number): DepthReference {
  const clamped = Math.min(49, Math.max(1, Math.round(absoluteValue)));
  const index = Math.round(((clamped - 1) / 48) * (DEPTH_REFERENCES.length - 1));
  return DEPTH_REFERENCES[index];
}

export function describeDepthComparison(absoluteValue: number): string {
  const reference = findClosestDepthReference(absoluteValue);
  return `🌊 Números negativos são como mergulhar abaixo da superfície! Nesta profundidade, você estaria perto de ${reference.name}, ${reference.location}. ${reference.emoji} ${reference.funFact}`;
}
