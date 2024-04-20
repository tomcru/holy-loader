'use client';

import * as React from 'react';
import { HolyProgress } from './HolyProgress';
import { DEFAULTS, START_HOLY_EVENT, STOP_HOLY_EVENT } from './constants';

export interface HolyLoaderProps {
  /**
   * Specifies the color of the top-loading bar.
   * Default: "#59a2ff" (a shade of blue)
   */
  color?: string;

  /**
   * Sets the initial position of the top-loading bar as a percentage of the total width.
   * Default: 0.08 (8% of the total width)
   */
  initialPosition?: number;

  /**
   * Specifies the height of the top-loading bar in either pixels (number) or css unit (string).
   * Default: 4 pixels
   */
  height?: number | string;

  /**
   * Specifies the easing function to use for the loading animation. Accepts any valid CSS easing string.
   * Default: "ease"
   */
  easing?: string;

  /**
   * Sets the animation speed of the top-loading bar in milliseconds.
   * Default: 200 milliseconds
   */
  speed?: number;

  /**
   * Defines the z-index property of the top-loading bar, controlling its stacking order.
   * Default: 2147483647
   */
  zIndex?: number;

  /**
   * Specifies the shadow effect to be applied to the top-loading bar.
   * For example: "0 0 10px #59a2ff, 0 0 5px #59a2ff"
   */
  boxShadow?: string;

  /**
   * Specifies whether to accompany the loading bar with a spinner.
   * Default: false
   */
  showSpinner?: boolean;
}

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
 * Dispatches the event to manually start the HolyLoader progress bar.
 */
export const startHolyProgress = (): void => {
  document.dispatchEvent(new Event(START_HOLY_EVENT));
};

/**
 * Dispatches the event to manually stop the HolyLoader progress bar.
 */
export const stopHolyProgress = (): void => {
  document.dispatchEvent(new Event(STOP_HOLY_EVENT));
};

/**
 * HolyLoader is a React component that provides a customizable top-loading progress bar.
 *
 * @param {HolyLoaderProps} props The properties for configuring the HolyLoader.
 * @returns {null}
 */
const HolyLoader = ({
  color = DEFAULTS.color,
  initialPosition = DEFAULTS.initialPosition,
  height = DEFAULTS.height,
  easing = DEFAULTS.easing,
  speed = DEFAULTS.speed,
  zIndex = DEFAULTS.zIndex,
  boxShadow = DEFAULTS.boxShadow,
  showSpinner = DEFAULTS.showSpinner,
}: HolyLoaderProps): null => {
  const holyProgressRef = React.useRef<HolyProgress | null>(null);

  React.useEffect(() => {
    const startProgress = (): void => {
      if (holyProgressRef.current === null) {
        return;
      }

      try {
        holyProgressRef.current.start();
      } catch (error) {}
    };

    const stopProgress = (): void => {
      if (holyProgressRef.current === null) {
        return;
      }

      try {
        holyProgressRef.current.complete();
      } catch (error) {}
    };

    /**
     * Flag to prevent redundant patching of History API methods.
     * This is essential to avoid pushState & replaceState increasingly nesting
     * within patched versions of itself
     */
    let isHistoryPatched = false;

    /**
     * Enhances browser history methods (pushState and replaceState) to ensure that the
     * progress indicator is appropriately halted when navigating through single-page applications
     */
    const stopProgressOnHistoryUpdate = (): void => {
      if (isHistoryPatched) {
        return;
      }

      const originalPushState = history.pushState.bind(history);
      history.pushState = (...args) => {
        stopProgress();
        originalPushState(...args);
      };

      // This is crucial for Next.js Link components using the 'replace' prop.
      const originalReplaceState = history.replaceState.bind(history);
      history.replaceState = (...args) => {
        stopProgress();
        originalReplaceState(...args);
      };

      isHistoryPatched = true;
    };

    /**
     * Handles click events on anchor tags, starting the progress bar for page navigation.
     * It checks for various conditions to decide whether to start the progress bar or not.
     *
     * @param {MouseEvent} event The mouse event triggered by clicking an anchor tag.
     */
    const handleClick = (event: MouseEvent): void => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        if (
          anchor === null ||
          anchor.target === '_blank' ||
          event.ctrlKey ||
          event.metaKey ||
          // Skip if URL points to a different domain
          !isSameHost(window.location.href, anchor.href) ||
          // Skip if URL is a same-page anchor (href="#", href="#top", etc.).
          isSamePageAnchor(window.location.href, anchor.href) ||
          // Skip if URL uses a non-http/https protocol (mailto:, tel:, etc.).
          !toAbsoluteURL(anchor.href).startsWith('http')
        ) {
          return;
        }

        startProgress();
      } catch (error) {
        stopProgress();
      }
    };

    try {
      if (holyProgressRef.current !== null) {
        holyProgressRef.current = new HolyProgress({
          color,
          height,
          initialPosition,
          easing,
          speed,
          zIndex,
          boxShadow,
          showSpinner,
        });
      }

      document.addEventListener('click', handleClick);
      document.addEventListener(START_HOLY_EVENT, startProgress);
      document.addEventListener(STOP_HOLY_EVENT, stopProgress);
      stopProgressOnHistoryUpdate();
    } catch (error) {}

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener(START_HOLY_EVENT, startProgress);
      document.removeEventListener(STOP_HOLY_EVENT, stopProgress);
    };
  }, [holyProgressRef]);

  return null;
};

export default HolyLoader;
