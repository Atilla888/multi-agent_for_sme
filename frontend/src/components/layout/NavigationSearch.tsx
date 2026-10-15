"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { flatNavigation, type NavItem } from "@/lib/navigation";

/** Finds the staff screen whose label best matches the query; exact, then prefix, then substring. */
export function matchNavigation(query: string, items: readonly NavItem[] = flatNavigation()): NavItem | undefined {
  const needle = query.trim().toLowerCase();
  if (!needle) return undefined;
  return (
    items.find((item) => item.label.toLowerCase() === needle) ??
    items.find((item) => item.label.toLowerCase().startsWith(needle)) ??
    items.find((item) => item.label.toLowerCase().includes(needle))
  );
}

/** Header search (Figma Input / Search). It searches screens only; record search lives on each screen. */
export function NavigationSearch() {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const match = matchNavigation(query);
    setNotFound(!match);
    if (match) {
      router.push(match.href);
      setQuery("");
    }
  }

  return (
    <form className="header-search" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor={`${id}-input`}>Go to a screen</label>
      <Icon name="search" size={18} />
      <input
        id={`${id}-input`}
        type="search"
        list={`${id}-screens`}
        placeholder="Search screens…"
        value={query}
        aria-describedby={notFound ? `${id}-status` : undefined}
        onChange={(event) => { setQuery(event.target.value); setNotFound(false); }}
      />
      <datalist id={`${id}-screens`}>
        {flatNavigation().map((item) => <option key={item.href} value={item.label} />)}
      </datalist>
      {notFound ? <span className="sr-only" id={`${id}-status`} role="status">No screen matches “{query}”.</span> : null}
    </form>
  );
}
