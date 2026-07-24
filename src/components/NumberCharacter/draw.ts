import type { VisualLevel } from "../../engine/visualLevel";
import {
  type ColorPlan,
  RAINBOW_SEQUENCE,
  MILESTONE_BASE,
  coldTint,
  factorGrid,
  identityColorPlan,
} from "../../engine/numberPalette";

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

/** Simple, mobile eyebrow above one eye — the main way expressions read as "alive". */
function drawEyebrow(
  ctx: CanvasRenderingContext2D,
  ex: number,
  eyeY: number,
  eyeRadius: number,
  dir: -1 | 1,
  expression: Expression,
) {
  const browY = eyeY - eyeRadius * (expression === "awe" ? 1.55 : 1.15);
  const tilt = expression === "cold" ? -dir * 0.18 : expression === "excited" ? dir * 0.12 : 0;
  const width = eyeRadius * 0.85;

  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = Math.max(1.6, eyeRadius * 0.22);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ex - width / 2, browY + tilt * width);
  ctx.quadraticCurveTo(ex, browY - eyeRadius * 0.15, ex + width / 2, browY - tilt * width);
  ctx.stroke();
}

/**
 * One large, centered eye and a simple mouth - a plain, generic "single-eye
 * mascot" face (a common, non-exclusive convention across children's
 * characters), original in its proportions, colors, and every other detail.
 */
function drawFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headTopY: number,
  headSize: number,
  expression: Expression,
  wobble: number,
) {
  const eyeY = headTopY + headSize * 0.42;
  const eyeRadius = expression === "awe" ? headSize * 0.3 : headSize * 0.25;
  const ex = cx + wobble;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (expression === "cold") {
    ctx.ellipse(ex, eyeY, eyeRadius, eyeRadius * 0.7, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.lineWidth = Math.max(1.8, eyeRadius * 0.14);
  ctx.strokeStyle = "#1f2937";
  ctx.stroke();

  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(ex, eyeY, eyeRadius * 0.48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ex + eyeRadius * 0.2, eyeY - eyeRadius * 0.22, eyeRadius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  for (const dir of [-1, 1] as const) {
    drawEyebrow(ctx, ex + dir * eyeRadius * 0.75, eyeY, eyeRadius * 0.75, dir, expression);
  }

  const mouthY = headTopY + headSize * 0.72;
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

/** Just arms — no legs, for a simpler, calmer, more predictable silhouette. */
function drawArms(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, width: number, color: string, sway: number) {
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

const BLOCK_COUNT_CAP = 100;

/** Fills+outlines a rounded rect with a resolved ColorPlan, cycling rainbow per-cell if needed. */
function paintIdentityBody(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number,
  plan: ColorPlan,
  rows: number,
  cols: number,
  isNegative: boolean,
) {
  roundRect(ctx, left, top, width, height, radius);
  if (plan.kind === "solid") {
    ctx.fillStyle = isNegative ? coldTint(plan.color) : plan.color;
    ctx.fill();
  } else if (plan.kind === "milestone") {
    ctx.fillStyle = isNegative ? coldTint(MILESTONE_BASE, 0.35) : MILESTONE_BASE;
    ctx.fill();
  } else {
    ctx.save();
    ctx.clip();
    const cellW = width / cols;
    const cellH = height / rows;
    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hue = RAINBOW_SEQUENCE[index % RAINBOW_SEQUENCE.length];
        ctx.fillStyle = isNegative ? coldTint(hue) : hue;
        ctx.fillRect(left + c * cellW - 0.5, top + r * cellH - 0.5, cellW + 1, cellH + 1);
        index++;
      }
    }
    ctx.restore();
  }
}

/** One soft top-left highlight and one thin discrete grid overlay across the whole body - never per-cell. */
function paintBodyFinish(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number,
  rows: number,
  cols: number,
  plan: ColorPlan,
  isNegative: boolean,
) {
  ctx.save();
  roundRect(ctx, left, top, width, height, radius);
  ctx.clip();

  const highlight = ctx.createLinearGradient(left, top, left + width * 0.7, top + height * 0.7);
  highlight.addColorStop(0, "rgba(255,255,255,0.32)");
  highlight.addColorStop(0.55, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight;
  ctx.fillRect(left, top, width, height);

  ctx.strokeStyle = plan.kind === "milestone" ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.18)";
  ctx.lineWidth = Math.max(1, Math.min(width / cols, height / rows) * 0.03);
  for (let r = 1; r < rows; r++) {
    const y = top + (height / rows) * r;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.stroke();
  }
  for (let c = 1; c < cols; c++) {
    const x = left + (width / cols) * c;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + height);
    ctx.stroke();
  }
  ctx.restore();

  roundRect(ctx, left, top, width, height, radius);
  ctx.strokeStyle = isNegative ? coldTint("#111827", 0.2) : "#111827";
  ctx.lineWidth = Math.max(2.5, Math.min(width, height) * 0.045);
  ctx.stroke();
}

/**
 * Literal body for 1-100: a single unified square/rectangle - one being, not
 * a collection of separate blocks - subdivided by thin discrete grid lines
 * into a rows x cols layout that reveals factors (12 -> 3x4, 16 -> 4x4,
 * 100 -> 10x10; primes wrap into a near-square grid). The whole shape shares
 * one identity color (see identityColorPlan) so growing/shrinking reads as
 * geometry changing, not colors swapping.
 */
function drawBlockBody(ctx: CanvasRenderingContext2D, cx: number, baseY: number, unit: number, count: number, isNegative: boolean, maxBodyHeight: number, maxBodyWidth: number) {
  const capped = Math.max(1, Math.min(BLOCK_COUNT_CAP, Math.round(Math.abs(count))));
  const { rows, cols } = factorGrid(capped);
  const cellSize = Math.min(unit, maxBodyHeight / rows, maxBodyWidth / cols);
  const width = cols * cellSize;
  const height = rows * cellSize;
  const left = cx - width / 2;
  const top = baseY - height;
  const radius = Math.min(width, height) * 0.14;
  const plan = identityColorPlan(capped);

  paintIdentityBody(ctx, left, top, width, height, radius, plan, rows, cols, isNegative);
  paintBodyFinish(ctx, left, top, width, height, radius, rows, cols, plan, isNegative);

  return { headTopY: top, headSize: Math.min(width, height), top, bottom: baseY, gridWidth: width };
}

/**
 * Grouped body for 101-19999: a stepped tower of thousands/hundreds/tens/ones
 * tiers (tier *size* shows place value), all painted in the number's single
 * identity color so the whole tower still reads as one being.
 */
function drawGroupedBody(ctx: CanvasRenderingContext2D, cx: number, baseY: number, unit: number, value: number, isNegative: boolean, maxBodyHeight: number, maxBodyWidth: number) {
  const abs = Math.min(19_999, Math.round(Math.abs(value)));
  const thousands = Math.min(19, Math.floor(abs / 1000));
  const hundreds = Math.floor((abs % 1000) / 100);
  const tens = Math.floor((abs % 100) / 10);
  const ones = abs % 10;
  const plan = identityColorPlan(abs);

  const thousandsRows = thousands > 0 ? Math.ceil(thousands / 10) : 0;
  const idealHeight =
    thousandsRows * unit * 1.3 + (hundreds > 0 ? unit * 1.1 : 0) + (tens > 0 ? unit * 0.85 : 0) + unit * 0.55;
  const widestRowBlocks = Math.min(10, Math.max(thousands, Math.min(hundreds, 5), tens, ones, 1));
  const idealWidth = widestRowBlocks * unit * 1.7 * 1.15;
  const shrinkH = Math.min(1, maxBodyHeight / Math.max(idealHeight, 1));
  const shrinkW = Math.min(1, maxBodyWidth / Math.max(idealWidth, 1));
  const shrink = Math.min(shrinkH, shrinkW);
  const u = unit * shrink;
  const tierGap = u * 0.12;

  let y = baseY;
  let widestTierWidth = 0;
  const drawTier = (count: number, cellW: number, cellH: number, perRow: number) => {
    if (count <= 0) return;
    const rows = Math.ceil(count / perRow);
    const cols = Math.min(perRow, count);
    const width = cols * cellW;
    const height = rows * cellH;
    const left = cx - width / 2;
    const top = y - height;
    const radius = Math.min(cellW, cellH) * 0.16;
    paintIdentityBody(ctx, left, top, width, height, radius, plan, rows, cols, isNegative);
    paintBodyFinish(ctx, left, top, width, height, radius, rows, cols, plan, isNegative);
    widestTierWidth = Math.max(widestTierWidth, width);
    y = top - tierGap;
  };

  drawTier(thousands, u * 1.7, u * 1.3, 10);
  drawTier(hundreds, u * 1.6, u * 1.1, 5);
  drawTier(tens, u * 0.9, u * 0.85, 10);
  drawTier(Math.max(1, ones), u * 0.5, u * 0.5, 10);

  const headGap = u * 0.55;
  return { headTopY: y - headGap, headSize: u * 0.9, top: y, bottom: baseY, gridWidth: widestTierWidth };
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
  const symbolicArmColor = params.isNegative ? coldTint("#818cf8", 0.3) : "#818cf8";

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

  drawArms(ctx, cx, body.top, body.bottom, unit * 2.2, params.level >= 3 ? symbolicArmColor : "#475569", sway);
  drawFace(ctx, cx, body.headTopY, body.headSize, params.expression, wobble);

  ctx.restore();
}
