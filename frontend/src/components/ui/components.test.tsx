import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Avatar, avatarHue } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";
import { Checkbox } from "./Checkbox";
import { ContextHelper } from "./ContextHelper";
import { EmptyState } from "./EmptyState";
import { IconButton } from "./IconButton";
import { Input, SearchInput } from "./Input";
import { LoadingState } from "./LoadingState";
import { Pagination, paginationWindow } from "./Pagination";
import { Select } from "./Select";
import { Separator } from "./Separator";
import { StateNotice } from "./StateNotice";
import { StatusBadge } from "./StatusBadge";
import { statusIconFor } from "./StatusIcon";
import { statePresentation, type ProductState } from "@/types/states";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./Table";
import { Tabs, nextEnabledTabIndex } from "./Tabs";
import { Textarea } from "./Textarea";

describe("action primitives", () => {
  it("renders a named native button with icon slots and a safe default type", () => {
    const markup = renderToStaticMarkup(<Button leadingIcon={<svg />} trailingIcon={<svg />}>Continue</Button>);
    expect(markup).toContain('<button class="button button--primary" type="button">');
    expect(markup).toContain("Continue");
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(2);
  });

  it("exposes loading and disabled semantics", () => {
    const markup = renderToStaticMarkup(<Button loading loadingLabel="Saving">Save</Button>);
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Saving");
  });

  it("requires and renders an accessible name for icon-only actions", () => {
    const markup = renderToStaticMarkup(<IconButton aria-label="Close panel" icon={<svg />} />);
    expect(markup).toContain('aria-label="Close panel"');
    expect(markup).toContain('aria-hidden="true"');
  });
});

describe("field primitives", () => {
  it("associates an input label, description, and error", () => {
    const markup = renderToStaticMarkup(<Input id="name" label="Name" description="Public name" error="Required" required />);
    expect(markup).toContain('for="name"');
    expect(markup).toContain('id="name"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="name-description name-error"');
    expect(markup).toContain('role="alert"');
  });

  it("forwards native disabled and read-only behavior", () => {
    expect(renderToStaticMarkup(<Input id="disabled" label="Disabled" disabled />)).toContain("disabled");
    expect(renderToStaticMarkup(<Input id="readonly" label="Read only" readOnly />)).toContain("readonly");
  });

  it("uses the shared field contract for textarea and native select", () => {
    const textarea = renderToStaticMarkup(<Textarea id="notes" label="Notes" error="Too long" />);
    const select = renderToStaticMarkup(<Select id="owner" label="Owner"><option>Operator</option></Select>);
    expect(textarea).toContain("<textarea");
    expect(textarea).toContain('aria-invalid="true"');
    expect(select).toContain("<select");
    expect(select).toContain('for="owner"');
  });

  it("keeps checkbox and search actions natively labelled", () => {
    const checkbox = renderToStaticMarkup(<Checkbox id="agree" label="I understand" description="Required acknowledgement" />);
    const search = renderToStaticMarkup(<SearchInput id="query" label="Search" onClear={vi.fn()} />);
    expect(checkbox).toContain('type="checkbox"');
    expect(checkbox).toContain('for="agree"');
    expect(search).toContain('type="search"');
    expect(search).toContain('aria-label="Clear search"');
  });
});

