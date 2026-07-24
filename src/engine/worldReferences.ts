import { type HugeNumber } from "./HugeNumber";
import { toSmallNumber } from "./visualLevel";
import { describeDepthComparison } from "./depthReferences";

const MAGNITUDE_CAP = 30;

/**
 * A continuous (fractional) order of magnitude, unlike `orderOfMagnitude`
 * which floors to an integer decade — that's fine for comparisons but too
 * coarse here, where 93 and 828 both round down to "magnitude 2" yet should
 * clearly match different landmarks. Safe up to galactic scale: `finite`
 * coefficients never exceed ~10^24 (nowhere near double overflow), and
 * `scientific` exponents are clamped before use.
 */
function fractionalMagnitude(value: HugeNumber): number {
  if (value.kind === "finite") {
    const numeric = Number(value.coefficient) / 10 ** value.scale;
    return numeric > 0 ? Math.log10(numeric) : 0;
  }
  const exponentNumber = value.exponent > BigInt(MAGNITUDE_CAP + 10) ? MAGNITUDE_CAP + 10 : Number(value.exponent);
  return exponentNumber + Math.log10(Number(value.mantissaThousandths) / 1000);
}

export interface WorldReference {
  id: string;
  name: string;
  country: string;
  heightMeters: number;
  emoji: string;
  funFact: string;
}

/**
 * Real-world heights (in meters) used to compare against the current number
 * — "if this number were a height in meters, what would it be as tall as?"
 * Sorted from smallest to largest; values are safe JS numbers (well within
 * double precision) even at galactic scale, so no HugeNumber math is needed
 * here — only `orderOfMagnitude` from the game value.
 */
export const WORLD_REFERENCES: WorldReference[] = [
  { id: "formiga", name: "uma formiga", country: "em qualquer lugar do mundo", heightMeters: 0.005, emoji: "🐜", funFact: "Formigas são pequenas, mas fortíssimas para o tamanho delas!" },
  { id: "borboleta", name: "uma borboleta", country: "em qualquer lugar do mundo", heightMeters: 0.05, emoji: "🦋", funFact: "Algumas borboletas voam milhares de quilômetros na migração." },
  { id: "gato", name: "um gato", country: "em qualquer lugar do mundo", heightMeters: 0.3, emoji: "🐈", funFact: "Gatos conseguem pular até 6 vezes a própria altura." },
  { id: "crianca", name: "uma criança de 6 anos", country: "em qualquer lugar do mundo", heightMeters: 1.15, emoji: "🧒", funFact: "Assim como você, esse número também está crescendo!" },
  { id: "girafa", name: "uma girafa", country: "na savana africana", heightMeters: 5.5, emoji: "🦒", funFact: "A girafa é o animal terrestre mais alto do mundo." },
  { id: "casa", name: "uma casa de dois andares", country: "em qualquer lugar do mundo", heightMeters: 7, emoji: "🏠", funFact: "Duas girafas quase do tamanho dessa casa!" },
  { id: "cristoredentor", name: "o Cristo Redentor", country: "no Brasil", heightMeters: 38, emoji: "🗿", funFact: "Fica no alto do morro do Corcovado, no Rio de Janeiro." },
  { id: "estatuadaliberdade", name: "a Estátua da Liberdade", country: "nos Estados Unidos", heightMeters: 93, emoji: "🗽", funFact: "Foi um presente da França para os Estados Unidos." },
  { id: "torreeiffel", name: "a Torre Eiffel", country: "na França", heightMeters: 330, emoji: "🗼", funFact: "Fica em Paris e foi construída para uma feira mundial em 1889." },
  { id: "burjkhalifa", name: "o Burj Khalifa", country: "nos Emirados Árabes Unidos", heightMeters: 828, emoji: "🏙️", funFact: "É o prédio mais alto do mundo, em Dubai!" },
  { id: "everest", name: "o Monte Everest", country: "entre o Nepal e a China", heightMeters: 8849, emoji: "🏔️", funFact: "É a montanha mais alta do mundo, acima do nível do mar." },
  { id: "estratosfera", name: "o topo da estratosfera", country: "bem acima de todo o mundo", heightMeters: 50_000, emoji: "🎈", funFact: "Balões meteorológicos voam por essas alturas." },
  { id: "issorbit", name: "a órbita da Estação Espacial Internacional", country: "acima de todos os países", heightMeters: 400_000, emoji: "🛰️", funFact: "Astronautas de vários países vivem e trabalham lá em cima." },
  { id: "terra_diametro", name: "o diâmetro da Terra", country: "o nosso planeta inteiro", heightMeters: 12_742_000, emoji: "🌍", funFact: "Dá para colocar mais de 15 mil Burj Khalifas empilhados!" },
  { id: "lua_distancia", name: "a distância até a Lua", country: "no espaço", heightMeters: 384_400_000, emoji: "🌕", funFact: "Astronautas da missão Apollo viajaram essa distância." },
  { id: "sol_diametro", name: "o diâmetro do Sol", country: "no centro do Sistema Solar", heightMeters: 1_392_700_000, emoji: "☀️", funFact: "Caberiam mais de 1 milhão de planetas Terra dentro do Sol!" },
  { id: "sol_distancia", name: "a distância da Terra até o Sol", country: "no Sistema Solar", heightMeters: 149_600_000_000, emoji: "🛰️", funFact: "A luz do Sol demora cerca de 8 minutos para chegar até nós." },
  { id: "sistemasolar", name: "o tamanho do Sistema Solar", country: "além de todos os planetas", heightMeters: 9_000_000_000_000, emoji: "🪐", funFact: "Inclui o Sol e todos os planetas, incluindo Netuno." },
  { id: "anoluz", name: "um ano-luz", country: "entre as estrelas", heightMeters: 9_460_730_000_000_000, emoji: "✨", funFact: "É a distância que a luz percorre em um ano inteiro!" },
  { id: "viaLactea", name: "o diâmetro da Via Láctea", country: "a nossa galáxia", heightMeters: 9.5e20, emoji: "🌌", funFact: "Nossa galáxia tem bilhões de estrelas, e o Sol é só uma delas." },
  { id: "universo", name: "o tamanho do universo observável", country: "tudo o que já vimos", heightMeters: 8.8e26, emoji: "🌠", funFact: "Além disso, ninguém sabe o que existe — é maior do que conseguimos imaginar!" },
];

/**
 * Finds the world reference whose height is closest in order of magnitude to
 * the current value, treating the value as "a height in meters". Stays O(1)
 * — never converts a HugeNumber beyond galactic scale into a JS number.
 */
export function findClosestWorldReference(value: HugeNumber): WorldReference {
  if (value.sign <= 0) return WORLD_REFERENCES[0];

  const cappedMagnitude = Math.min(MAGNITUDE_CAP, fractionalMagnitude(value));

  let best = WORLD_REFERENCES[0];
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const reference of WORLD_REFERENCES) {
    const referenceMagnitude = Math.log10(reference.heightMeters);
    const diff = Math.abs(referenceMagnitude - cappedMagnitude);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = reference;
    }
  }
  return best;
}

export function describeWorldComparison(value: HugeNumber): string {
  if (value.sign === -1) {
    return describeDepthComparison(Math.abs(toSmallNumber(value)));
  }
  if (value.sign === 0) {
    return "📏 Zero é o ponto de partida — nem para cima, nem para baixo!";
  }
  const reference = findClosestWorldReference(value);
  return `📏 Se esse número fosse uma altura em metros, seria quase como ${reference.name}, ${reference.country}! ${reference.emoji} ${reference.funFact}`;
}
