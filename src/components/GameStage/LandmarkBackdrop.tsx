import { useMemo } from "react";
import { type HugeNumber } from "../../engine/HugeNumber";
import { toSmallNumber } from "../../engine/visualLevel";
import { findClosestWorldReference } from "../../engine/worldReferences";
import { findClosestDepthReference, DEPTH_REFERENCES } from "../../engine/depthReferences";
import styles from "./LandmarkBackdrop.module.css";

interface LandmarkBackdropProps {
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
]);

function OceanDepthGauge({ index, emoji }: { index: number; emoji: string }) {
  const ratio = index / Math.max(1, DEPTH_REFERENCES.length - 1);
  const markerY = 12 + ratio * 130;

  return (
    <svg className={styles.svg} viewBox="0 0 100 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="142" rx="6" fill="url(#oceanGradient)" opacity="0.55" />
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
      <circle cx="50" cy={markerY} r="7" fill="#0f172a" opacity="0.55" />
      <text x="50" y={markerY + 4} textAnchor="middle" fontSize="9">
        {emoji}
      </text>
    </svg>
  );
}

export function LandmarkBackdrop({ value }: LandmarkBackdropProps) {
  const isDepth = value.sign === -1;

  const worldReference = useMemo(
    () => (!isDepth && value.sign === 1 ? findClosestWorldReference(value) : null),
    [value, isDepth],
  );
  const depthReference = useMemo(
    () => (isDepth ? findClosestDepthReference(Math.abs(toSmallNumber(value))) : null),
    [value, isDepth],
  );

  if (value.sign === 0) return null;

  if (isDepth && depthReference) {
    const index = DEPTH_REFERENCES.findIndex((ref) => ref.id === depthReference.id);
    return (
      <div className={styles.wrapper}>
        <OceanDepthGauge index={index} emoji={depthReference.emoji} />
        <span className={styles.label}>
          {depthReference.emoji} {depthReference.name}
        </span>
      </div>
    );
  }

  if (worldReference) {
    const hasCustomArt = CUSTOM_SILHOUETTE_IDS.has(worldReference.id);
    return (
      <div className={styles.wrapper}>
        {hasCustomArt ? (
          <svg className={styles.svg} viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <Silhouette id={worldReference.id} color="#1f2937" />
          </svg>
        ) : (
          <svg className={styles.svg} viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <text x="50" y="110" textAnchor="middle" fontSize="70">
              {worldReference.emoji}
            </text>
          </svg>
        )}
        <span className={styles.label}>
          {worldReference.emoji} {worldReference.name}
        </span>
      </div>
    );
  }

  return null;
}
