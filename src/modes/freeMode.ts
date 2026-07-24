export interface QuickOp {
  id: string;
  label: string;
  ariaLabel: string;
}

export const QUICK_INCREMENTS: QuickOp[] = [
  { id: "inc1", label: "+1", ariaLabel: "Somar 1" },
  { id: "dec1", label: "-1", ariaLabel: "Subtrair 1" },
  { id: "inc10", label: "+10", ariaLabel: "Somar 10" },
  { id: "dec10", label: "-10", ariaLabel: "Subtrair 10" },
];

export const QUICK_MULTIPLIERS: QuickOp[] = [
  { id: "mul2", label: "×2", ariaLabel: "Multiplicar por 2" },
  { id: "mul3", label: "×3", ariaLabel: "Multiplicar por 3" },
  { id: "mul10", label: "×10", ariaLabel: "Multiplicar por 10" },
  { id: "div2", label: "÷2", ariaLabel: "Dividir por 2" },
  { id: "div3", label: "÷3", ariaLabel: "Dividir por 3" },
  { id: "div10", label: "÷10", ariaLabel: "Dividir por 10" },
];
