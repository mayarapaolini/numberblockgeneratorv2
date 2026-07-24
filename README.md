# Laboratório dos Números

Um laboratório visual de números para crianças (a partir de 6 anos), inspirado
conceitualmente em brincadeiras com "blocos numéricos" — mas com mecânicas,
código, arte e motor matemático 100% originais. Nenhum código, imagem, áudio
ou outro arquivo do projeto de referência do Scratch foi copiado; os
personagens são blocos geométricos coloridos originais e as animações são
desenhadas em runtime com Canvas 2D.

O jogo é uma SPA React + TypeScript, funciona 100% no navegador (sem
backend), é instalável como PWA e foi desenhado com o **iPad em Safari** como
plataforma principal.

## Destaques

- **Motor numérico próprio (`HugeNumber`)**: representa valores de `-49` até
  `10^3000003` sem nunca usar `Number`/`Math.pow` como fonte de verdade, sem
  gerar `Infinity`/`NaN` e sem montar strings com milhões de caracteres.
- **4 níveis de representação visual**: blocos literais numerados (até 200,
  no espírito dos blocos numéricos coloridos, mas com arte 100% original),
  blocos agrupados por valor posicional (milhares/centenas/dezenas/unidades),
  personagem simbólico e cena cósmica abstrata — com custo de renderização
  constante mesmo em `10^3000003`.
- **7 modos de jogo**: Livre, Alongamento, Automático, Negativos, Potências de
  10, Planet 100 e Tela Verde (chroma key).
- **Comparações com o mundo real e cultura**: cada número positivo é
  comparado a uma altura real — de uma formiga ao Burj Khalifa (Dubai), Cristo
  Redentor (Brasil), Torre Eiffel (França), Monte Everest, até escalas
  astronômicas (Sol, Via Láctea, universo observável). Números negativos
  comparam profundidades reais, de uma poça d'água até a Fossa das Marianas.
- **Layout em duas colunas**: em telas largas (iPad paisagem, desktop) os
  controles ficam numa barra lateral rolável, deixando o personagem com todo
  o espaço do palco; em telas estreitas eles voltam a ser um painel inferior.
- **Sons via Web Audio API** (sem arquivos de áudio), narração opcional em
  pt-BR via `SpeechSynthesis`, e respeito total a "reduzir movimento".
- **PWA instalável** com funcionamento offline após o primeiro carregamento.
- **Acessível**: navegação por teclado, `aria-label` em todos os controles,
  alvos de toque ≥ 48×48px, foco visível, sem informação transmitida só por cor.

## Stack

Vite · React 19 · TypeScript (modo estrito) · CSS Modules · Canvas 2D ·
Vitest · Playwright · `localStorage` · `vite-plugin-pwa`.

## Como rodar

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção
npm run test        # testes unitários (Vitest)
npm run test:e2e    # testes end-to-end (Playwright, inicia o preview sozinho)
npm run lint        # oxlint
```

## O motor `HugeNumber`

Arquivo principal: `src/engine/HugeNumber.ts`.

```ts
type HugeNumber =
  | { kind: "finite"; sign: -1 | 0 | 1; coefficient: bigint; scale: number }
  | { kind: "scientific"; sign: -1 | 1; mantissaThousandths: bigint; exponent: bigint };
```

- **`finite`**: valores exatos, `valor = sign * coefficient / 10^scale`, com
  `scale` sempre ≤ 3 (precisão mínima garantida de um milésimo). Usado
  enquanto a parte inteira tiver até 21 dígitos.
- **`scientific`**: `valor = sign * (mantissaThousandths / 1000) * 10^exponent`,
  com mantissa normalizada em 4 dígitos significativos (`1000..9999`) e
  `exponent` em `bigint`, limitado a `0..3_000_003`.
- A transição entre as duas representações é automática e é exatamente o
  limite usado para escolher o nível visual do personagem (nível 3 vs. 4).

Operações (`src/engine/operations.ts`) trabalham sobre uma forma compacta
`{ sign, coeff, exp }` derivada de ambas as representações. Somas/subtrações
entre números de ordens de grandeza muito diferentes (ex.: `10^3000003 + 1`)
descartam o lado desprezível em vez de alinhar exponents astronomicamente
distantes — por isso o custo das operações é O(1)/O(log n) e nunca
proporcional ao expoente. Multiplicação/divisão operam diretamente em
`bigint`, e o expoente resultante é sempre saturado (nunca ultrapassa) em
`3_000_003`.

Formatação (`src/engine/HugeNumberFormatter.ts`) decide entre notação simples
(`125,375`) e científica (`4,273 × 10¹⁸`) puramente pelo número de dígitos —
nunca gerando uma string com todos os dígitos de um número gigante.

### Testes do motor (`src/tests/HugeNumber.test.ts`)

23 testes unitários cobrindo exatamente os casos pedidos: `999 + 1`, `1 ÷ 3`
(arredondamento a milésimos), `1.5 × 2`, `10^99999`, `10^3000003`, comparação
`10^99999 < 10^100000`, multiplicação de dois números em notação científica,
ausência de `Infinity`/`NaN`, limite máximo de expoente, negativos até `-49`,
e arredondamento para milésimos em geral.

## Estrutura do projeto

```
src/
  engine/         HugeNumber, formatter, nomes por extenso, marcos, níveis visuais, educação
  modes/          lógica por modo (livre, alongamento, automático, negativo, exponencial, Planet 100)
  hooks/          useGameState, useAutoMode, useSound, useNarration, useKeyboardControls,
                  usePersistence, useFullscreen, usePwaUpdate
  components/     GameStage, NumberCharacter (Canvas), NumberDisplay, ControlPanel,
                  ModeSelector, SpecialNumbers, SettingsDialog, GreenScreen
  types/          tipos compartilhados de estado do jogo
  tests/          testes unitários (Vitest)
  styles/         tema global, safe-area, resets para iPad
