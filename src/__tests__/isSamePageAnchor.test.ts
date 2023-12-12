import { describe, expect, it } from 'vitest';
import { isSamePageAnchor } from '../index';

globalThis.window = {
  // @ts-expect-error - we don't need to implement all of the window object
  location: {
    href: 'https://example.com/',
  },
};

describe('isSamePageAnchor', () => {
  it('should return true for the same URL', () => {
    const currentUrl = 'https://example.com/page';
    const newUrl = 'https://example.com/page';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(true);
  });

  it('should return true for URLs differing only by hash', () => {
    const currentUrl = 'https://example.com/page#section1';
    const newUrl = 'https://example.com/page#section2';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(true);
  });

  it('should return false for URLs with different paths', () => {
    const currentUrl = 'https://example.com/page1';
    const newUrl = 'https://example.com/page2';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it('should return false for URLs with different domains', () => {
    const currentUrl = 'https://example.com/page';
    const newUrl = 'https://different.com/page';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it('should return false for URLs differing by trailing slash', () => {
    const currentUrl = 'https://example.com/page/';
    const newUrl = 'https://example.com/page';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it('should return true for the same URL with and without hash', () => {
    const currentUrl = 'https://example.com/page';
    const newUrl = 'https://example.com/page#section';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(true);
  });

  it('should return false for completely different URLs', () => {
    const currentUrl = 'https://example.com/page1';
    const newUrl = 'https://different.com/page2';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(false);
  });

  it('should return true for relative URLs', () => {
    const currentUrl = 'https://example.com/page';
    const newUrl = '/page';
    expect(isSamePageAnchor(currentUrl, newUrl)).toBe(true);
  });
});
