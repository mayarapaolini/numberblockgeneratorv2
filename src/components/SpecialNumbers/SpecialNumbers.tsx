import { useEffect, useRef } from "react";
import { MILESTONES } from "../../engine/milestones";
import type { HugeNumber } from "../../engine/HugeNumber";
import styles from "./SpecialNumbers.module.css";

interface SpecialNumbersProps {
  onSelect: (value: HugeNumber, label: string) => void;
  onClose: () => void;
}

export function SpecialNumbers({ onSelect, onClose }: SpecialNumbersProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Números especiais"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Números especiais</h2>
          <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar números especiais">
            ✖️
          </button>
        </div>
        <div className={styles.grid}>
          {MILESTONES.map((milestone) => (
            <button
              key={milestone.id}
              type="button"
              className={styles.card}
              onClick={() => onSelect(milestone.value(), milestone.label)}
              aria-label={`Ir para ${milestone.label}: ${milestone.description}`}
            >
              <span className={styles.cardLabel}>{milestone.label}</span>
              <span className={styles.cardDescription}>{milestone.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
