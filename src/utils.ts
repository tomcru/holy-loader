/**
 * Converts a given URL to an absolute URL based on the current window location.
 * If the input URL is already absolute, it remains unchanged.
 *
 * @param {string} url - The URL to be converted. Can be an absolute or relative URL.
 * @returns {string} The absolute URL derived from the given URL and the current window location.
 */
export const toAbsoluteURL = (url: string): string => {
  return new URL(url, window.location.href).href;
};

/**
 * Determines if two URLs refer to the same page, differing only by the anchor.
 *
 * @param {string} currentUrl The current URL.
 * @param {string} newUrl The new URL to compare with the current URL.
 * @returns {boolean} True if the URLs refer to the same page (excluding the anchor), false otherwise.
 */
export const isSamePageAnchor = (
  currentUrl: string,
  newUrl: string,
): boolean => {
  const current = new URL(toAbsoluteURL(currentUrl));
  const next = new URL(toAbsoluteURL(newUrl));
  return current.href.split('#')[0] === next.href.split('#')[0];
};

/**
 * Determines if two URLs have the same host.
 *
 * @param {string} currentUrl The current URL.
 * @param {string} newUrl The new URL to compare with the current URL.
 * @returns {boolean} True if the URLs have the same host, false otherwise.
 */
export const isSameHost = (currentUrl: string, newUrl: string): boolean => {
  const current = new URL(toAbsoluteURL(currentUrl));
  const next = new URL(toAbsoluteURL(newUrl));
  return (
    current.hostname.replace(/^www\./, '') ===
    next.hostname.replace(/^www\./, '')
  );
};

/**
 * Determines if two URLs have the same query parameters.
 *
 * @param {string} currentUrl The current URL.
 * @param {string} newUrl The new URL to compare with the current URL.
 * @returns {boolean} True if the URLs have the same query parameters, false otherwise.
 */
export const hasSameQueryParameters = (
  currentUrl: string,
  newUrl: string,
): boolean => {
  const current = new URL(toAbsoluteURL(currentUrl));
  const next = new URL(toAbsoluteURL(newUrl));

  const currentParams = new URLSearchParams(current.search);
  const nextParams = new URLSearchParams(next.search);

  return Array.from(currentParams).every(
    ([key, value]) => nextParams.has(key) && nextParams.get(key) === value,
  );
};
