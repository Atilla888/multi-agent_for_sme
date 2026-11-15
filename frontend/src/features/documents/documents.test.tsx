import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { withLocale } from "@/test/intl";
import { documentApiContract } from "./adapters/contracts";
import { documentFixtureAdapter, getDocumentDetailFixture, getDocumentsFixtureScreen } from "./adapters/fixtureAdapter";
import { DocumentDetailScreen } from "./components/DocumentDetailScreen";
import { DocumentsScreen } from "./components/DocumentsScreen";

describe("Documents", () => {
  it("lists document versions as mono references and shows detail facts in the side panel", () => {
    expect(renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen({})} />)).toContain('class="cell-id"');
    expect(renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture("doc-shipping", {})} />)).toContain("detail-layout__side details-panel");
  });

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

describe("Documents in Russian and Kazakh", () => {
  const list = (locale: "ru" | "kk", query: Record<string, string> = {}) => withLocale(locale, () => renderToStaticMarkup(<DocumentsScreen model={getDocumentsFixtureScreen(query)} />));
  const detail = (locale: "ru" | "kk", id: string, query: Record<string, string> = {}) => withLocale(locale, () => renderToStaticMarkup(<DocumentDetailScreen model={getDocumentDetailFixture(id, query)} />));
  const englishList = ["Latest version", "Who can use it", "Customers and staff", "Staff only", "Search documents", "Title or version", "Ready to publish", "Uploading is not available yet", "<span>Upload</span>", ">View<", "Agents use V1 only", "Not published yet", "Published 14 Oct"];
  const englishDetail = ["Uploaded", "Used by agents", "is current", "Versions of", "Plain text", "Previously published", "Kept for reference", "Publish version", "Document details", "The file could not be read", "Documents inform answers", "Agents keep using"];

  it("words the list in Russian, with Russian dates, and leaves titles and the shop name as recorded", () => {
    const markup = list("ru");
    expect(markup).toContain("<h1>Документы</h1>");
    expect(markup).toContain('placeholder="Название или версия"');
    expect(markup).toContain('data-label="Кто может использовать"');
    expect(markup).toContain("Клиенты и сотрудники");
    expect(markup).toContain("V1 опубликована, V2 ждёт");
    expect(markup).toContain("Агенты используют только V1");
    expect(markup).toContain("Удалено 30 сент., 18:00");
    expect(markup).toContain("Returns and exchanges policy");
    expect(markup).toContain("North Shop");
    for (const english of englishList) expect(markup).not.toContain(english);
  });

  it("words the list in Kazakh", () => {
    const markup = list("kk");
    expect(markup).toContain("<h1>Құжаттар</h1>");
    expect(markup).toContain("Соңғы нұсқа");
    expect(markup).toContain("Тек қызметкерлер");
    expect(markup).toContain("V1 жарияланған, V2 өңделмеді");
    expect(markup).toContain("Жарияланды: 14 қаз., 10:32");
    expect(markup).toContain("<span>Жүктеу</span>");
    expect(markup).toContain("Shipping service guide");
    for (const english of englishList) expect(markup).not.toContain(english);
  });

  it("finds documents by their Russian and Kazakh labels", () => {
    expect(getDocumentsFixtureScreen({ q: "только сотрудники" }).items.map((item) => item.id)).toEqual(["doc-warranty", "doc-operations"]);
    expect(getDocumentsFixtureScreen({ q: "күтуде" }).items.map((item) => item.id)).toEqual(["doc-shipping"]);
  });

  it("words the list's empty, no-access and unavailable states", () => {
    expect(list("ru", { q: "нет такого" })).toContain("Документы не найдены");
    expect(list("kk", { state: "restricted" })).toContain("Құжаттарға рұқсатыңыз жоқ");
    expect(list("ru", { state: "unavailable" })).toContain("Пустой экран не означает, что документов нет");
    expect(list("kk", { state: "loading" })).toContain('aria-label="Құжаттар жүктелуде"');
  });

  it("words a document's life, versions and details in Russian", () => {
    const markup = detail("ru", "doc-warranty");
    expect(markup).toContain("1 · Загружено");
    expect(markup).toContain("V1 — текущая");
    expect(markup).toContain("V2 не удалось обработать. Агенты по-прежнему используют V1");
    expect(markup).toContain('aria-label="Версии документа «Warranty handling guide»"');
    expect(markup).toContain("Обычный текст · UTF-8");
    expect(markup).toContain("Не удалось полностью прочитать файл");
    expect(markup).toContain("Текущая · 02 окт., 11:28");
    expect(markup).toContain("<span>Опубликовать версию</span>");
    expect(markup).toContain("warranty-guide-v2.txt");
    for (const english of englishDetail) expect(markup).not.toContain(english);
  });

  it("words a document's life, versions and details in Kazakh", () => {
    const markup = detail("kk", "doc-retired");
    expect(markup).toContain("4 · Агенттер қолданады");
    expect(markup).toContain("Ештеңе жарияланбаған");
    expect(markup).toContain("Бұл құжат жойылды");
    expect(markup).toContain("Дайын (ескі нұсқа)");
    expect(markup).toContain("Анықтама үшін сақталған.");
    expect(markup).toContain("Жарияланған нұсқа");
    expect(markup).toContain("Retired seasonal promotion");
    for (const english of [...englishDetail, "Removed", "Not used", "Nothing published", "Ready (old)"]) expect(markup).not.toContain(english);
    expect(detail("kk", "missing")).toContain("Құжат табылмады");
  });
});
