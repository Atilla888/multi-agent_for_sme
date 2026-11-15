import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { documentApiContract } from "./adapters/contracts";
import { documentFixtureAdapter, getDocumentDetailFixture, getDocumentsFixtureScreen } from "./adapters/fixtureAdapter";
import { DocumentDetailScreen } from "./components/DocumentDetailScreen";
import { DocumentsScreen } from "./components/DocumentsScreen";

describe("Documents", () => {
  it("lists documents with processing and publishing shown separately", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />);
    expect(markup).toContain("Returns and exchanges policy");
    expect(markup).toContain("Latest version");
    expect(markup).toContain("Processing");
    expect(markup).toContain("Published");
    expect(markup).toContain("North Shop");
    expect(markup).not.toMatch(/fixture|READY|lifecycle/);
  });

  it("filters by search and status", () => {
    const search = getDocumentsFixtureScreen({ q: "shipping" });
    const status = getDocumentsFixtureScreen({ status: "failed" });
    expect(search.items.map((item) => item.id)).toEqual(["doc-shipping"]);
    expect(status.items.map((item) => item.id)).toEqual(["doc-warranty"]);
  });

  it("renders loading without leaking document records", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ state: "loading" })} />);
    expect(markup).toContain("Loading documents");
    expect(markup).not.toContain("Returns and exchanges policy");
  });

  it("distinguishes an empty filter result", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ q: "no matching document" })} />);
    expect(markup).toContain("No documents found");
    expect(markup).toContain("No documents match this search or filter");
  });

  it("fails closed for no access and hides records", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ state: "restricted" })} />);
    expect(markup).toContain("don&#x27;t have access to documents");
    expect(markup).not.toContain("Warranty handling guide");
  });

  it("keeps an unavailable source distinct from empty", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ state: "unavailable" })} />);
    expect(markup).toContain("can&#x27;t be loaded right now");
    expect(markup).toContain("does not mean there are no documents");
    expect(markup).not.toContain("Warranty handling guide");
  });

  it("keeps a ready V2 unpublished while V1 stays current", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-shipping", {})} />);
    expect(markup).toContain("V2 is ready but not published yet");
    expect(markup).toContain("Agents keep using V1");
    expect(markup).toContain("V1 is current");
    expect(markup).toContain("Agents use V1 only");
  });

  it("does not let a failed V2 displace published V1", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-warranty", {})} />);
    expect(markup).toContain("V2 failed processing");
    expect(markup).toContain("Agents keep using V1");
    expect(markup).toContain("V1 is current");
  });

  it("does not present a processing version as ready or in use", () => {
    const detail = getDocumentDetailFixture("doc-operations", {});
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={detail} />);
    expect(detail.document?.processingState).toBe("PROCESSING");
    expect(detail.document?.currentVersion).toBeNull();
    expect(markup).toContain("still processing");
    expect(markup).toContain("Not used yet");
  });

  it("excludes a removed document from use", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-retired", {})} />);
    expect(markup).toContain("Removed");
    expect(markup).toContain("Not used");
    expect(markup).toContain("agents do not use them");
  });

  it("shows file details without raw storage or vector internals", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-returns", {})} />);
    expect(markup).toContain("returns-policy-v1.txt");
    expect(markup).toContain("Plain text · UTF-8");
    expect(markup).not.toMatch(/bucket|object[_ -]?key|pgvector|embedding vector|vector id/i);
  });

  it("renders a disabled plain-text upload control and no fake upload success", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />);
    expect(markup).toMatch(/<input[^>]*type="file"[^>]*accept="\.txt,text\/plain"[^>]*disabled=""/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Upload<\/span>/);
    expect(markup).toContain("Nothing is sent from this screen");
    expect(markup).not.toMatch(/upload(ed)? successfully/i);
  });

  it("keeps publish and remove visibly disabled", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-shipping", {})} />);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Publish version<\/span>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Remove<\/span>/);
    expect(markup).toContain("Nothing changes from this screen");
  });

  it("says documents inform answers but cannot change anything", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-returns", {})} />);
    expect(markup).toContain("Documents inform answers");
    expect(markup).toContain("can&#x27;t change prices, stock, orders or who has access");
  });

  it("uses a network-free adapter and declares every workflow endpoint unavailable", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    documentFixtureAdapter.list("", "all");
    documentFixtureAdapter.detail("doc-returns");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(documentApiContract.publicEndpoint).toBeNull();
    expect([documentApiContract.list, documentApiContract.detail, documentApiContract.upload, documentApiContract.publish, documentApiContract.revoke]).toEqual(["UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE"]);
    vi.unstubAllGlobals();
  });

  it("does not advertise a standalone Business Brain destination", () => {
    const list = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />);
    const detail = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-returns", {})} />);
    expect(`${list}${detail}`).not.toContain("Business Brain");
  });
});
