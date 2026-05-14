import { describe, expect, it } from "vitest";

import { mapHttpError } from "./http";

describe("buildstack error mapping", () => {
  it("maps http errors with status and details", () => {
    const error = mapHttpError(503, { message: "service unavailable" });

    expect(error.code).toBe("http");
    expect(error.status).toBe(503);
    expect(error.message).toContain("503");
    expect(error.details).toEqual({ message: "service unavailable" });
  });
});
