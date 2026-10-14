import type { ReactNode } from "react";
import { Button, EmptyState, LoadingState, SearchInput, Select, StateNotice } from "@/components/ui";
import type { BusinessValidationState } from "../types";

export function BusinessFixtureBanner({ family }: { readonly family: string }) {
  return <div className="fixture-banner" role="note"><strong>LOCAL UI FIXTURE ONLY</strong><span>{family} uses deterministic development/demo records · not a live business data source.</span></div>;
}

interface BusinessBoundaryProps {
  readonly state: BusinessValidationState;
  readonly children: ReactNode;
  readonly family: string;
  readonly emptyDescription: string;
}

export function BusinessBoundary({ state, children, family, emptyDescription }: BusinessBoundaryProps) {
  if (state === "loading") return <section className="business-loading" aria-label={`Loading ${family}`}><LoadingState label={`Loading ${family} list`} lines={6} /><LoadingState label={`Loading ${family} context`} lines={4} /></section>;
  if (state === "empty") return <EmptyState title={`No ${family.toLowerCase()} in this fixture view`} description={emptyDescription} />;
  if (state === "restricted") return <StateNotice state="permission-denied" title={`${family} access is restricted`} description="Protected values are withheld. A visible route or fixture reference does not grant backend access." />;
  if (state === "unavailable") return <StateNotice state="dependency-unavailable" title={`${family} source is unavailable`} description="No live result is available. Do not reinterpret this as an empty result, missing record, or zero quantity." />;
  return children;
}

interface EntityToolbarProps {
  readonly action: string;
  readonly query: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly status: string;
  readonly statusLabel: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

export function EntityToolbar({ action, query, searchLabel, searchPlaceholder, status, statusLabel, options }: EntityToolbarProps) {
  return <form className="entity-toolbar" action={action} method="get">
    <SearchInput id={`${action.replaceAll("/", "") || "business"}-search`} label={searchLabel} name="q" defaultValue={query} placeholder={searchPlaceholder} description="Filters deterministic fixture rows only; no server search is claimed." />
    <Select id={`${action.replaceAll("/", "") || "business"}-status`} label={statusLabel} name="status" defaultValue={status}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </Select>
    <Button type="submit">Apply filters</Button>
  </form>;
}

export interface BusinessFact { readonly label: string; readonly value: string; readonly note?: string; }

export function BusinessFactList({ facts }: { readonly facts: readonly BusinessFact[] }) {
  return <dl className="business-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><strong>{fact.value}</strong>{fact.note ? <span>{fact.note}</span> : null}</dd></div>)}</dl>;
}
