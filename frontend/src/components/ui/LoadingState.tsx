import { useTranslations } from "next-intl";

export interface LoadingStateProps {
  readonly label?: string;
  readonly lines?: number;
}

export function LoadingState({ label: givenLabel, lines = 2 }: LoadingStateProps) {
  const t = useTranslations("common");
  const label = givenLabel ?? t("loading");
  const safeLineCount = Math.max(1, Math.min(lines, 6));
  return (
    <div className="loading-state" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: safeLineCount }, (_, index) => (
        <span className="loading-state__line" aria-hidden="true" key={index} />
      ))}
    </div>
  );
}
