import { useMemo } from "react";
import { type HugeNumber } from "../../engine/HugeNumber";
import { toSmallNumber } from "../../engine/visualLevel";
import { findClosestWorldReference } from "../../engine/worldReferences";
import { findClosestDepthReference, DEPTH_REFERENCES } from "../../engine/depthReferences";
import { findClosestTemperatureReference, TEMPERATURE_REFERENCES } from "../../engine/temperatureReferences";
import styles from "./LandmarkPanel.module.css";

interface LandmarkPanelProps {
  value: HugeNumber;
}

/** Original line-art silhouettes — no traced photos, no official character art. */
function Silhouette({ id, color }: { id: string; color: string }) {
  switch (id) {
    case "burjkhalifa":
      return (
        <g fill={color}>
          <polygon points="38,150 62,150 59,88 41,88" />
          <polygon points="41,88 59,88 56,48 44,48" />
          <polygon points="44,48 56,48 51,14 49,14" />
          <line x1="50" y1="14" x2="50" y2="2" stroke={color} strokeWidth="1.6" />
        </g>
      );
    case "torreeiffel":
      return (
        <g fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="150" x2="50" y2="28" />
          <line x1="82" y1="150" x2="50" y2="28" />
          <line x1="50" y1="28" x2="50" y2="4" />
          <line x1="27" y1="112" x2="73" y2="112" />
          <line x1="36" y1="68" x2="64" y2="68" />
          <line x1="18" y1="150" x2="64" y2="68" opacity="0.45" strokeWidth="1.4" />
          <line x1="82" y1="150" x2="36" y2="68" opacity="0.45" strokeWidth="1.4" />
        </g>
      );
    case "cristoredentor":
      return (
        <g fill={color}>
          <polygon points="18,150 82,150 58,122 42,122" />
          <rect x="46" y="72" width="8" height="50" rx="3" />
          <rect x="12" y="74" width="76" height="6" rx="3" />
          <circle cx="50" cy="62" r="9" />
        </g>
      );
    case "estatuadaliberdade":
      return (
        <g fill={color}>
          <rect x="33" y="140" width="34" height="10" />
          <polygon points="37,140 63,140 56,78 44,78" />
          <circle cx="50" cy="70" r="7.5" />
          <polygon points="43,63 50,54 57,63" />
          <line x1="60" y1="74" x2="74" y2="40" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="75" cy="36" r="4.5" />
        </g>
      );
    case "everest":
      return (
        <g>
          <polygon points="6,150 42,55 66,92 94,150" fill={color} />
          <polygon points="32,76 42,55 52,76" fill="#ffffff" opacity="0.9" />
        </g>
      );
    case "girafa":
      return (
        <g fill={color}>
          <ellipse cx="55" cy="128" rx="20" ry="13" />
          <rect x="48" y="45" width="9" height="70" rx="4" />
          <circle cx="53" cy="38" r="9" />
          <line x1="35" y1="141" x2="33" y2="118" stroke={color} strokeWidth="5" strokeLinecap="round" />
          <line x1="50" y1="141" x2="48" y2="118" stroke={color} strokeWidth="5" strokeLinecap="round" />
          <line x1="65" y1="141" x2="67" y2="118" stroke={color} strokeWidth="5" strokeLinecap="round" />
          <line x1="72" y1="141" x2="74" y2="118" stroke={color} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "crianca":
      return (
        <g fill={color}>
          <circle cx="50" cy="110" r="10" />
          <rect x="42" y="118" width="16" height="24" rx="6" />
          <line x1="46" y1="145" x2="44" y2="150" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <line x1="54" y1="145" x2="56" y2="150" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "formiga":
      return (
        <g fill={color}>
          <circle cx="35" cy="140" r="6" />
          <circle cx="50" cy="140" r="7" />
          <circle cx="66" cy="140" r="8" />
          {[30, 45, 60].map((x) => (
            <g key={x}>
              <line x1={x} y1="140" x2={x - 8} y2="132" stroke={color} strokeWidth="1.4" />
              <line x1={x} y1="140" x2={x - 8} y2="148" stroke={color} strokeWidth="1.4" />
            </g>
          ))}
        </g>
      );
    case "piramidedegize":
      return (
        <g>
          <polygon points="10,150 50,50 90,150" fill={color} />
          <polygon points="50,50 68,150 90,150" fill="#000" opacity="0.15" />
          <line x1="30" y1="110" x2="70" y2="110" stroke="#fff" strokeWidth="1.2" opacity="0.35" />
          <line x1="22" y1="130" x2="78" y2="130" stroke="#fff" strokeWidth="1.2" opacity="0.35" />
        </g>
      );
    case "torredepisa":
      return (
        <g fill={color} transform="rotate(-6 50 150)">
          <rect x="38" y="30" width="24" height="120" rx="3" />
          {[46, 66, 86, 106, 126].map((y) => (
            <line key={y} x1="38" y1={y} x2="62" y2={y} stroke="#fff" strokeWidth="1.4" opacity="0.4" />
          ))}
          <ellipse cx="50" cy="28" rx="14" ry="5" />
        </g>
      );
    case "bigben":
      return (
        <g fill={color}>
          <rect x="38" y="40" width="24" height="110" rx="2" />
          <polygon points="34,40 66,40 50,18" />
          <circle cx="50" cy="58" r="9" fill="#fff" opacity="0.9" />
          <circle cx="50" cy="58" r="9" fill="none" stroke={color} strokeWidth="2" />
          <line x1="50" y1="58" x2="50" y2="52" stroke={color} strokeWidth="1.6" />
          <line x1="50" y1="58" x2="54" y2="60" stroke={color} strokeWidth="1.6" />
        </g>
      );
    case "empirestate":
      return (
        <g fill={color}>
          <polygon points="30,150 70,150 66,100 34,100" />
          <polygon points="34,100 66,100 62,60 38,60" />
          <polygon points="38,60 62,60 56,30 44,30" />
          <line x1="50" y1="30" x2="50" y2="8" stroke={color} strokeWidth="2" />
        </g>
      );
    default:
      return null;
  }
}

const CUSTOM_SILHOUETTE_IDS = new Set([
  "burjkhalifa",
  "torreeiffel",
  "cristoredentor",
  "estatuadaliberdade",
  "everest",
  "girafa",
  "crianca",
  "formiga",
  "piramidedegize",
  "torredepisa",
  "bigben",
  "empirestate",
]);

function OceanDepthGauge({ index, emoji }: { index: number; emoji: string }) {
  const ratio = index / Math.max(1, DEPTH_REFERENCES.length - 1);
  const markerY = 12 + ratio * 130;

  return (
    <svg className={styles.svg} viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="142" rx="10" fill="url(#oceanGradient)" />
      <path
        d="M4,10 Q15,6 26,10 T48,10 T70,10 T96,10"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="1.6"
        opacity="0.7"
      />
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1="4" y1={10 + t * 130} x2="96" y2={10 + t * 130} stroke="#e0f2fe" strokeWidth="0.5" opacity="0.25" />
      ))}
      <circle cx="50" cy={markerY} r="9" fill="#0f172a" opacity="0.6" />
      <text x="50" y={markerY + 4.5} textAnchor="middle" fontSize="11">
        {emoji}
      </text>
    </svg>
  );
}

