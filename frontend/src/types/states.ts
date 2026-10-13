export type ProductState =
  | "foundation-only"
  | "loading"
  | "valid-empty"
  | "success"
  | "confirmed"
  | "pending"
  | "processing"
  | "known-failure"
  | "permission-denied"
  | "not-available"
  | "not-configured"
  | "outcome-unknown"
  | "model-not-ready"
  | "restricted"
  | "waiting-human"
  | "stale-conflict"
  | "dependency-unavailable"
  | "message-delivery-failed"
  | "target-only";

export type StateTone =
  | "neutral"
  | "success"
  | "pending"
  | "warning"
  | "danger"
  | "unknown"
  | "restricted"
  | "waiting"
  | "information";

export interface StatePresentation {
  readonly label: string;
  readonly marker: string;
  readonly tone: StateTone;
  readonly guidance: string;
}

export const statePresentation: Record<ProductState, StatePresentation> = {
  "foundation-only": { label: "Foundation only", marker: "i", tone: "information", guidance: "Routing and layout exist; product behavior is not implemented in P5A." },
  loading: { label: "Loading", marker: "…", tone: "pending", guidance: "Wait for a named result." },
  "valid-empty": { label: "Valid empty", marker: "○", tone: "neutral", guidance: "The authorized query completed with no records." },
  success: { label: "Success", marker: "✓", tone: "success", guidance: "The named request completed; this is not automatically a business effect." },
  confirmed: { label: "Confirmed", marker: "✓", tone: "success", guidance: "Trusted evidence confirms the named business effect." },
  pending: { label: "Pending", marker: "◷", tone: "pending", guidance: "A specific result or owner is still pending." },
  processing: { label: "Processing", marker: "…", tone: "pending", guidance: "Work is active; completion is not yet confirmed." },
  "known-failure": { label: "Known failure", marker: "×", tone: "danger", guidance: "Review current facts and choose a new authorized recovery." },
  "permission-denied": { label: "Permission denied", marker: "⊘", tone: "restricted", guidance: "Protected values remain hidden; backend authorization is decisive." },
  "not-available": { label: "Unavailable", marker: "—", tone: "neutral", guidance: "This capability is not currently available." },
  "not-configured": { label: "Not configured", marker: "—", tone: "neutral", guidance: "A required integration has not been configured." },
  "outcome-unknown": { label: "OUTCOME_UNKNOWN", marker: "?", tone: "unknown", guidance: "The effect may have committed. Reconcile authoritative state before any mutation retry." },
  "model-not-ready": { label: "MODEL_NOT_READY", marker: "∅", tone: "neutral", guidance: "No validated forecast artifact or prediction exists; no result was produced." },
  restricted: { label: "Restricted", marker: "⌁", tone: "restricted", guidance: "Policy blocks the action; no enabled success path is available." },
  "waiting-human": { label: "Waiting human", marker: "◇", tone: "waiting", guidance: "Automation stopped; a human decision or assignment is pending." },
  "stale-conflict": { label: "Stale / conflict", marker: "↻", tone: "warning", guidance: "Refresh and re-evaluate before a consequential action." },
  "dependency-unavailable": { label: "Dependency unavailable", marker: "—", tone: "neutral", guidance: "Do not substitute zero, no match, or valid empty." },
  "message-delivery-failed": { label: "Message delivery failed", marker: "!", tone: "danger", guidance: "Retry communication only; confirmed business effects remain confirmed." },
  "target-only": { label: "TARGET only", marker: "T", tone: "information", guidance: "This approved target experience is not a current backend capability." },
};
