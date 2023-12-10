import { describe, expect, it } from "vitest";
import { isSamePageAnchor } from "../index.tsx";

describe("isSamePageAnchor", () => {
  it("should return true for URLs differing only by hash", () => {
    const currentUrl = "http://example.com/page#section1";
    const newUrl = "http://example.com/page#section2";
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(true);
  });

  it("should return false for URLs with different paths", () => {
    const currentUrl = "http://example.com/page1";
    const newUrl = "http://example.com/page2";
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it("should return false for URLs with different domains", () => {
    const currentUrl = "http://example.com/page";
    const newUrl = "http://different.com/page";
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it("should return false for URLs differing by trailing slash", () => {
    const currentUrl = "http://example.com/page/";
    const newUrl = "http://example.com/page";
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it("should return true for the same URL with and without hash", () => {
    const currentUrl = "http://example.com/page";
    const newUrl = "http://example.com/page#section";
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(true);
  });

  it("should return false for completely different URLs", () => {
    const currentUrl = "http://example.com/page1";
    const newUrl = "http://different.com/page2";
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });
});
