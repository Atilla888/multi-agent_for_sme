import type { ReactNode } from "react";
import Link from "next/link";
import { EmptyState, LoadingState, StateNotice } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { BusinessValidationState } from "../types";

interface BusinessBoundaryProps {
  readonly state: BusinessValidationState;
  readonly children: ReactNode;
  /** Plural, lower case, e.g. "orders". Used in the loading, empty and error copy. */
  readonly family: string;
  readonly emptyDescription: string;
}

/** Shows loading, empty, no-access or unavailable states for a list, or the list itself. */
export function BusinessBoundary({ state, children, family, emptyDescription }: BusinessBoundaryProps) {
  const name = family.toLowerCase();
  if (state === "loading") return <section className="business-loading" aria-label={`Loading ${name}`}><LoadingState label={`Loading ${name}`} lines={6} /><LoadingState label="Loading details" lines={4} /></section>;
  if (state === "empty") return <EmptyState title={`No ${name} found`} description={emptyDescription} />;
  if (state === "restricted") return <StateNotice state="permission-denied" title={`You don't have access to ${name}`} description="Ask an owner or administrator if you need this." />;
  if (state === "unavailable") return <StateNotice state="dependency-unavailable" title={`${family} can't be loaded right now`} description="We could not reach the source. Nothing is shown in its place, so an empty screen here does not mean there are no records." />;
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
  /** Extra controls on the right of the toolbar, such as Export. */
  readonly actions?: ReactNode;
}

function filterHref(action: string, query: string, status: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (status !== "all") params.set("status", status);
  const search = params.toString();
  return search ? `${action}?${search}` : action;
}

/** List toolbar: search field, filter chips with counts, and optional actions. */
export function EntityToolbar({ action, query, searchLabel, searchPlaceholder, status, statusLabel, options, counts, actions }: EntityToolbarProps) {
  const id = action.replaceAll("/", "") || "business";
  return <div className="entity-toolbar">
    <form className="toolbar-search" action={action} method="get" role="search">
      <label className="sr-only" htmlFor={`${id}-search`}>{searchLabel}</label>
      <Icon name="search" size={16} />
      <input id={`${id}-search`} type="search" name="q" defaultValue={query} placeholder={searchPlaceholder} aria-describedby={`${id}-search-note`} />
      {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
      <span className="sr-only" id={`${id}-search-note`}>Press Enter to search.</span>
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

/** Label / value pairs for a record, with an optional short note under the value. */
export function BusinessFactList({ facts }: { readonly facts: readonly BusinessFact[] }) {
  return <dl className="business-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><strong>{fact.value}</strong>{fact.note ? <span>{fact.note}</span> : null}</dd></div>)}</dl>;
}