describe("semantic status and feedback", () => {
  it("draws status as an icon plus words, never colour alone", () => {
    const markup = renderToStaticMarkup(<StatusBadge state="waiting-human" />);
    expect(markup).toContain("status-badge__marker");
    expect(markup).toContain('data-icon="person-circle"');
    expect(markup).toContain("Needs a person");
  });

  it("gives Needs checking and Failed different icon shapes", () => {
    expect(statusIconFor("outcome-unknown")).toBe("question-dashed");
    expect(statusIconFor("known-failure")).toBe("x-circle");
  });

  it("maps every product state to an icon", () => {
    for (const state of Object.keys(statePresentation) as ProductState[]) expect(statusIconFor(state), state).toBeTruthy();
  });

  it("keeps the label for screen readers when only the icon shows", () => {
    const markup = renderToStaticMarkup(<StatusBadge state="known-failure" iconOnly />);
    expect(markup).toContain('<span class="visually-hidden">Failed</span>');
  });

  it("asks for a check, not a retry, when an outcome is unknown", () => {
    const markup = renderToStaticMarkup(<StateNotice state="outcome-unknown" />);
    expect(markup).toContain("Needs checking");
    expect(markup).toContain("may already have gone through");
    expect(markup).toContain("do not try it again");
    expect(markup).not.toContain("<button");
    expect(markup).not.toContain("OUTCOME_UNKNOWN");
  });

  it("keeps not ready, no access and not set up distinct and jargon-free", () => {
    const model = renderToStaticMarkup(<StateNotice state="model-not-ready" />);
    const permission = renderToStaticMarkup(<StateNotice state="permission-denied" />);
    const configuration = renderToStaticMarkup(<StateNotice state="not-configured" />);
    expect(model).toContain("Not ready yet");
    expect(model).toContain("no result to show");
    expect(permission).toContain("does not have permission");
    expect(configuration).toContain("needs to be set up");
    expect(`${model}${permission}${configuration}`).not.toMatch(/MODEL_NOT_READY|backend|integration/);
  });

  it("renders generic empty and loading feedback without product data", () => {
    const empty = renderToStaticMarkup(<EmptyState title="No records" description="The query completed." />);
    const loading = renderToStaticMarkup(<LoadingState label="Loading records" lines={3} />);
    expect(empty).toContain("No records");
    expect(loading).toContain('role="status"');
    expect(loading.match(/loading-state__line/g)).toHaveLength(3);
  });
});

describe("navigation and data-display primitives", () => {
  it("renders tabs with roles and one selected tab", () => {
    const markup = renderToStaticMarkup(<Tabs label="Record views" tabs={[
      { id: "summary", label: "Summary", content: "Summary panel" },
      { id: "history", label: "History", content: "History panel" },
    ]} />);
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('role="tabpanel"');
  });

  it("moves tab focus across enabled tabs for arrows, Home, and End", () => {
    const tabs = [{ disabled: false }, { disabled: true }, { disabled: false }];
    expect(nextEnabledTabIndex(tabs, 0, "ArrowRight")).toBe(2);
    expect(nextEnabledTabIndex(tabs, 2, "ArrowLeft")).toBe(0);
    expect(nextEnabledTabIndex(tabs, 2, "Home")).toBe(0);
    expect(nextEnabledTabIndex(tabs, 0, "End")).toBe(2);
  });

  it("renders a semantic table inside a labelled overflow region", () => {
    const markup = renderToStaticMarkup(
      <Table scrollLabel="Results table">
        <TableCaption>Results</TableCaption>
        <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>Example</TableCell></TableRow></TableBody>
      </Table>,
    );
    expect(markup).toContain('role="region"');
    expect(markup).toContain('aria-label="Results table"');
    expect(markup).toContain("<caption");
    expect(markup).toContain('scope="col"');
    expect(markup).toContain("<tbody");
  });

  it("keeps pagination bounded and localizable", () => {
    expect(paginationWindow(9, 10)).toEqual([6, 7, 8, 9, 10]);
    const markup = renderToStaticMarkup(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} pageLabel={(page) => `Страница ${page}`} />);
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('aria-label="Страница 1"');
    expect(markup).toContain("disabled");
  });
});

