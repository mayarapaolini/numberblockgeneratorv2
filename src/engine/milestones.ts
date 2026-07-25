import { type HugeNumber, fromPowerOfTen, fromSafeInteger, MAX_EXPONENT } from "./HugeNumber";

export interface Milestone {
  id: string;
  label: string;
  description: string;
  category: "small" | "negative" | "tens" | "big" | "power";
  value: () => HugeNumber;
}

const small = (n: number): Milestone => ({
  id: `n${n}`,
  label: String(n),
  description: n === 0 ? "O ponto de partida de todos os números." : `O número ${n}.`,
  category: "small",
  value: () => fromSafeInteger(n),
});

const negative = (n: number): Milestone => ({
  id: `neg${Math.abs(n)}`,
  label: String(n),
  description: `${Math.abs(n)} passos abaixo do zero.`,
  category: "negative",
  value: () => fromSafeInteger(n),
});

const ten = (n: number): Milestone => ({
  id: `tens${n}`,
  label: String(n),
  description: `${n / 10} grupos de dez.`,
  category: "tens",
  value: () => fromSafeInteger(n),
});

const power = (exp: number, label: string, description: string): Milestone => ({
  id: `pow${exp}`,
  label,
  description,
  category: "power",
  value: () => fromPowerOfTen(BigInt(exp)),
});

export const MILESTONES: Milestone[] = [
  small(0),
  ...Array.from({ length: 20 }, (_, i) => small(i + 1)),
  ...Array.from({ length: 49 }, (_, i) => negative(-(i + 1))),
  ...Array.from({ length: 9 }, (_, i) => ten((i + 1) * 10)),
  {
    id: "hundred",
    label: "100",
    description: "Cem! Dez grupos de dez blocos.",
    category: "big",
    value: () => fromSafeInteger(100),
  },
  {
    id: "thousand",
    label: "1.000",
    description: "Mil! Já não dá mais para ver cada bloco individualmente.",
    category: "big",
    value: () => fromSafeInteger(1000),
  },
  {
    id: "million",
    label: "1.000.000",
    description: "Um milhão! Mil grupos de mil.",
    category: "big",
    value: () => fromPowerOfTen(6n),
  },
  {
    id: "billion",
    label: "1 bilhão",
    description: "Mil milhões! Um número enorme.",
    category: "big",
    value: () => fromPowerOfTen(9n),
  },
  {
    id: "trillion",
    label: "1 trilhão",
    description: "Um milhão de milhões!",
    category: "big",
    value: () => fromPowerOfTen(12n),
  },
  power(19, "10¹⁹", "A escala do primeiro planeta da Planet 100!"),
  power(20, "10²⁰", "A escala do segundo planeta da Planet 100!"),
  power(21, "10²¹", "A escala do terceiro planeta da Planet 100!"),
  power(33, "10³³ (1 decilhão)", "Um decilhão! O número 1 seguido de 33 zeros — muito, muito maior que um trilhão."),
  power(100, "10¹⁰⁰", "Um googol! Mais que os átomos do universo conhecido."),
  power(1000, "10¹⁰⁰⁰", "Um número com mil zeros."),
  power(99999, "10⁹⁹⁹⁹⁹", "Um número com cem mil zeros, quase!"),
  {
    id: "max",
    label: `10^${MAX_EXPONENT.toString()}`,
    description: "O maior número que este jogo consegue mostrar!",
    category: "power",
    value: () => fromPowerOfTen(MAX_EXPONENT),
  },
  {
    id: "googolplex",
    label: "Googolplex",
    description:
      "Um googolplex é 10 elevado a um googol — um 1 seguido de tantos zeros que nem este jogo (nem nenhum computador!) conseguiria escrevê-los todos. Aqui mostramos o maior número que este jogo alcança, só para você imaginar o quanto o googolplex real é ainda maior.",
    category: "power",
    value: () => fromPowerOfTen(MAX_EXPONENT),
  },
];
