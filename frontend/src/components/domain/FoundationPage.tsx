import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StateNotice } from "@/components/ui/StateNotice";
import { foundationPages, type FoundationPageId } from "@/features/foundation/pages";

export function FoundationPage({ page }: { readonly page: FoundationPageId }) {
  const definition = foundationPages[page];

  return (
    <div className="page-stack">
      <PageHeader eyebrow={definition.eyebrow} title={definition.title} description={definition.description} />
      <Card aria-labelledby={`${page}-state`}>
        <div className="card__header">
          <div>
            <p className="card__label">Implementation state</p>
            <h2 id={`${page}-state`}>P5A route placeholder</h2>
          </div>
        </div>
        <StateNotice state={definition.state} />
        <dl className="boundary-list">
          <div>
            <dt>Current boundary</dt>
            <dd>{definition.boundary}</dd>
          </div>
          <div>
            <dt>Later implementation</dt>
            <dd>{definition.nextPhase}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
