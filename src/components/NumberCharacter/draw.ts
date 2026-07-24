import type { VisualLevel } from "../../engine/visualLevel";

export type Expression = "happy" | "excited" | "cold" | "awe";

export interface DrawParams {
  level: VisualLevel;
  smallCount: number; // for level 1/2, approximate magnitude as a small number
  isNegative: boolean;
  expression: Expression;
  bouncePhase: number; // 0..1, eased squash/stretch pulse triggered by value changes
  bounceDirection: 1 | -1; // 1 = grew, -1 = shrank
  idleTime: number; // seconds, for gentle idle animation
  reduceMotion: boolean;
  magnitudeRatio: number; // 0..1, how "deep" into the level's range the value is
  hueSeed: number; // 0..1 deterministic seed for cosmic color variety
}

const BLOCK_PALETTE = [
  "#f97316",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fb7185",
  "#34d399",
  "#fbbf24",
];

const COLD_PALETTE = ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd"];

function colorFor(index: number, isNegative: boolean): string {
  if (isNegative) return COLD_PALETTE[index % COLD_PALETTE.length];
  return BLOCK_PALETTE[index % BLOCK_PALETTE.length];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * A single "toy block": flat fill, a soft top-left plastic highlight, and a
 * bold dark outline — the numbered-stacked-block look, drawn entirely with
 * shapes/gradients (no image assets).
 */
function drawToyBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  const radius = Math.min(w, h) * 0.22;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const highlight = ctx.createLinearGradient(x, y, x + w * 0.7, y + h * 0.7);
  highlight.addColorStop(0, "rgba(255,255,255,0.4)");
  highlight.addColorStop(0.55, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  roundRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = "rgba(17,24,39,0.85)";
  ctx.lineWidth = Math.max(1.6, Math.min(w, h) * 0.055);
  ctx.stroke();
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headTopY: number,
  headSize: number,
  expression: Expression,
  wobble: number,
) {
  const eyeY = headTopY + headSize * 0.42;
  const eyeOffset = headSize * 0.24;
  // Big, bold cartoon eyes with a thick outline — the "toy block" look.
  const eyeRadius = expression === "awe" ? headSize * 0.2 : headSize * 0.16;

  for (const dir of [-1, 1]) {
    const ex = cx + dir * eyeOffset + wobble;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    if (expression === "cold") {
      ctx.ellipse(ex, eyeY, eyeRadius, eyeRadius * 0.65, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, eyeRadius * 0.18);
    ctx.strokeStyle = "#1f2937";
    ctx.stroke();

    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(ex, eyeY, eyeRadius * 0.52, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ex + eyeRadius * 0.22, eyeY - eyeRadius * 0.24, eyeRadius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const mouthY = headTopY + headSize * 0.66;
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = Math.max(2, headSize * 0.05);
  ctx.lineCap = "round";
  ctx.beginPath();

  if (expression === "excited") {
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.ellipse(cx + wobble, mouthY, headSize * 0.16, headSize * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (expression === "cold") {
    ctx.beginPath();
    ctx.moveTo(cx - headSize * 0.18 + wobble, mouthY);
    ctx.quadraticCurveTo(cx - headSize * 0.05 + wobble, mouthY + headSize * 0.06, cx + wobble, mouthY);
    ctx.quadraticCurveTo(cx + headSize * 0.05 + wobble, mouthY - headSize * 0.06, cx + headSize * 0.18 + wobble, mouthY);
    ctx.stroke();
  } else if (expression === "awe") {
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.arc(cx + wobble, mouthY, headSize * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx + wobble, mouthY - headSize * 0.05, headSize * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

function drawLimbs(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, width: number, color: string, sway: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, width * 0.08);
  ctx.lineCap = "round";
  const armY = top + (bottom - top) * 0.35;
  ctx.beginPath();
  ctx.moveTo(cx - width * 0.55, armY);
  ctx.lineTo(cx - width * 0.95 + sway, armY + width * 0.35);
  ctx.moveTo(cx + width * 0.55, armY);
  ctx.lineTo(cx + width * 0.95 - sway, armY + width * 0.35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - width * 0.25, bottom);
  ctx.lineTo(cx - width * 0.35 - sway * 0.4, bottom + width * 0.4);
  ctx.moveTo(cx + width * 0.25, bottom);
  ctx.lineTo(cx + width * 0.35 + sway * 0.4, bottom + width * 0.4);
  ctx.stroke();
}

function bounceScale(params: DrawParams): { x: number; y: number } {
  if (params.reduceMotion) return { x: 1, y: 1 };
  const p = params.bouncePhase;
  const eased = Math.sin(p * Math.PI) * (1 - p);
  if (params.bounceDirection === 1) {
    return { x: 1 - eased * 0.12, y: 1 + eased * 0.18 };
  }
  return { x: 1 + eased * 0.14, y: 1 - eased * 0.16 };
}

const BLOCK_COUNT_CAP = 200;

function drawBlockBody(ctx: CanvasRenderingContext2D, cx: number, baseY: number, unit: number, count: number, isNegative: boolean, maxBodyHeight: number, maxBodyWidth: number) {
  const capped = Math.max(1, Math.min(BLOCK_COUNT_CAP, Math.round(Math.abs(count))));
  const perRow = capped <= 10 ? 1 : 10;
  const rows = Math.ceil(capped / perRow);
  const gapRatio = 0.12;
  const idealBlockSize = unit;
  const blockSize = Math.min(
    idealBlockSize,
    maxBodyHeight / (rows * (1 + gapRatio)),
    maxBodyWidth / (perRow * (1 + gapRatio)),
  );
  const gap = blockSize * gapRatio;
  const gridWidth = perRow * (blockSize + gap) - gap;
  const showNumbers = blockSize > 12;

  let blockIndex = 0;
  for (let row = rows - 1; row >= 0 && blockIndex < capped; row--) {
    const inThisRow = Math.min(perRow, capped - blockIndex);
    const rowWidth = inThisRow * (blockSize + gap) - gap;
    const startX = cx - rowWidth / 2;
    for (let col = 0; col < inThisRow; col++) {
      const x = startX + col * (blockSize + gap);
      const y = baseY - (rows - row) * (blockSize + gap);
      drawToyBlock(ctx, x, y, blockSize, blockSize, colorFor(blockIndex, isNegative));
      if (showNumbers) {
        ctx.fillStyle = "rgba(31,41,55,0.85)";
        ctx.font = `800 ${Math.round(blockSize * 0.42)}px "Nunito", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(blockIndex + 1), x + blockSize / 2, y + blockSize / 2 + blockSize * 0.02);
      }
      blockIndex++;
    }
  }

  const headTopY = baseY - rows * (blockSize + gap);
  return { headTopY, headSize: blockSize, gridWidth, top: headTopY, bottom: baseY };
}

/** One place-value tier (thousands/hundreds/tens/ones) of the grouped body. */
function drawPlaceValueTier(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  blockGap: number,
  count: number,
  blockWidth: number,
  blockHeight: number,
  colorIndex: number,
  isNegative: boolean,
  perRow: number,
): number {
  if (count <= 0) return y;
  const rows = Math.ceil(count / perRow);
  let drawn = 0;
  let cursorY = y;
  for (let r = 0; r < rows; r++) {
    const inRow = Math.min(perRow, count - drawn);
    const totalWidth = inRow * (blockWidth + blockGap) - blockGap;
    const startX = cx - totalWidth / 2;
    for (let i = 0; i < inRow; i++) {
      drawToyBlock(
        ctx,
        startX + i * (blockWidth + blockGap),
        cursorY - blockHeight,
        blockWidth,
        blockHeight,
        colorFor(colorIndex, isNegative),
      );
    }
    drawn += inRow;
    cursorY -= blockHeight + blockGap;
  }
  return cursorY;
}

function drawGroupedBody(ctx: CanvasRenderingContext2D, cx: number, baseY: number, unit: number, value: number, isNegative: boolean, maxBodyHeight: number, maxBodyWidth: number) {
  const abs = Math.min(19_999, Math.round(Math.abs(value)));
  const thousands = Math.min(19, Math.floor(abs / 1000));
  const hundreds = Math.floor((abs % 1000) / 100);
  const tens = Math.floor((abs % 100) / 10);
  const ones = abs % 10;

  // Estimate how tall/wide the full tower would be at ideal size, then
  // shrink uniformly to fit the available space — the same trick used for
  // level 1's block grid.
  const thousandsRows = thousands > 0 ? Math.ceil(thousands / 10) : 0;
  const idealHeight =
    thousandsRows * unit * 1.3 + (hundreds > 0 ? unit * 1.1 : 0) + (tens > 0 ? unit * 0.85 : 0) + unit * 0.55;
  const widestRowBlocks = Math.min(10, Math.max(thousands, Math.min(hundreds, 5), tens, ones, 1));
  const idealWidth = widestRowBlocks * unit * 1.7 * 1.15;
  const shrinkH = Math.min(1, maxBodyHeight / Math.max(idealHeight, 1));
  const shrinkW = Math.min(1, maxBodyWidth / Math.max(idealWidth, 1));
  const shrink = Math.min(shrinkH, shrinkW);
  const u = unit * shrink;
  const blockGap = u * 0.15;

  let y = baseY;
  y = drawPlaceValueTier(ctx, cx, y, blockGap, thousands, u * 1.7, u * 1.3, 6, isNegative, 10);
  y = drawPlaceValueTier(ctx, cx, y, blockGap, hundreds, u * 1.6, u * 1.1, 0, isNegative, 5);
  y = drawPlaceValueTier(ctx, cx, y, blockGap, tens, u * 0.9, u * 0.85, 2, isNegative, 10);
  y = drawPlaceValueTier(ctx, cx, y, blockGap, Math.max(1, ones), u * 0.5, u * 0.5, 4, isNegative, 10);

  const headGap = u * 0.55;
  return { headTopY: y - headGap, headSize: u * 0.9, top: y, bottom: baseY };
}

function drawSymbolicBody(ctx: CanvasRenderingContext2D, cx: number, baseY: number, unit: number, magnitudeRatio: number, isNegative: boolean, idleTime: number) {
  const height = unit * (2.2 + magnitudeRatio * 2.2);
  const width = unit * 1.3;
  const top = baseY - height;

  const glow = ctx.createRadialGradient(cx, baseY - height / 2, width * 0.2, cx, baseY - height / 2, width * 2.2);
  const auraColor = isNegative ? "56,189,248" : "129,140,248";
  glow.addColorStop(0, `rgba(${auraColor},0.55)`);
  glow.addColorStop(1, `rgba(${auraColor},0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, baseY - height / 2, width * 2.2, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const ringT = (idleTime * 0.2 + i / 3) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.25 - ringT * 0.15})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - height * 0.3, width * (1.4 + ringT), width * (0.4 + ringT * 0.3), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const bodyGradient = ctx.createLinearGradient(cx, top, cx, baseY);
  bodyGradient.addColorStop(0, isNegative ? "#38bdf8" : "#818cf8");
  bodyGradient.addColorStop(1, isNegative ? "#0369a1" : "#4338ca");
  ctx.fillStyle = bodyGradient;
  roundRect(ctx, cx - width / 2, top, width, height, width * 0.3);
  ctx.fill();

  return { headTopY: top, headSize: width, top, bottom: baseY };
}

function drawCosmicScene(ctx: CanvasRenderingContext2D, width: number, height: number, cx: number, baseY: number, unit: number, idleTime: number, hueSeed: number, isNegative: boolean) {
  const starCount = 42;
  for (let i = 0; i < starCount; i++) {
    const angle = (i / starCount) * Math.PI * 2 + idleTime * 0.05;
    const radius = (i % 5) * (width * 0.09) + width * 0.08;
    const sx = width / 2 + Math.cos(angle) * radius;
    const sy = height * 0.4 + Math.sin(angle * 1.3) * radius * 0.6;
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(idleTime * 1.5 + i));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.4 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  const bodyHeight = unit * 4.6;
  const top = baseY - bodyHeight;
  for (let i = 0; i < 3; i++) {
    const t = (idleTime * 0.12 + i / 3) % 1;
    const hue = (hueSeed * 360 + i * 60) % 360;
    ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${0.5 - t * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, baseY - bodyHeight * 0.35, unit * (1.6 + t * 1.8), unit * (0.5 + t * 0.5), (i * Math.PI) / 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 4; i++) {
    const hue = (hueSeed * 360 + i * 90) % 360;
    const angle = idleTime * 0.15 + (i * Math.PI) / 2;
    const px = cx + Math.cos(angle) * unit * 3.2;
    const py = baseY - bodyHeight * 0.4 + Math.sin(angle) * unit * 1.2;
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
    ctx.beginPath();
    ctx.arc(px, py, unit * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  const gradient = ctx.createLinearGradient(cx, top, cx, baseY);
  gradient.addColorStop(0, isNegative ? "#0ea5e9" : `hsl(${(hueSeed * 360) % 360}, 70%, 62%)`);
  gradient.addColorStop(1, isNegative ? "#075985" : "#312e81");
  ctx.fillStyle = gradient;
  roundRect(ctx, cx - unit * 0.75, top, unit * 1.5, bodyHeight, unit * 0.35);
  ctx.fill();

  return { headTopY: top, headSize: unit * 1.5, top, bottom: baseY };
}

export function drawCharacter(canvas: HTMLCanvasElement, params: DrawParams) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const baseY = height * 0.82;
  const unit = Math.min(width, height) * 0.11;
  const scale = bounceScale(params);
  const bob = params.reduceMotion ? 0 : Math.sin(params.idleTime * 1.6) * 3;
  const wobble = params.expression === "cold" && !params.reduceMotion ? Math.sin(params.idleTime * 10) * 2 : 0;
  const sway = params.reduceMotion ? 0 : Math.sin(params.idleTime * 1.2) * unit * 0.06;

  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(scale.x, scale.y);
  ctx.translate(-cx, -baseY + bob);

  let body: { headTopY: number; headSize: number; top: number; bottom: number };
  const color0 = colorFor(0, params.isNegative);

  const maxBodyHeight = baseY * 0.62;
  const maxBodyWidth = width * 0.92;

  if (params.level <= 3) {
    ctx.fillStyle = "rgba(15,23,42,0.18)";
    ctx.beginPath();
    ctx.ellipse(cx, baseY + unit * 0.12, unit * 1.5, unit * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (params.level === 4) {
    body = drawCosmicScene(ctx, width, height, cx, baseY, unit, params.idleTime, params.hueSeed, params.isNegative);
  } else if (params.level === 3) {
    body = drawSymbolicBody(ctx, cx, baseY, unit, params.magnitudeRatio, params.isNegative, params.idleTime);
  } else if (params.level === 2) {
    body = drawGroupedBody(ctx, cx, baseY, unit, params.smallCount, params.isNegative, maxBodyHeight, maxBodyWidth);
  } else {
    body = drawBlockBody(ctx, cx, baseY, unit, params.smallCount === 0 ? 1 : params.smallCount, params.isNegative, maxBodyHeight, maxBodyWidth);
  }

  drawLimbs(ctx, cx, body.top, body.bottom, unit * 2.2, params.level >= 3 ? color0 : "#475569", sway);
  drawFace(ctx, cx, body.headTopY, body.headSize, params.expression, wobble);

  ctx.restore();
}
