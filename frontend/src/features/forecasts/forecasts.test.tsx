import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { forecastApiContract } from "./adapters/contracts";
import { forecastFixtureAdapter, getForecastFixtureScreen } from "./adapters/fixtureAdapter";
import { ForecastsScreen } from "./components/ForecastsScreen";

describe("P5F Forecasts", () => {
  it("defaults to the current MODEL_NOT_READY capability", () => {
    const model = getForecastFixtureScreen({});
    const markup = renderToStaticMarkup(<ForecastsScreen model={model} />);
    expect(model.capability?.status).toBe("MODEL_NOT_READY");
    expect(model.capability?.errorCode).toBe("DEPENDENCY_UNAVAILABLE");
    expect(markup).toContain("CURRENT ENGINEERING STATE");
    expect(markup).toContain("MODEL_NOT_READY");
    expect(markup).toContain("No prediction has been produced");
  });

  it("does not fabricate a forecast series, numeric result, artifact, or run", () => {
    const model = getForecastFixtureScreen({});
    const markup = renderToStaticMarkup(<ForecastsScreen model={model} />);
    expect(model.capability?.artifactAvailable).toBe(false);
    expect(model.capability?.predictionAvailable).toBe(false);
    expect(model.capability?.runAvailable).toBe(false);
    expect(markup).not.toContain("<svg");
    expect(markup).not.toContain("forecast-result");
    expect(markup).not.toContain("href=\"/forecasts/");
  });

  it("keeps forecast request visibly and natively disabled", () => {
    const markup = renderToStaticMarkup(<ForecastsScreen model={getForecastFixtureScreen({})} />);
    expect(markup).toContain("Request forecast · unavailable");
    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain("No request was sent");
  });

  it("separates future TARGET requirements from current capability", () => {
    const markup = renderToStaticMarkup(<ForecastsScreen model={getForecastFixtureScreen({})} />);
    expect(markup).toContain("TARGET PRODUCT UX · not current");
    expect(markup).toContain("What a future real result must prove");
    expect(markup).toContain("non-interactive and contains no prediction");
    expect(markup).toContain("Open historical Analytics");
  });

  it("withholds request context in the restricted state", () => {
    const model = getForecastFixtureScreen({ state: "restricted" });
    const markup = renderToStaticMarkup(<ForecastsScreen model={model} />);
    expect(model.capability).toBeNull();
    expect(markup).toContain("Forecast access is restricted");
    expect(markup).not.toContain("forecast_sales");
    expect(markup).not.toContain("Request forecast · unavailable");
  });

  it("uses an interface-ready adapter without a fake API or experiment output", () => {
    expect(forecastApiContract.publicEndpoint).toBeNull();
    expect(String(forecastFixtureAdapter.readiness)).not.toContain("fetch(");
    const markup = renderToStaticMarkup(<ForecastsScreen model={getForecastFixtureScreen({})} />);
    expect(markup).not.toMatch(/TSR|FER|H0|H1|SINGLE|STATIC|ADAPTIVE/);
  });
});
