import * as React from 'react';
import * as NProgress from 'nprogress';
import { DEFAULTS } from './constants';

export type HolyLoaderProps = {
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
   * Determines the delay speed for the incremental movement of the top-loading bar, in milliseconds.
   * Default: 200 milliseconds
   */
  crawlSpeed?: number;

  /**
   * Defines the height of the top-loading bar in pixels.
   * Default: 4 pixels
   */
  height?: number;

  /**
   * Enables or disables the automatic incremental movement of the top-loading bar.
   * Default: true (enabled)
   */
  crawl?: boolean;

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
};

/**
 * HolyLoader is a React component that provides a customizable top-loading progress bar.
 * It uses the NProgress library for progress display and offers various props for customization.
 *
 * @param {HolyLoaderProps} props The properties for configuring the HolyLoader.
 * @returns {JSX.Element} The styles element to be rendered.
 */
const HolyLoader = ({
  color = DEFAULTS.color,
  initialPosition = DEFAULTS.initialPosition,
  crawlSpeed = DEFAULTS.crawlSpeed,
  height = DEFAULTS.height,
  crawl = DEFAULTS.crawl,
  easing = DEFAULTS.easing,
  speed = DEFAULTS.speed,
  zIndex = DEFAULTS.zIndex,
}: HolyLoaderProps) => {
  const styles = (
    <style>
      {`
        #nprogress { pointer-events: none; }
        #nprogress .bar {
          background: ${color};
          position: fixed;
          z-index: ${zIndex};
          top: 0;
          left: 0;
          width: 100%;
          height: ${height}px;
        }
      `}
    </style>
  );

  React.useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      trickle: crawl,
      trickleSpeed: crawlSpeed,
      minimum: initialPosition,
      easing: easing,
      speed: speed,
      template: '<div class="bar" role="bar"><div class="peg"></div></div>',
    });

    /**
     * Determines if two URLs refer to the same page, differing only by the anchor.
     *
     * @param {string} currentUrl The current URL.
     * @param {string} newUrl The new URL to compare with the current URL.
     * @returns {boolean} True if the URLs refer to the same page (excluding the anchor), false otherwise.
     */
    const isSamePageAnchor = (currentUrl: string, newUrl: string) => {
      const current = new URL(currentUrl);
      const next = new URL(newUrl);
      return current.href.split('#')[0] === next.href.split('#')[0];
    };

    /**
     * Handles click events on anchor tags, starting the NProgress bar for page navigation.
     * It checks for various conditions to decide whether to start the progress bar or not.
     *
     * @param {MouseEvent} event The mouse event triggered by clicking an anchor tag.
     */
    const handleClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest('a');
        if (
          !anchor ||
          anchor.target === '_blank' ||
          event.ctrlKey ||
          event.metaKey ||
          anchor.href.startsWith('blob:')
        ) {
          return;
        }

        NProgress.start();
        if (isSamePageAnchor(window.location.href, anchor.href)) {
          NProgress.done();
          document.documentElement.classList.remove('nprogress-busy');
        } else {
          overridePushState();
        }
      } catch (error) {
        NProgress.start();
        NProgress.done();
      }
    };

    /**
     * Overrides the history.pushState function to stop the NProgress bar
     * when navigating to a new page without a full page reload.
     */
    const overridePushState = () => {
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        NProgress.done();
        document.documentElement.classList.remove('nprogress-busy');
        originalPushState.apply(history, args);
      };
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return styles;
};

export default HolyLoader;
