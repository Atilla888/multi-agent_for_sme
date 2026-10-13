import { statePresentation, type ProductState } from "@/types/states";

interface StatusBadgeProps {
  readonly state: ProductState;
}

export function StatusBadge({ state }: StatusBadgeProps) {
  const presentation = statePresentation[state];
  return (
    <span className={`status-badge status-badge--${presentation.tone}`}>
      {presentation.label}
    </span>
  );
}
