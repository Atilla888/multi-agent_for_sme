import { PageHeader } from "@/components/layout/PageHeader";
import type { EscalationsScreenModel } from "../types";
import { DecisionContext } from "./DecisionContext";
import { EscalationQueue } from "./EscalationQueue";

/** Needs review: cases where automatic handling stopped and a person has to decide. */
export function EscalationsScreen({ model }: { readonly model: EscalationsScreenModel }) {
  return <div className="feature-page">
    <PageHeader title="Needs review" source="sample" />
    <div className="escalations-layout"><EscalationQueue items={model.queue} selectedId={model.selected.id} /><DecisionContext detail={model.selected} /></div>
  </div>;
}
