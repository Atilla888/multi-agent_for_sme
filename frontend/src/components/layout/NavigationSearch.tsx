"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { flatNavigation, type NavItem } from "@/lib/navigation";

/** Finds the staff screen whose label best matches the query; exact, then prefix, then substring. */
export function matchNavigation(
  query: string,
  items: readonly NavItem[] = flatNavigation(),
  labelOf: (item: NavItem) => string = (item) => item.label,
): NavItem | undefined {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return undefined;
  const label = (item: NavItem) => labelOf(item).toLocaleLowerCase();
  return (
    items.find((item) => label(item) === needle) ??
    items.find((item) => label(item).startsWith(needle)) ??
    items.find((item) => label(item).includes(needle))
  );
}

/** Header search: type a screen name and press Enter to jump there. Record search lives on each screen. */
export function NavigationSearch() {
  const t = useTranslations("shell");
  const router = useRouter();
  const labelOf = (item: NavItem) => t(`nav.${item.key}`);
  const id = useId();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const match = matchNavigation(query, flatNavigation(), labelOf);
    setNotFound(!match);
    if (match) {
      router.push(match.href);
      setQuery("");
    }
  }

  return (
    <form className="header-search" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor={`${id}-input`}>{t("search.label")}</label>
      <Icon name="search" size={16} />
      <input
        id={`${id}-input`}
        type="search"
        list={`${id}-screens`}
        placeholder={t("search.placeholder")}
        value={query}
        aria-describedby={notFound ? `${id}-status` : undefined}
        onChange={(event) => { setQuery(event.target.value); setNotFound(false); }}
      />
      <datalist id={`${id}-screens`}>
        {flatNavigation().map((item) => <option key={item.href} value={labelOf(item)} />)}
      </datalist>
      {notFound ? <span className="sr-only" id={`${id}-status`} role="status">{t("search.noMatch", { query })}</span> : null}
    </form>
  );
}
