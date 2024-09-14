import { describe, expect, it } from 'vitest';
import { hasSameQueryParameters } from '../utils';

globalThis.window = {
  // @ts-expect-error - we don't need to implement all of the window object
  location: {
    href: 'https://example.com/',
  },
};

describe('hasSameQueryParameters', () => {
  it('should return true for the same search parameters', () => {
    const currentUrl = 'https://example.com/page?a=1&b=2';
    const newUrl = 'https://example.com/page?a=1&b=2';
    expect(hasSameQueryParameters(currentUrl, newUrl)).toBe(true);
  });

  it('should return false when new URL has different search parameters', () => {
    const currentUrl = 'https://example.com/page?a=1&b=2';
    const newUrl = 'https://example.com/page?a=1&b=3';
    expect(hasSameQueryParameters(currentUrl, newUrl)).toBe(false);
  });

  it('should return true when both URLs have no search parameters', () => {
    const currentUrl = 'https://example.com/page';
    const newUrl = 'https://example.com/page';
    expect(hasSameQueryParameters(currentUrl, newUrl)).toBe(true);
  });

  it('should return false when new URL has no search paramters', () => {
    const currentUrl = 'https://example.com/page?a=1&b=2';
    const newUrl = 'https://example.com/page';
    expect(hasSameQueryParameters(currentUrl, newUrl)).toBe(false);
  });
});
