import { describe, expectTypeOf, it } from "vitest";
import type { StaffRole } from "./auth";

describe("evidenced staff-role contract", () => {
  it("matches the current backend role literals", () => {
    expectTypeOf<StaffRole>().toEqualTypeOf<"OWNER" | "OPERATOR" | "PLATFORM_ADMIN">();
  });
});
