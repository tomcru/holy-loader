import { describe, expect, it, beforeEach } from 'vitest';
import { toAbsoluteURL } from '../utils';

globalThis.window = {
  // @ts-expect-error - we don't need to implement all of the window object
  location: {
    href: 'https://example.com/',
  },
};

describe('toAbsoluteURL', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com/',
      },
      writable: true,
    });
  });

  it('should return absolute URL for relative URL', () => {
    expect(toAbsoluteURL('/page2')).toEqual('https://example.com/page2');
  });

  it('should handle absolute URL', () => {
    expect(toAbsoluteURL('https://otherdomain.com/page')).toEqual(
      'https://otherdomain.com/page',
    );
  });

  it('should handle relative URL with query parameters', () => {
    expect(toAbsoluteURL('/page?param=value')).toEqual(
      'https://example.com/page?param=value',
    );
  });

  it('should handle relative URL with hash fragment', () => {
    expect(toAbsoluteURL('/page#section')).toEqual(
      'https://example.com/page#section',
    );
  });

  it('should handle protocol-relative URL', () => {
    expect(toAbsoluteURL('//otherdomain.com/page')).toEqual(
      'https://otherdomain.com/page',
    );
  });

  it('should handle root-relative URL', () => {
    expect(toAbsoluteURL('/')).toEqual('https://example.com/');
  });

  it('should handle empty URL', () => {
    expect(toAbsoluteURL('')).toEqual('https://example.com/');
  });
});
