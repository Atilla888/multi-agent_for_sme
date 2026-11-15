import { useTranslations } from "next-intl";
import { statePresentation, type ProductState } from "@/types/states";
import { StatusIcon } from "./StatusIcon";

interface StatusBadgeProps {
  readonly state: ProductState;
  readonly className?: string;
  /** Show only the icon; the label stays available to screen readers. */
  readonly iconOnly?: boolean;
}

/** A status mark: a small icon plus plain words, both in the tone colour. No pill fill. */
export function StatusBadge({ state, className = "", iconOnly = false }: StatusBadgeProps) {
  const t = useTranslations("states");
  const presentation = statePresentation[state];
  return (
    <span className={`status-badge status-badge--${presentation.tone} ${className}`.trim()}>
      <span className="status-badge__marker" aria-hidden="true"><StatusIcon state={state} /></span>
      <span className={iconOnly ? "visually-hidden" : undefined}>{t(`${state}.label`)}</span>
    </span>
  );
}
