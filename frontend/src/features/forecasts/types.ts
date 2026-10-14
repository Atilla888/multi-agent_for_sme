export type ForecastViewState = "model-not-ready" | "restricted";

export interface ForecastCapability {
  readonly status: "MODEL_NOT_READY";
  readonly errorCode: "DEPENDENCY_UNAVAILABLE";
  readonly safeMessage: string;
  readonly detail: "MODEL_NOT_READY";
  readonly artifactAvailable: false;
  readonly predictionAvailable: false;
  readonly runAvailable: false;
}

export interface ForecastScreenModel {
  readonly mode: "LOCAL CURRENT-STATE REPRESENTATION";
  readonly state: ForecastViewState;
  readonly capability: ForecastCapability | null;
}
