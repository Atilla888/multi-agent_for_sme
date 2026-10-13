import { statePresentation, type ProductState } from "@/types/states";

interface StatusBadgeProps {
  readonly state: ProductState;
  readonly className?: string;
}

export function StatusBadge({ state, className = "" }: StatusBadgeProps) {
  const presentation = statePresentation[state];
  return (
    <span className={`status-badge status-badge--${presentation.tone} ${className}`.trim()}>
      <span className="status-badge__marker" aria-hidden="true">{presentation.marker}</span>
      <span>{presentation.label}</span>
    </span>
  );
}
