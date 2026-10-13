import type { EscalationsScreenModel } from "../types";
import { DecisionContext } from "./DecisionContext";
import { EscalationQueue } from "./EscalationQueue";

export function EscalationsScreen({ model }: { readonly model: EscalationsScreenModel }) {
  return <div className="feature-page"><div className="fixture-banner" role="note"><strong>{model.mode}</strong><span>Read-only deterministic scenario data · no assignment, decision, reconciliation, or Resume endpoint is called.</span></div><div className="escalations-layout"><EscalationQueue items={model.queue} selectedId={model.selected.id} /><DecisionContext detail={model.selected} /></div></div>;
}
