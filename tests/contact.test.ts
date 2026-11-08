import { describe, expect, it } from "vitest";
import { MIN_FILL_MS, escapeHtml, isFilledTooFast } from "../app/lib/validateContact";

describe("filled-too-fast check", () => {
  it("lets through a form that was open long enough", () => {
    expect(isFilledTooFast(MIN_FILL_MS)).toBe(false);
    expect(isFilledTooFast(45_000)).toBe(false);
  });

  it("stops a form sent faster than a person could fill it", () => {
    expect(isFilledTooFast(0)).toBe(true);
    expect(isFilledTooFast(MIN_FILL_MS - 1)).toBe(true);
  });

  it("treats a missing or bogus timer as too fast", () => {
    for (const value of [undefined, null, "9000", Number.NaN, Number.POSITIVE_INFINITY, {}]) {
      expect(isFilledTooFast(value)).toBe(true);
    }
  });
});

describe("escapeHtml", () => {
  it("escapes everything that could open a tag or an attribute", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  });
});
