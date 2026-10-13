import { statePresentation, type ProductState } from "@/types/states";
import { StatusBadge } from "./StatusBadge";

interface StateNoticeProps {
  readonly state: ProductState;
  readonly title?: string;
  readonly description?: string;
}

export function StateNotice({ state, title, description }: StateNoticeProps) {
  const presentation = statePresentation[state];
  return (
    <div className={`state-notice state-notice--${presentation.tone}`} role="status">
      <StatusBadge state={state} />
      <div>
        <p className="state-notice__title">{title ?? presentation.label}</p>
        <p className="state-notice__description">{description ?? presentation.guidance}</p>
      </div>
    </div>
  );
}
