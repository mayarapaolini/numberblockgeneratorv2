import { useMemo } from "react";
import type { HugeNumber } from "../../engine/HugeNumber";
import { formatHugeNumber } from "../../engine/HugeNumberFormatter";
import { nameHugeNumber } from "../../engine/numberNames";
import styles from "./NumberDisplay.module.css";

interface NumberDisplayProps {
  value: HugeNumber;
}

export function NumberDisplay({ value }: NumberDisplayProps) {
  const formatted = useMemo(() => formatHugeNumber(value), [value]);
  const name = useMemo(() => nameHugeNumber(value), [value]);

  return (
    <div className={styles.display}>
      <span className={styles.primary} data-testid="number-primary">
        {formatted.primary}
      </span>
      <span className={styles.name} data-testid="number-name">
        {name}
      </span>
      {formatted.isScientificDisplay ? null : (
        <span className={styles.scientific} data-testid="number-scientific">
          {formatted.scientific}
        </span>
      )}
    </div>
  );
}
