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
  /** Short label shown in badges. Plain words, no internal codes. */
  readonly label: string;
  readonly marker: string;
  readonly tone: StateTone;
  /** One or two plain sentences that tell a non-technical reader what to do. */
  readonly guidance: string;
}

/**
 * How each backend state is shown to staff. The meaning of every state is fixed by the product
 * rules (an unknown outcome is never shown as failed or done, a known failure never asks for
 * reconciliation); only the wording is written for people who do not read code.
 */
export const statePresentation: Record<ProductState, StatePresentation> = {
  "foundation-only": { label: "Coming soon", marker: "i", tone: "information", guidance: "This screen is planned but not built yet." },
  loading: { label: "Loading", marker: "…", tone: "pending", guidance: "Please wait a moment." },
  "valid-empty": { label: "Nothing here yet", marker: "○", tone: "neutral", guidance: "The search finished and found no records." },
  success: { label: "Done", marker: "✓", tone: "success", guidance: "The request completed. Check the record itself for the business result." },
  confirmed: { label: "Confirmed", marker: "✓", tone: "success", guidance: "This result has been verified." },
  pending: { label: "Pending", marker: "◷", tone: "pending", guidance: "Waiting for a result or a decision." },
  processing: { label: "In progress", marker: "…", tone: "pending", guidance: "Work is still running. It has not finished yet." },
  "known-failure": { label: "Failed", marker: "×", tone: "danger", guidance: "This step did not go through. Check the latest details before choosing what to do next." },
  "permission-denied": { label: "No access", marker: "⊘", tone: "restricted", guidance: "Your account does not have permission to see this." },
  "not-available": { label: "Unavailable", marker: "—", tone: "neutral", guidance: "This is not available right now." },
  "not-configured": { label: "Not set up", marker: "—", tone: "neutral", guidance: "This needs to be set up before it can be used." },
  "outcome-unknown": { label: "Needs checking", marker: "?", tone: "unknown", guidance: "This may already have gone through. Check the records first, and do not try it again until you know." },
  "model-not-ready": { label: "Not ready yet", marker: "∅", tone: "neutral", guidance: "The forecast model is not ready, so there is no result to show." },
  restricted: { label: "Not allowed", marker: "⌁", tone: "restricted", guidance: "This action is blocked by policy and cannot be done from here." },
  "waiting-human": { label: "Needs a person", marker: "◇", tone: "waiting", guidance: "Automatic handling stopped. Someone on your team needs to decide." },
  "stale-conflict": { label: "May be out of date", marker: "↻", tone: "warning", guidance: "Refresh and check again before acting on this." },
  "dependency-unavailable": { label: "Service unavailable", marker: "—", tone: "neutral", guidance: "We could not reach the source. This does not mean the result is empty or zero." },
  "message-delivery-failed": { label: "Message not delivered", marker: "!", tone: "danger", guidance: "The message to the customer failed. The order itself is not affected. Resend the message only." },
  "target-only": { label: "Planned", marker: "T", tone: "information", guidance: "This feature is planned and not available yet." },
};
