import type { ReactNode } from "react";
import type { ProductState } from "@/types/states";

export type StatusIconName =
  | "check-circle"
  | "half-circle"
  | "x-circle"
  | "alert-triangle"
  | "question-dashed"
  | "person-circle"
  | "slash-circle"
  | "dash-circle"
  | "dotted-circle"
  | "refresh";

const iconByState: Record<ProductState, StatusIconName> = {
  success: "check-circle",
  confirmed: "check-circle",
  pending: "half-circle",
  processing: "half-circle",
  loading: "half-circle",
  "known-failure": "x-circle",
  "message-delivery-failed": "alert-triangle",
  "outcome-unknown": "question-dashed",
  "waiting-human": "person-circle",
  restricted: "slash-circle",
  "permission-denied": "slash-circle",
  "not-available": "dash-circle",
  "not-configured": "dash-circle",
  "model-not-ready": "dash-circle",
  "dependency-unavailable": "dash-circle",
  "valid-empty": "dash-circle",
  "foundation-only": "dotted-circle",
  "target-only": "dotted-circle",
  "stale-conflict": "refresh",
};

/** The icon shape for a state. Shapes differ wherever meanings differ ("Needs checking" is not "Failed"). */
export function statusIconFor(state: ProductState): StatusIconName {
  return iconByState[state];
}

const ring = <circle cx="8" cy="8" r="6.2" />;

const glyphs: Record<StatusIconName, ReactNode> = {
  "check-circle": <>{ring}<path d="m5.4 8.2 1.8 1.8 3.4-3.7" /></>,
  "half-circle": <>{ring}<path d="M8 3.6a4.4 4.4 0 0 1 0 8.8Z" fill="currentColor" stroke="none" /></>,
  "x-circle": <>{ring}<path d="m5.8 5.8 4.4 4.4m0-4.4-4.4 4.4" /></>,
  "alert-triangle": <><path d="M8 2.4 1.7 13.4h12.6Z" /><path d="M8 6.4v3.2M8 11.6h.01" /></>,
  "question-dashed": <><circle cx="8" cy="8" r="6.2" strokeDasharray="2.4 2" /><path d="M6.3 6.4a1.8 1.8 0 1 1 2.5 1.7c-.5.2-.8.6-.8 1.1v.3M8 11.4h.01" /></>,
  "person-circle": <>{ring}<circle cx="8" cy="6.6" r="1.8" /><path d="M4.9 12.2a3.6 3.6 0 0 1 6.2 0" /></>,
  "slash-circle": <>{ring}<path d="m3.7 12.3 8.6-8.6" /></>,
  "dash-circle": <>{ring}<path d="M5.4 8h5.2" /></>,
  "dotted-circle": <circle cx="8" cy="8" r="6.2" strokeDasharray="0.1 2.6" />,
  refresh: <><path d="M13.2 8a5.2 5.2 0 1 1-1.6-3.8" /><path d="M13.2 2.6v2.8h-2.8" /></>,
};

/** A small line icon for a state, drawn in the current text colour. Always paired with words or an accessible name. */
export function StatusIcon({ state, size = 14 }: { readonly state: ProductState; readonly size?: number }) {
  const name = statusIconFor(state);
  return (
    <svg
      className="status-icon"
      data-icon={name}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyphs[name]}
    </svg>
  );
}
