import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { forecastApiContract } from "./adapters/contracts";
import { forecastFixtureAdapter, getForecastFixtureScreen } from "./adapters/fixtureAdapter";
import { ForecastsScreen } from "./components/ForecastsScreen";

describe("Forecasts", () => {
  it("defaults to the not-ready state and says so plainly", () => {
    const model = getForecastFixtureScreen({});
    const markup = renderToStaticMarkup(<ForecastsScreen model={model} />);
    expect(model.capability?.status).toBe("MODEL_NOT_READY");
    expect(model.capability?.errorCode).toBe("DEPENDENCY_UNAVAILABLE");
    expect(markup).toContain("Forecasts are not ready yet");
    expect(markup).toContain("Not ready yet");
    expect(markup).toContain("nothing is predicted");
    expect(markup).not.toMatch(/MODEL_NOT_READY|DEPENDENCY_UNAVAILABLE|forecast_sales|TARGET/);
  });

  it("does not fabricate a forecast series, number, artifact or run", () => {
    const model = getForecastFixtureScreen({});
    const markup = renderToStaticMarkup(<ForecastsScreen model={model} />);
    expect(model.capability?.artifactAvailable).toBe(false);
    expect(model.capability?.predictionAvailable).toBe(false);
    expect(model.capability?.runAvailable).toBe(false);
    expect(markup).not.toContain("<svg viewBox");
    expect(markup).not.toContain("forecast-result");
    expect(markup).not.toContain("href=\"/forecasts/");
  });

  it("keeps the request button visibly disabled", () => {
    const markup = renderToStaticMarkup(<ForecastsScreen model={getForecastFixtureScreen({})} />);
    expect(markup).toMatch(/<button[^>]*disabled=""[^>]*><span>Request forecast<\/span>/);
    expect(markup).toContain("Nothing is requested from this screen");
  });

  it("describes the future result without predicting anything", () => {
    const markup = renderToStaticMarkup(<ForecastsScreen model={getForecastFixtureScreen({})} />);
    expect(markup).toContain("How a forecast will be shown");
    expect(markup).toContain("It contains no prediction");
    expect(markup).toContain("Open Reports");
  });

  it("withholds the request section when the person has no access", () => {
    const model = getForecastFixtureScreen({ state: "restricted" });
    const markup = renderToStaticMarkup(<ForecastsScreen model={model} />);
    expect(model.capability).toBeNull();
    expect(markup).toContain("don&#x27;t have access to forecasts");
    expect(markup).not.toContain("Request forecast");
  });

  it("uses an interface-ready adapter without a fake API or experiment output", () => {
    expect(forecastApiContract.publicEndpoint).toBeNull();
    expect(String(forecastFixtureAdapter.readiness)).not.toContain("fetch(");
    const markup = renderToStaticMarkup(<ForecastsScreen model={getForecastFixtureScreen({})} />);
    expect(markup).not.toMatch(/TSR|FER|H0|H1|SINGLE|STATIC|ADAPTIVE/);
  });
});
