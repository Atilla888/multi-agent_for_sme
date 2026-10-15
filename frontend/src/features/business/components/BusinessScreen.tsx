import type { ReactNode } from "react";
import Link from "next/link";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
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
  /** Row count per option value, shown inside each filter chip. */
  readonly counts?: Readonly<Record<string, number>>;
  /** Extra controls on the right of the toolbar, such as Export CSV. */
  readonly actions?: ReactNode;
}

function filterHref(action: string, query: string, status: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (status !== "all") params.set("status", status);
  const search = params.toString();
  return search ? `${action}?${search}` : action;
}

/** Figma list toolbar: search field, filter chips with counts, and optional actions. */
export function EntityToolbar({ action, query, searchLabel, searchPlaceholder, status, statusLabel, options, counts, actions }: EntityToolbarProps) {
  const id = action.replaceAll("/", "") || "business";
  return <div className="entity-toolbar">
    <form className="toolbar-search" action={action} method="get" role="search">
      <label className="sr-only" htmlFor={`${id}-search`}>{searchLabel}</label>
      <Icon name="search" size={18} />
      <input id={`${id}-search`} type="search" name="q" defaultValue={query} placeholder={searchPlaceholder} aria-describedby={`${id}-search-note`} />
      {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
      <span className="sr-only" id={`${id}-search-note`}>Filters deterministic fixture rows only; no server search is claimed. Press Enter to search.</span>
    </form>
    <nav className="filter-chips" aria-label={statusLabel}>
      {options.map((option) => {
        const active = option.value === status;
        return <Link className={`filter-chip ${active ? "filter-chip--active" : ""}`.trim()} key={option.value} href={filterHref(action, query, option.value)} aria-current={active ? "true" : undefined}>
          {option.label}{counts?.[option.value] !== undefined ? <span className="filter-chip__count">{counts[option.value]}</span> : null}
        </Link>;
      })}
    </nav>
    {actions ? <div className="entity-toolbar__actions">{actions}</div> : null}
  </div>;
}

export interface BusinessFact { readonly label: string; readonly value: string; readonly note?: string; }

export function BusinessFactList({ facts }: { readonly facts: readonly BusinessFact[] }) {
  return <dl className="business-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><strong>{fact.value}</strong>{fact.note ? <span>{fact.note}</span> : null}</dd></div>)}</dl>;
}