e2e/              testes end-to-end (Playwright)
scripts/          utilitário para gerar os ícones do PWA
```

## Modos de jogo

- **Livre**: soma, subtrai, multiplica e divide manualmente.
- **Alongamento**: o personagem cresce/diminui com escala visual comprimida
  (log), sempre visível na tela.
- **Automático**: crescer/diminuir/multiplicar/dividir/percorrer números
  especiais/percorrer potências de 10 sozinho, com velocidade 0,25×–4×, passo,
  limite e opção de repetir. Roda em um `setTimeout` auto-cancelável (não usa
  loop ocupado), então nunca trava a interface.
- **Negativos**: explora `-1` a `-49`, com paleta fria, expressão "gelada" e
  explicação infantil. `-15` tem uma apresentação fixa e consistente.
- **Potências de 10**: navega `10^0` a `10^3000003` com passos de
  ±1/±10/±100/±1.000, campo para digitar o expoente, atalho para o máximo e
  marcos especiais.
- **Planet 100**: 12 paradas espaciais (arte original) cobrindo `10^0` até
  `10^21`, com descrição e comparação de escala infantis em cada parada —
  incluindo `10^19`, `10^20` e `10^21` como pedido.
- **Tela Verde**: fundo `#00FF00` puro, opção de esconder painéis/texto,
  marca d'água reposicionável, saída pela tecla `G` ou botão.

## Atalhos de teclado

`↑` aumentar · `↓` diminuir · `→` próximo marco · `←` marco anterior ·
`Espaço` pausar/continuar automação · `M` som · `F` tela cheia · `G` tela
verde · `R` voltar para 1.

## Persistência

Salvo em `localStorage` (chave `numberlab.state.v1`): último número, modo,
configurações (som, volume, reduzir movimento, narração, ocultar efeitos),
histórico recente (até 10 entradas) e configuração de velocidade do modo
automático (sem o estado "rodando", que sempre volta pausado). Desfazer/refazer
mantêm um histórico limitado a 50 entradas em memória para não crescer sem
limite. "Apagar progresso" (em Configurações) limpa tudo.

## iPad / Safari

- Layout calculado com `100dvh`/`svh` e `env(safe-area-inset-*)`, nunca só
  `100vh`.
- `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`,
  `user-select: none` fora de campos de texto, e `overscroll-behavior: none`
  evitam zoom/seleção acidental e "bounce" da página durante o toque.
- Todos os alvos de toque têm no mínimo 48×48px.
- Tela cheia usa a Fullscreen API quando disponível (desktop) e cai para um
  modo simulado por CSS quando não está (iPad Safari não permite fullscreen
  de elemento arbitrário).
- Som é inicializado só após o primeiro gesto do usuário (`AudioContext`
  respeita a política de autoplay do Safari).
- PWA instalável via *Compartilhar → Adicionar à Tela de Início*, com
  `manifest.webmanifest`, ícone Apple Touch dedicado, service worker
  (`vite-plugin-pwa`) e aviso amigável quando há uma nova versão em cache.

## Testes

```bash
npm run test       # 23 testes unitários do motor HugeNumber
npm run test:e2e   # 11 testes end-to-end (Playwright, viewport de iPad 820×1180)
```

Os testes E2E cobrem: soma/subtração, multiplicação/divisão/decimais, erro de
divisão por zero, navegação entre modos e teclado, modo automático
(iniciar/rodar/pausar sem travar), desfazer/refazer, tela verde, troca para
representação simbólica, comportamento em tela pequena, restauração de
estado após recarregar, e o fluxo crítico completo: aumentar o número, entrar
no modo exponencial, ir até `10^3000003` e confirmar que a interface continua
respondendo, o expoente correto aparece, e nenhum `Infinity`, `NaN` ou erro
de console aparece — inclusive depois de trocar orientação da tela.

## Segurança e privacidade infantil

Sem anúncios, compras, login, chat, links externos, coleta de dados ou
analytics. Nenhum dado pessoal é armazenado — apenas preferências de jogo em
`localStorage`, no próprio dispositivo.

## Limitações conhecidas

- O visual do personagem se inspira na ideia de blocos numéricos coloridos
  empilhados e numerados (comum em materiais educativos), mas não reproduz o
  design, as cores, as expressões ou qualquer arte oficial do show
  Numberblocks — tudo é desenhado do zero em Canvas com paleta e proporções
  próprias, para não infringir direitos autorais de terceiros.
- A Fullscreen API real não está disponível em Safari/iPad para elementos
  arbitrários; o modo "tela cheia" cai automaticamente para uma alternativa
  visual (CSS), como recomendado — validado no simulador do Chromium, não em
  um iPad físico.
- A narração por voz depende de vozes pt-BR instaladas no navegador/SO; sem
  elas, o navegador pode usar a voz padrão do sistema ou nenhuma voz.
- Os testes de responsividade/iPad foram validados via Chromium em viewports
  equivalentes (768×1024, 810×1080, 820×1180, 1024×1366, orientações
  retrato/paisagem); não houve acesso a um dispositivo iPad físico neste
  ambiente de desenvolvimento.