describe("surface and display primitives", () => {
  it("composes a generic card without business logic", () => {
    const markup = renderToStaticMarkup(
      <Card elevated>
        <CardHeader><CardTitle>Title</CardTitle><CardDescription>Description</CardDescription></CardHeader>
        <CardContent>Content</CardContent><CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(markup).toContain("card--elevated");
    expect(markup).toContain("card__title");
    expect(markup).toContain("card__footer");
  });

  it("colours people deterministically and agents neutrally", () => {
    expect(avatarHue("Amina S.")).toBe(avatarHue("Amina S."));
    expect([0, 1, 2, 3, 4, 5]).toContain(avatarHue("Mira K."));
    expect(renderToStaticMarkup(<Avatar accessibleName="Amina S." initials="AS" />)).toMatch(/avatar--hue-[0-5]/);
    const agent = renderToStaticMarkup(<Avatar variant="agent" accessibleName="Support Agent" initials="" />);
    expect(agent).toContain("avatar--agent");
    expect(agent).toContain('aria-label="Support Agent"');
    expect(agent).not.toMatch(/avatar--hue-/);
  });

  it("renders labelled helpers and semantic separators", () => {
    const avatar = renderToStaticMarkup(<Avatar accessibleName="Sales Agent" initials="SA" label="Sales Agent" />);
    const helper = renderToStaticMarkup(<ContextHelper>Backend authorization remains authoritative.</ContextHelper>);
    const separator = renderToStaticMarkup(<Separator decorative={false} orientation="vertical" />);
    const badge = renderToStaticMarkup(<Badge tone="information">Verified context</Badge>);
    expect(avatar).toContain('role="img"');
    expect(helper).toContain('role="note"');
    expect(separator).toContain('role="separator"');
    expect(badge).toContain("Verified context");
  });
});

describe("design tokens", () => {
  const cssPath = fileURLToPath(new URL("../../styles/globals.css", import.meta.url));
  const css = readFileSync(cssPath, "utf8");

  it("uses the folk/Linear palette and no banned colours", () => {
    expect(css).toContain("--background: #ffffff");
    expect(css).toContain("--sidebar-bg: #f7f6f3");
    expect(css).toContain("--foreground: #1c1b19");
    expect(css).toContain("--workspace-mark: #d9773a");
    expect(css).not.toMatch(/#0071e3|backdrop-filter|linear-gradient|radial-gradient/i);
    for (const hex of css.match(/#[0-9a-f]{6}\b/gi) ?? []) expect(isVioletHue(hex), hex).toBe(false);
  });

  it("defines dark values for the OS setting and for data-theme=dark, and lets data-theme=light win", () => {
    expect(css).toContain(':root:not([data-theme="light"])');
    expect(css).toMatch(/:root\[data-theme="dark"\][^}]*--background: #101113/);
  });

  it("passes AA contrast for text tokens in both themes", () => {
    for (const theme of ["light", "dark"] as const) {
      const t = tokens(css, theme);
      for (const bg of ["--background", "--sidebar-bg", "--surface-selected", "--tag-bg"]) {
        expect(contrast(t["--foreground"], t[bg]), `${theme} --foreground on ${bg}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(t["--foreground-muted"], t[bg]), `${theme} --foreground-muted on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
      for (const tone of ["success", "pending", "waiting", "danger", "unknown"]) {
        expect(contrast(t[`--status-${tone}`], t["--background"]), `${theme} --status-${tone}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("uses Geist, keeps focus rings and accessibility preferences", () => {
    expect(css).toContain("--font-sans: var(--font-geist)");
    expect(css).toContain("--font-mono: var(--font-geist-mono)");
    expect(css).toContain("outline: 2px solid var(--focus-ring)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (prefers-contrast: more)");
  });
});

describe("primitive styles", () => {
  const css = readFileSync(fileURLToPath(new URL("../../styles/globals.css", import.meta.url)), "utf8");

  it("draws agents and tags without hue", () => {
    expect(css).not.toMatch(/--agent-(sales|support|analytics)/);
    expect(css).toMatch(/\.badge\s*\{[^}]*border-radius: var\(--radius-xs\)/);
  });

  it("has no shadow on cards and no nested card chrome", () => {
    expect(css).toMatch(/\.card\s*\{[^}]*box-shadow: none/);
    expect(css).toContain(".card .card");
  });

  it("sets ids and times in Geist Mono and numbers right-aligned", () => {
    expect(css).toMatch(/\.cell-id\s*\{[^}]*font-family: var\(--font-mono\)/);
    expect(css).toMatch(/\.cell-number\s*\{[^}]*text-align: right/);
  });

  it("stacks table rows on phones", () => {
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.responsive-table/);
  });
});

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

/** True for violet/lavender: hue 270–330 degrees with visible saturation. */
function isVioletHue(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return false;
  const lightness = (max + min) / 2;
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  return hue >= 270 && hue <= 330 && saturation > 0.15;
}

/** Hex values of the custom properties declared in the light (:root) or pinned dark token block. */
function tokens(source: string, theme: "light" | "dark"): Record<string, string> {
  const block = theme === "light"
    ? source.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1]
    : source.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\s*\}/)?.[1];
  if (!block) throw new Error(`no ${theme} token block`);
  return Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]));
}

/** WCAG 2.x contrast ratio between two hex colours. */
function contrast(foreground: string | undefined, background: string | undefined): number {
  if (!foreground || !background) return 0;
  const luminance = (hex: string) => {
    const [r, g, b] = hexToRgb(hex).map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
