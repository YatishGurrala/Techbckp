import { describe, expect, it } from "vitest";

import {
  isValidGaMeasurementId,
  sanitizeAnalyticsParams,
  sanitizeReferrer,
} from "@/lib/client-analytics";

describe("client-analytics", () => {
  it("validates GA4 measurement IDs", () => {
    expect(isValidGaMeasurementId("G-ABC1234567")).toBe(true);
    expect(isValidGaMeasurementId("G-123456")).toBe(true);
    expect(isValidGaMeasurementId("")).toBe(false);
    expect(isValidGaMeasurementId("UA-12345-1")).toBe(false);
    expect(isValidGaMeasurementId(undefined)).toBe(false);
  });

  it("enforces strict parameter allowlist and strips PII, emails, and phone numbers", () => {
    const sanitized = sanitizeAnalyticsParams({
      service: "MVP development",
      budget: "$5k - $10k",
      name: "Jane Founder",
      email: "jane@company.com",
      phone: "+15551234567",
      message: "Confidential brief",
      company: "Acme Corp",
      utm_source: "linkedin",
      utm_campaign: "reach me at owner@acme.io",
      utm_term: "+44 7700 900123",
      arbitrary_unlisted_key: "should-be-dropped",
    });

    expect(sanitized).toEqual({
      service: "MVP development",
      budget: "$5k - $10k",
      utm_source: "linkedin",
    });
  });

  it("strips query strings and fragments from referrers so PII cannot leak", () => {
    expect(
      sanitizeReferrer("https://mail.example.com/inbox?email=user@domain.com&token=abc#sec"),
    ).toBe("https://mail.example.com/inbox");
    expect(sanitizeReferrer("javascript:alert(1)")).toBe("");
    expect(sanitizeReferrer("")).toBe("");
  });
});
