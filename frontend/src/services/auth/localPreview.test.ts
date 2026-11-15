import { afterEach, describe, expect, it, vi } from "vitest";
import { localPreviewEnabled, localPreviewIdentity } from "./localPreview";
import { serverAuthAdapter } from "./server";
import { fixtureReview } from "@/features/integration/serverScreens";

afterEach(() => vi.unstubAllEnvs());

describe("local preview without sign-in", () => {
  it("is off unless LOCAL_PREVIEW_NO_SIGN_IN=true", () => {
    expect(localPreviewEnabled()).toBe(false);
    vi.stubEnv("LOCAL_PREVIEW_NO_SIGN_IN", "1");
    expect(localPreviewEnabled()).toBe(false);
  });

  it("turns on in development when the flag is set", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_PREVIEW_NO_SIGN_IN", "true");
    expect(localPreviewEnabled()).toBe(true);
  });

  it("never turns on in a production build, even with the flag", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOCAL_PREVIEW_NO_SIGN_IN", "true");
    expect(localPreviewEnabled()).toBe(false);
  });

  it("gives staff pages a demo owner instead of asking to sign in", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_PREVIEW_NO_SIGN_IN", "true");
    await expect(serverAuthAdapter.getSession()).resolves.toEqual(localPreviewIdentity);
    expect(localPreviewIdentity.roles).toEqual(["OWNER"]);
  });

  it("shows sample data on every screen, because there is no token for live reads", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LOCAL_PREVIEW_NO_SIGN_IN", "true");
    expect(fixtureReview({})).toBe(true);
    vi.stubEnv("LOCAL_PREVIEW_NO_SIGN_IN", "false");
    expect(fixtureReview({})).toBe(false);
  });
});
