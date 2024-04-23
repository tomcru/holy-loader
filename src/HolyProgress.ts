import { DEFAULTS } from './constants';

type HolyProgressProps = {
  /**
   * Specifies the minimum value for the progress bar to start at.
   * Default: 0.08 (8% of the total width)
   */
  initialPosition: number;

  /**
   * Specifies the CSS easing type for the progress bar animation.
   * Default: 'linear'
   */
  easing: string;

  /**
   * Specifies the speed of the progress bar animation in milliseconds.
   * Default: 200
   */
  speed: number;

  /**
   * Specifies the color of the progress bar.
   * Default: '#59a2ff'
   */
  color: string;

  /**
   * Specifies the height of the progress bar in either pixels (number) or css unit (string).
   * Default: 4
   */
  height: number | string;

  /**
   * Specifies the z-index of the progress bar.
   * Default: 2147483647
   */
  zIndex: number;

  /**
   * Specifies the shadow effect to be applied to the progress bar.
   * For example: "0 0 10px #59a2ff, 0 0 5px #59a2ff"
   */
  boxShadow?: string;

  /**
   * Specifies whether to accompany the loading bar with a spinner.
   * Default: false
   */
  showSpinner?: boolean;
};

type TransformStrategy = 'translate3d' | 'translate' | 'margin';

/**
 * Class representing a HolyProgress bar.
 * @class
 * @classdesc A flexible, customizable progress bar for web applications.
 */
export class HolyProgress {
  private readonly settings: HolyProgressProps;

  private status: number | null;

  private bar: HTMLElement | null;

  /**
   * Create a HolyProgress instance.
   * @param {Partial<HolyProgressProps>} [customSettings] - Optional custom settings to override defaults.
   */
  constructor(customSettings?: Partial<HolyProgressProps>) {
    const defaultSettings: HolyProgressProps = {
      initialPosition: DEFAULTS.initialPosition,
      easing: DEFAULTS.easing,
      speed: DEFAULTS.speed,
      color: DEFAULTS.color,
      height: DEFAULTS.height,
      zIndex: DEFAULTS.zIndex,
      boxShadow: DEFAULTS.boxShadow,
      showSpinner: DEFAULTS.showSpinner,
    };

    this.settings = { ...defaultSettings, ...customSettings };
    this.status = null;
    this.bar = null;
  }