function ThermometerGauge({ index, emoji }: { index: number; emoji: string }) {
  const ratio = index / Math.max(1, TEMPERATURE_REFERENCES.length - 1);
  const markerY = 12 + ratio * 130;

  return (
    <svg className={styles.svg} viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="thermoGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>
      <rect x="42" y="6" width="16" height="118" rx="8" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      <circle cx="50" cy="134" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      <rect x="45" y={markerY} width="10" height={128 - markerY + 10} rx="5" fill="url(#thermoGradient)" />
      <circle cx="50" cy="134" r="12" fill="url(#thermoGradient)" />
      <text x="50" y={markerY - 6} textAnchor="middle" fontSize="11">
        {emoji}
      </text>
    </svg>
  );
}

/**
 * A small, opaque card beside the character showing what the current number
 * compares to in the real world — a visible picture, not a faint watermark
 * behind the character.
 */
export function LandmarkPanel({ value }: LandmarkPanelProps) {
  const isDepth = value.sign === -1;

  const worldReference = useMemo(
    () => (!isDepth && value.sign === 1 ? findClosestWorldReference(value) : null),
    [value, isDepth],
  );
  const depthReference = useMemo(
    () => (isDepth ? findClosestDepthReference(Math.abs(toSmallNumber(value))) : null),
    [value, isDepth],
  );
  const temperatureReference = useMemo(
    () => (isDepth ? findClosestTemperatureReference(Math.abs(toSmallNumber(value))) : null),
    [value, isDepth],
  );

  if (value.sign === 0) return null;

  if (isDepth && depthReference && temperatureReference) {
    const depthIndex = DEPTH_REFERENCES.findIndex((ref) => ref.id === depthReference.id);
    const temperatureIndex = TEMPERATURE_REFERENCES.findIndex((ref) => ref.id === temperatureReference.id);
    return (
      <div className={styles.stack}>
        <aside className={styles.panel} aria-label={`Comparação de profundidade: ${depthReference.name}`}>
          <div className={`${styles.artFrame} ${styles.artFrameCompact}`}>
            <OceanDepthGauge index={depthIndex} emoji={depthReference.emoji} />
          </div>
          <p className={styles.caption}>
            <span aria-hidden="true">{depthReference.emoji}</span> {depthReference.name}
          </p>
        </aside>
        <aside className={styles.panel} aria-label={`Comparação de temperatura: ${temperatureReference.name}`}>
          <div className={`${styles.artFrame} ${styles.artFrameCompact}`}>
            <ThermometerGauge index={temperatureIndex} emoji={temperatureReference.emoji} />
          </div>
          <p className={styles.caption}>
            <span aria-hidden="true">{temperatureReference.emoji}</span> {temperatureReference.name}
          </p>
        </aside>
      </div>
    );
  }

  if (worldReference) {
    const hasCustomArt = CUSTOM_SILHOUETTE_IDS.has(worldReference.id);
    return (
      <aside className={styles.panel} aria-label={`Comparação de tamanho: ${worldReference.name}`}>
        <div className={styles.artFrame}>
          {hasCustomArt ? (
            <svg className={styles.svg} viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <Silhouette id={worldReference.id} color="#334155" />
            </svg>
          ) : (
            <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <text x="50" y="66" textAnchor="middle" fontSize="52">
                {worldReference.emoji}
              </text>
            </svg>
          )}
        </div>
        <p className={styles.caption}>
          <span aria-hidden="true">{worldReference.emoji}</span> {worldReference.name}
        </p>
      </aside>
    );
  }

  return null;
}
