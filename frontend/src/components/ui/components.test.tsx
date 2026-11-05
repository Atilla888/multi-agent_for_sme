import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar";
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
  it("communicates status with both a marker and plain text", () => {
    const markup = renderToStaticMarkup(<StatusBadge state="waiting-human" />);
    expect(markup).toContain("status-badge__marker");
    expect(markup).toContain("status-badge__dot");
    expect(markup).toContain("Needs a person");
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

  it("defines one accent and semantic status tones for light and dark", () => {
    expect(css).toContain("--primary: #0071e3");
    expect(css).toContain("--background: #f5f5f7");
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain("--status-unknown:");
    expect(css).toContain("--status-waiting:");
    expect(css).toContain("--chart-actual:");
    expect(css).toContain("--chart-predicted:");
    expect(css).toContain("--radius-md: 10px");
    expect(css).toContain("--radius-lg: 14px");
    expect(css).not.toContain("navy");
  });

  it("keeps the shell breakpoints and translucent chrome", () => {
    expect(css).toContain("--sidebar-width: 248px");
    expect(css).toContain("--rail-width: 72px");
    expect(css).toContain("@media (max-width: 1100px)");
    expect(css).toContain("@media (max-width: 640px)");
    expect(css).toContain(".mobile-tabbar");
    expect(css).toContain("backdrop-filter: blur(24px)");
  });

  it("uses the system font, size-specific tracking, focus rings and accessibility preferences", () => {
    expect(css).toContain("-apple-system, BlinkMacSystemFont");
    expect(css).toContain("--tracking-tight: -0.02em");
    expect(css).toContain("--type-body-line: 20px");
    expect(css).toContain("outline: 2px solid var(--focus-ring)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(css).toContain("@media (prefers-contrast: more)");
  });
});