  /**
   * Sets the progress to a specific value.
   * @private
   * @param {number} n - The new progress value (0 to 1).
   * @returns {HolyProgress} The current instance for chaining methods.
   */
  private readonly setTo = (n: number): HolyProgress => {
    const isStarted = typeof this.status === 'number';

    n = this.clamp(n, this.settings.initialPosition, 1);

    this.status = n === 1 ? null : n;

    const progress = this.getOrCreateBar(!isStarted);

    if (progress === null) {
      return this;
    }

    const speed = this.settings.speed;

    this.repaint(progress);

    this.queue((next) => {
      const css = this.barPositionCSS(n);

      if (this.bar === null) {
        return;
      }

      Object.assign(this.bar.style, css, {
        transition: `all ${speed}ms ${this.settings.easing}`,
      });

      if (n === 1) {
        progress.style.transition = 'none';
        progress.style.opacity = '1';
        this.repaint(progress);

        setTimeout(() => {
          progress.style.transition = 'all ' + speed + 'ms linear';
          progress.style.opacity = '0';
          setTimeout(() => {
            this.removeBar();
            next();
          }, speed);

          this.removeSpinner();
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });
    return this;
  };

  /**
   * Clamps a number within the inclusive range specified by the given minimum and maximum.
   * @private
   * @param {number} n - The number to clamp.
   * @param {number} min - The lower boundary of the output range.
   * @param {number} max - The upper boundary of the output range.
   * @returns {number} The clamped value.
   */
  private readonly clamp = (n: number, min: number, max: number): number => {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  };

  /**
   * Triggers a repaint on the specified HTML element.
   * This function is used to ensure that CSS transitions are properly triggered.
   * @private
   * @param {HTMLElement} obj - The HTML element to repaint.
   * @returns {HTMLElement} The same HTML element, for chaining.
   */
  private readonly repaint = (obj: HTMLElement): HTMLElement => {
    void obj.offsetWidth;
    return obj;
  };

  /**
   * Converts a progress value (0 to 1) into a percentage representation.
   * Used for calculating the visual width of the progress bar.
   * @private
   * @param {number} n - The progress value to convert.
   * @returns {number} The percentage representation of the progress value.
   */
  private readonly toBarPercentage = (n: number): number => {
    return (-1 + n) * 100;
  };

  /**
   * Initiates the progress bar's movement. If already started, it continues from the current position.
   * Automatically handles automatic incrementation ('trickle') if enabled.
   * @public
   * @returns {HolyProgress} The current instance for chaining methods.
   */
  public readonly start = (): HolyProgress => {
    if (this.status === null) {
      this.setTo(0);

      this.startTrickle();

      if (this.settings.showSpinner === true) {
        this.createSpinner();
      }
    }

    return this;
  };

  /**
   * Performs automatic incrementation of the progress bar.
   * This function is recursive and continues to increment the progress at intervals defined by `speed`.
   * @private
   */
  private readonly startTrickle = (): void => {
    const run = (): void => {
      if (this.status === null) return;

      this.increment();
      setTimeout(run, this.settings.speed);
    };

    setTimeout(run, this.settings.speed);
  };

  /**
   * Completes the progress, moving it to 100%
   * @public
   * @returns {HolyProgress} The current instance for chaining methods.
   */
  public readonly complete = (): HolyProgress => this.setTo(1);

  /**
   * Calculates an increment value based on the current status of the progress.
   * This is used to determine the amount of progress to add during automatic incrementation.
   * @private
   * @param {number} status - The current progress status.
   * @returns {number} The calculated increment value.
   */
  private readonly calculateIncrement = (status: number): number => {
    const base = 0.1;
    const scale = 5;
    return base * Math.exp(-scale * status);
  };

  /**
   * Increments the progress bar by a specified amount, or by an amount determined by `calculateIncrement` if not specified.
   * @private
   * @param {number} [amount] - The amount to increment the progress bar.
   * @returns {HolyProgress} The current instance for chaining methods.
   */
  private readonly increment = (amount?: number): HolyProgress => {
    if (this.status === null) {
      return this.start();
    }

    if (this.status > 1) {
      return this;
    }

    if (typeof amount !== 'number') {
      amount = this.calculateIncrement(this.status);
    }

    this.status = this.clamp(this.status + amount, 0, 0.994);

    return this.setTo(this.status);
  };

  /**
   * A function to manage the queue of operations to be performed on the progress bar.
   * It ensures that operations are executed in sequence.
   * @private
   * @returns {Function} A function that accepts a callback to be queued.
   */
  private readonly queue = (() => {
    const pending: Array<(next: () => void) => void> = [];

    const next = (): void => {
      const fn = pending.shift();
      if (fn !== undefined) {
        fn(next);
      }
    };

    return (fn: (next: () => void) => void) => {
      pending.push(fn);
      if (pending.length === 1) next();
    };
  })();

  /**
   * Creates and initializes a new progress bar element in the DOM.
   * It sets up the necessary styles and appends the element to the document body.
   * @private
   * @param {boolean} fromStart - Indicates if the bar is created from the start position.
   * @returns {HTMLElement | null} The created progress bar element, or null if creation fails.
   */
  private readonly createBar = (fromStart: boolean): HTMLElement | null => {
    const progress = document.createElement('div');
    progress.id = 'holy-progress';
    progress.style.pointerEvents = 'none';
    progress.innerHTML = '<div class="bar" role="bar"></div>';

    const bar = progress.querySelector('[role="bar"]');

    if (bar === null) {
      return null;
    }

    this.bar = bar as HTMLElement;

    const percentage = fromStart
      ? '-100'
      : this.toBarPercentage(this.status ?? 0);

    this.bar.style.background = this.settings.color;
    if (typeof this.settings.height === 'number') {
      this.bar.style.height = this.settings.height + 'px';
    } else {
      this.bar.style.height = this.settings.height;
    }
    this.bar.style.zIndex = this.settings.zIndex.toString();
    this.bar.style.position = 'fixed';
    this.bar.style.width = '100%';
    this.bar.style.top = '0';
    this.bar.style.left = '0';
    this.bar.style.transition = 'all 0 linear';
    this.bar.style.transform = 'translate3d(' + percentage + '%,0,0)';
    this.bar.style.boxShadow = this.settings.boxShadow ?? '';

    document.body.appendChild(progress);

    return progress;
  };

  /**
   * Creates and initializes a new spinner element in the DOM.
   * It sets up the necessary styles and appends the element to the document body.
   * @private
   * @returns {void}
   */
  private readonly createSpinner = (): void => {
    /** only createSpinner if it doesn't exist */
    if (document.getElementById('holy-progress-spinner') !== null) {
      return;
    }

    const spinner = document.createElement('div');
    spinner.id = 'holy-progress-spinner';
    spinner.style.pointerEvents = 'none';

    spinner.style.display = 'block';
    spinner.style.position = 'fixed';
    spinner.style.zIndex = this.settings.zIndex.toString();
    spinner.style.top = '15px';
    spinner.style.right = '15px';

    spinner.style.width = '18px';
    spinner.style.height = '18px';
    spinner.style.boxSizing = 'border-box';

    spinner.style.border = 'solid 2px transparent';
    spinner.style.borderTopColor = this.settings.color;
    spinner.style.borderLeftColor = this.settings.color;
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'holy-progress-spinner 400ms linear infinite';

    const keyframes = `
      @keyframes holy-progress-spinner {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = keyframes;
    spinner.appendChild(style);

    document.body.appendChild(spinner);
  };

  /**
   * Retrieves the existing progress bar element from the DOM, or creates a new one if not present.
   * @private
   * @param {boolean} fromStart - Indicates if the bar should be retrieved/created from the start position.
   * @returns {HTMLElement | null} The retrieved or newly created progress bar element.
   */
  private readonly getOrCreateBar = (
    fromStart: boolean,
  ): HTMLElement | null => {
    const bar = document.getElementById('holy-progress');
    if (bar !== null) {
      return bar;
    }

    return this.createBar(fromStart);
  };

  /**
   * Removes the progress bar element from the DOM.
   * @private
   * @returns {void}
   */
  private readonly removeBar = (): void => {
    const bar = document.getElementById('holy-progress');
    bar !== null && bar.remove();
  };

  /**
   * Removes the spinner element from the DOM.
   * @private
   * @returns {void}
   */
  private readonly removeSpinner = (): void => {
    const spinner = document.getElementById('holy-progress-spinner');
    spinner !== null && spinner.remove();
  };

  /**
   * Determines the most suitable CSS positioning strategy based on browser capabilities.
   * Checks for transform properties with vendor prefixes and standard un-prefixed properties.
   * @private
   * @returns {TransformStrategy} - The optimal CSS positioning strategy ('translate3d', 'translate', or 'margin').
   */
  private readonly getTransformStrategy = (): TransformStrategy => {
    const style = document.body.style;
    const prefixes = ['Webkit', 'Moz', 'ms', 'O', ''];
    let transformProp = '';

    for (let i = 0; i < prefixes.length; i++) {
      if (`${prefixes[i]}Transform` in style) {
        transformProp = prefixes[i];
        break;
      }
    }

    if (transformProp !== '' && `${transformProp}Perspective` in style) {
      return 'translate3d';
    } else if (transformProp !== '') {
      return 'translate';
    } else {
      return 'margin';
    }
  };

  /**
   * Generates the CSS for the progress bar position based on the detected positioning strategy.
   * Dynamically sets the transform or margin-left properties for the bar's position.
   * @private
   * @param {number} n - Position value of the bar, as a number between 0 and 1.
   * @returns {Object} - CSS styles for the progress bar.
   */
  private readonly barPositionCSS = (n: number): Record<string, string> => {
    const transformStrategy = this.getTransformStrategy();
    const barPosition = this.toBarPercentage(n) + '%';

    if (transformStrategy === 'translate3d') {
      return { transform: `translate3d(${barPosition},0,0)` };
    }
    if (transformStrategy === 'translate') {
      return { transform: `translate(${barPosition},0)` };
    }
    return { marginLeft: barPosition };
  };
}
