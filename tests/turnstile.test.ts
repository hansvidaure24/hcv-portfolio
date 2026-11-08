import { describe, expect, it } from "vitest";
import { verifyTurnstile } from "../app/lib/turnstile";

// A stand-in for Cloudflare's siteverify endpoint that records what it was sent.
function fakeCloudflare(reply: unknown) {
  const calls: URLSearchParams[] = [];
  const fetchImpl = async (_url: string, init: { body: URLSearchParams }) => {
    calls.push(init.body);
    return { json: async () => reply };
  };
  return { calls, fetchImpl };
}

describe("verifyTurnstile", () => {
  it("passes when Cloudflare says success, sending the secret, token and IP", async () => {
    const cf = fakeCloudflare({ success: true });
    const result = await verifyTurnstile({ token: "tok", secret: "sec", ip: "203.0.113.7", fetchImpl: cf.fetchImpl });
    expect(result).toEqual({ ok: true });
    expect(Object.fromEntries(cf.calls[0]!)).toEqual({ secret: "sec", response: "tok", remoteip: "203.0.113.7" });
  });

  it("fails with Cloudflare's error codes when it says no", async () => {
    const cf = fakeCloudflare({ success: false, "error-codes": ["timeout-or-duplicate"] });
    expect(await verifyTurnstile({ token: "tok", secret: "sec", fetchImpl: cf.fetchImpl })).toEqual({
      ok: false,
      reason: "timeout-or-duplicate",
    });
  });

  it("fails without calling Cloudflare when there's no usable token", async () => {
    const cf = fakeCloudflare({ success: true });
    for (const token of [undefined, null, "", 42, "x".repeat(2049)]) {
      expect((await verifyTurnstile({ token, secret: "sec", fetchImpl: cf.fetchImpl })).ok).toBe(false);
    }
    expect(cf.calls).toHaveLength(0);
  });

  it("fails closed when Cloudflare can't be reached", async () => {
    const fetchImpl = async () => {
      throw new Error("network down");
    };
    expect(await verifyTurnstile({ token: "tok", secret: "sec", fetchImpl })).toEqual({
      ok: false,
      reason: "siteverify-unreachable",
    });
  });

  it("treats anything but success: true as a failure", async () => {
    const cf = fakeCloudflare({ success: "true" });
    expect((await verifyTurnstile({ token: "tok", secret: "sec", fetchImpl: cf.fetchImpl })).ok).toBe(false);
  });
});
