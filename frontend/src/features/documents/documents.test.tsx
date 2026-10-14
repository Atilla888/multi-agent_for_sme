import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { documentApiContract } from "./adapters/contracts";
import { documentFixtureAdapter, getDocumentDetailFixture, getDocumentsFixtureScreen } from "./adapters/fixtureAdapter";
import { DocumentDetailScreen } from "./components/DocumentDetailScreen";
import { DocumentsScreen } from "./components/DocumentsScreen";

describe("P5E Documents / Knowledge", () => {
  it("renders a business-scoped document list with separate lifecycle facts", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />);
    expect(markup).toContain("Returns and exchanges policy");
    expect(markup).toContain("Stored version");
    expect(markup).toContain("Processing");
    expect(markup).toContain("Publication / retrieval");
    expect(markup).toContain("North Shop · private business scope");
  });

  it("filters the local fixture list by search and lifecycle status", () => {
    const search = getDocumentsFixtureScreen({ q: "shipping" });
    const status = getDocumentsFixtureScreen({ status: "failed" });
    expect(search.items.map((item) => item.id)).toEqual(["doc-shipping"]);
    expect(status.items.map((item) => item.id)).toEqual(["doc-warranty"]);
  });

  it("renders loading without leaking fixture document records", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ state: "loading" })} />);
    expect(markup).toContain("Loading document records");
    expect(markup).not.toContain("Returns and exchanges policy");
  });

  it("distinguishes a valid empty filter result", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ q: "no matching document" })} />);
    expect(markup).toContain("No documents in this fixture view");
    expect(markup).toContain("No permitted document source matches");
  });

  it("fails closed for restricted access and hides protected records", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ state: "restricted" })} />);
    expect(markup).toContain("Documents access is restricted");
    expect(markup).toContain("Visible navigation does not grant backend access");
    expect(markup).not.toContain("Warranty handling guide");
  });

  it("keeps source unavailability distinct from empty and failed indexing", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({ state: "unavailable" })} />);
    expect(markup).toContain("Document source is unavailable");
    expect(markup).toContain("Do not reinterpret this as an empty collection");
    expect(markup).not.toContain("Warranty handling guide");
  });

  it("keeps READY V2 unpublished while published V1 remains current", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-shipping", {})} />);
    expect(markup).toContain("V2 is READY but unpublished");
    expect(markup).toContain("V1 remains the current published source");
    expect(markup).toContain("V1 is current");
    expect(markup).toContain("V2 is not retrievable");
  });

  it("does not let a failed V2 displace active published V1", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-warranty", {})} />);
    expect(markup).toContain("V2 failed processing");
    expect(markup).toContain("does not displace published V1");
    expect(markup).toContain("V1 is current");
    expect(markup).toContain("V1 only for authorized staff");
  });

  it("does not present a stored processing version as READY or retrievable", () => {
    const detail = getDocumentDetailFixture("doc-operations", {});
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={detail} />);
    expect(detail.document?.processingState).toBe("PROCESSING");
    expect(detail.document?.currentVersion).toBeNull();
    expect(markup).toContain("No READY or published result is claimed");
    expect(markup).toContain("Not retrievable");
  });

  it("excludes a revoked publication from retrieval", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-retired", {})} />);
    expect(markup).toContain("Revoked · no current version");
    expect(markup).toContain("Excluded from retrieval");
    expect(markup).toContain("Stored history is not an active retrieval source");
  });

  it("shows safe provenance without raw storage or vector internals", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-returns", {})} />);
    expect(markup).toContain("Safe provenance");
    expect(markup).toContain("returns-policy-v1.txt");
    expect(markup).toContain("Plain text · UTF-8");
    expect(markup).not.toMatch(/bucket|object[_ -]?key|pgvector|embedding vector|vector id/i);
  });

  it("renders a native disabled plain-text file control and no fake upload success", () => {
    const markup = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />);
    expect(markup).toMatch(/<input[^>]*type="file"[^>]*accept="\.txt,text\/plain"[^>]*disabled=""/);
    expect(markup).toContain("Add text document · unavailable");
    expect(markup).toContain("No file is sent");
    expect(markup).not.toMatch(/upload(ed)? successfully/i);
  });

  it("keeps publish and revoke visibly unavailable and executes no action", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-shipping", {})} />);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Publish version · unavailable<\/span>/);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Revoke current · unavailable<\/span>/);
    expect(markup).toContain("No action executed");
  });

  it("states that RAG evidence is subordinate to authorization and structured facts", () => {
    const markup = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-returns", {})} />);
    expect(markup).toContain("RAG evidence is not authorization");
    expect(markup).toContain("cannot grant access");
    expect(markup).toContain("override structured Order or Inventory facts");
    expect(markup).toContain("trigger a business mutation");
  });

  it("uses a network-free fixture adapter and declares every public workflow endpoint unavailable", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    documentFixtureAdapter.list("", "all");
    documentFixtureAdapter.detail("doc-returns");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(documentApiContract.publicEndpoint).toBeNull();
    expect([documentApiContract.list, documentApiContract.detail, documentApiContract.upload, documentApiContract.publish, documentApiContract.revoke]).toEqual(["UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE", "UNAVAILABLE"]);
    vi.unstubAllGlobals();
  });

  it("does not create or advertise a standalone Business Brain destination", () => {
    const list = renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />);
    const detail = renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-returns", {})} />);
    expect(`${list}${detail}`).not.toContain("Business Brain");
  });
});
