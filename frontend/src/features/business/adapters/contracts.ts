export interface UnavailableBusinessApiBoundary {
  readonly publicEndpoint: null;
  readonly status: "UNAVAILABLE";
  readonly reason: string;
  readonly verifiedInternalContract: boolean;
}

export const p5dBusinessApiBoundary: UnavailableBusinessApiBoundary = {
  publicEndpoint: null,
  status: "UNAVAILABLE",
  reason: "No authenticated public staff business-record endpoint exists.",
  verifiedInternalContract: true,
};
