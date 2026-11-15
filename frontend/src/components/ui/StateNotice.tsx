import type { HTMLAttributes } from "react";
import { statePresentation, type ProductState } from "@/types/states";
import { StatusIcon } from "./StatusIcon";

interface StateNoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  readonly state: ProductState;
  readonly title?: string;
  readonly description?: string;
}

/** A short, calm message about the state of something on the screen, with what to do next. */
export function StateNotice({ state, title, description, className = "", ...props }: StateNoticeProps) {
  const presentation = statePresentation[state];
  return (
    <div className={`state-notice state-notice--${presentation.tone} ${className}`.trim()} role="status" {...props}>
      <span className="state-notice__icon" aria-hidden="true"><StatusIcon state={state} size={16} /></span>
      <div className="state-notice__body">
        <p className="state-notice__title">{title ?? presentation.label}</p>
        <p className="state-notice__description">{description ?? presentation.guidance}</p>
      </div>
    </div>
  );
}
