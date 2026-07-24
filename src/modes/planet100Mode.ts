import { fromPowerOfTen, type HugeNumber } from "../engine/HugeNumber";

export interface PlanetStop {
  id: string;
  name: string;
  exponent: bigint;
  color: string;
  description: string;
  comparison: string;
}

export const PLANET_STOPS: PlanetStop[] = [
  {
    id: "p0",
    name: "Planeta Um",
    exponent: 0n,
    color: "#f97316",
    description: "Aqui a viagem começa: 10 elevado a 0 é só o número 1!",
    comparison: "Do tamanho de uma única bolinha.",
  },
  {
    id: "p1",
    name: "Planeta Dez",
    exponent: 1n,
    color: "#fb923c",
    description: "10 elevado a 1 é dez. Uma fileira completa de blocos!",
    comparison: "Do tamanho de uma caixa de dez.",
  },
  {
    id: "p2",
    name: "Planeta Cem",
    exponent: 2n,
    color: "#facc15",
    description: "10 elevado a 2 é cem: dez fileiras de dez!",
    comparison: "Do tamanho de uma folha cheia de bolinhas.",
  },
  {
    id: "p3",
    name: "Planeta Mil",
    exponent: 3n,
    color: "#a3e635",
    description: "10 elevado a 3 é mil: dez blocos de cem!",
    comparison: "Do tamanho de uma caixa grande de brinquedos.",
  },
  {
    id: "p6",
    name: "Planeta Milhão",
    exponent: 6n,
    color: "#34d399",
    description: "10 elevado a 6 é um milhão! Grande demais para contar um por um.",
    comparison: "Como todos os grãos de areia de um balde bem cheio.",
  },
  {
    id: "p9",
    name: "Planeta Bilhão",
    exponent: 9n,
    color: "#22d3ee",
    description: "10 elevado a 9 é um bilhão! Mil milhões juntos.",
    comparison: "Como as estrelas que dá pra ver numa noite muito especial.",
  },
  {
    id: "p12",
    name: "Planeta Trilhão",
    exponent: 12n,
    color: "#60a5fa",
    description: "10 elevado a 12 é um trilhão! Um milhão de milhões.",
    comparison: "Maior que qualquer coisa que você já contou na vida.",
  },
  {
    id: "p15",
    name: "Planeta Quatrilhão",
    exponent: 15n,
    color: "#818cf8",
    description: "10 elevado a 15! Os números estão ficando gigantes.",
    comparison: "Como contar cada segundo em 32 milhões de anos.",
  },
  {
    id: "p18",
    name: "Planeta Quintilhão",
    exponent: 18n,
    color: "#a78bfa",
    description: "10 elevado a 18! Quase chegando na fronteira cósmica.",
    comparison: "Perto da quantidade de grãos de areia em todas as praias da Terra.",
  },
  {
    id: "p19",
    name: "Planeta Nebulosa",
    exponent: 19n,
    color: "#c084fc",
    description: "10 elevado a 19! Entramos na zona astronômica de verdade.",
    comparison: "Mais que o número de estrelas em todas as galáxias visíveis.",
  },
  {
    id: "p20",
    name: "Planeta Galáxia",
    exponent: 20n,
    color: "#e879f9",
    description: "10 elevado a 20! Um número do tamanho do universo.",
    comparison: "Dez vezes maior que o Planeta Nebulosa.",
  },
  {
    id: "p21",
    name: "Planeta Infinito Distante",
    exponent: 21n,
    color: "#f472b6",
    description: "10 elevado a 21! O topo da nossa viagem especial.",
    comparison: "Dez vezes maior que o Planeta Galáxia — o fim desta jornada!",
  },
];

export function planetValue(stop: PlanetStop): HugeNumber {
  return fromPowerOfTen(stop.exponent);
}
