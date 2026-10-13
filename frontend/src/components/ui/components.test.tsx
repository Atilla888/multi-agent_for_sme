import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import { StateNotice } from "./StateNotice";

describe("foundation UI primitives", () => {
  it("renders explicit semantic status copy", () => {
    const markup = renderToStaticMarkup(<StateNotice state="outcome-unknown" />);
    expect(markup).toContain("OUTCOME_UNKNOWN");
    expect(markup).toContain("Reconcile authoritative state");
  });

  it("exposes loading and disabled button semantics", () => {
    const markup = renderToStaticMarkup(<Button loading>Save</Button>);
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Working");
  });
});
