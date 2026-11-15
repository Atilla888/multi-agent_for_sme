import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import type { EscalationsScreenModel } from "../types";
import { DecisionContext } from "./DecisionContext";
import { EscalationQueue } from "./EscalationQueue";

/** Needs review: cases where automatic handling stopped and a person has to decide. */
export function EscalationsScreen({ model }: { readonly model: EscalationsScreenModel }) {
  const t = useTranslations("escalations");
  return <div className="feature-page">
    <PageHeader title={t("title")} source="sample" />
    <div className="escalations-layout"><EscalationQueue items={model.queue} selectedId={model.selected.id} /><DecisionContext detail={model.selected} /></div>
  </div>;
}
