import { useEffect, useRef } from "react";
import type { HugeNumber } from "../../engine/HugeNumber";
import { compare, orderOfMagnitude } from "../../engine/HugeNumber";
import { getVisualLevel, toSmallNumber, isPowerOfTen, isExactlyHundred } from "../../engine/visualLevel";
import { drawCharacter, type Expression } from "./draw";
import styles from "./NumberCharacter.module.css";

interface NumberCharacterProps {
  value: HugeNumber;
  reduceMotion: boolean;
}

function pickExpression(value: HugeNumber, level: number): Expression {
  if (value.sign === -1) return "cold";
  if (level === 4) return "awe";
  if (isPowerOfTen(value) || isExactlyHundred(value)) return "excited";
  return "happy";
}

export function NumberCharacter({ value, reduceMotion }: NumberCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevValueRef = useRef<HugeNumber | null>(null);
  const bounceStartRef = useRef(0);
  const bounceDirectionRef = useRef<1 | -1>(1);
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev) {
      const cmp = compare(value, prev);
      if (cmp !== 0) {
        bounceDirectionRef.current = cmp > 0 ? 1 : -1;
        bounceStartRef.current = performance.now();
      }
    }
    prevValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const level = getVisualLevel(value);
    const smallCount = level <= 2 ? toSmallNumber(value) : 0;
    const magnitude = orderOfMagnitude(value);
    const magnitudeRatio = Math.min(1, Math.max(0, (Number(magnitude) - 4) / 17));
    const hueSeedNumber =
      value.kind === "scientific" ? Number(value.exponent % 997n) / 997 : (Number(magnitude) % 20) / 20;
    const expression = pickExpression(value, level);

    const render = (now: number) => {
      const idleTime = reduceMotion ? 0 : (now - startTimeRef.current) / 1000;
      const bounceElapsed = now - bounceStartRef.current;
      const bouncePhase = reduceMotion ? 0 : Math.min(1, bounceElapsed / 420);

      drawCharacter(canvas, {
        level,
        smallCount,
        isNegative: value.sign === -1,
        expression,
        bouncePhase,
        bounceDirection: bounceDirectionRef.current,
        idleTime,
        reduceMotion,
        magnitudeRatio,
        hueSeed: hueSeedNumber,
      });

      if (!reduceMotion || bouncePhase < 1) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    rafRef.current = requestAnimationFrame(render);

    const resizeObserver = new ResizeObserver(() => {
      if (rafRef.current === undefined) {
        rafRef.current = requestAnimationFrame(render);
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
      resizeObserver.disconnect();
    };
  }, [value, reduceMotion]);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="Personagem numérico animado" />
    </div>
  );
}
