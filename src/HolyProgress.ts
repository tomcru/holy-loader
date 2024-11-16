import { DEFAULTS } from './constants';
import { clamp, queue, repaintElement } from './utils';

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

  /**
   * Specifies the direction of the loading bar.
   * Default: "ltr"
   */
  dir?: 'ltr' | 'rtl';
};

type TransformStrategy = 'translate3d' | 'translate' | 'margin';

/**
 * Class representing a HolyProgress bar.
 * @class
 * @classdesc A flexible, customizable progress bar for web applications.
 */
export class HolyProgress {
  private readonly settings: HolyProgressProps;

  /**
   * The progres of the bar as a number between 0 and 1.
   * If 0 is reached, the status is null
   */
  private progressN: number | null;

  private bar: HTMLElement | null;

  /**
   * Create a HolyProgress instance.
   * @param {Partial<HolyProgressProps>} [customSettings] - Optional custom settings to override defaults.
   */
  constructor(customSettings?: Partial<HolyProgressProps>) {
    this.settings = { ...DEFAULTS, ...customSettings };
    this.progressN = null;
    this.bar = null;
  }

  /**
   * Sets the progress to a specific value.
   * @private
   * @param {number} n - The new progress value (0 to 1).
   * @returns {HolyProgress} The current instance for chaining methods.
   */
  private readonly setTo = (n: number): HolyProgress => {
    const isStarted = typeof this.progressN === 'number';

    n = clamp(n, this.settings.initialPosition, 1);

    this.progressN = n === 1 ? null : n;

    const progressBar = this.getOrCreateBar(!isStarted);

    if (!progressBar) {
      return this;
    }

    repaintElement(progressBar);

    queue((next) => {
      if (!this.bar) {
        return;
      }

      Object.assign(this.bar.style, this.barPositionCSS(n), {
        transition: `all ${this.settings.speed}ms ${this.settings.easing}`,
      });

      if (n === 1) {
        progressBar.style.transition = 'none';
        progressBar.style.opacity = '1';
        repaintElement(progressBar);

        setTimeout(() => {
          progressBar.style.transition = `all ${this.settings.speed}ms linear`;
          progressBar.style.opacity = '0';
          setTimeout(() => {
            this.removeBarFromDOM();
            this.removeSpinnerFromDOM();
            next();
          }, this.settings.speed);
        }, this.settings.speed);
      } else {
        setTimeout(next, this.settings.speed);
      }
    });
    return this;
  };

  /**
   * Converts a progress value (0 to 1) into a percentage representation.
   * Used for calculating the visual width of the progress bar.
   * @private
   * @param {number} n - The progress value to convert.
   * @returns {number} The percentage representation of the progress value.
   */
  private readonly toBarPercentage = (n: number): number =>
    this.settings.dir === 'ltr' ? (-1 + n) * 100 : (1 - n) * 100;

  /**
   * Initiates the progress bar's movement. If already started, it continues from the current position.
   * Automatically handles automatic incrementation ('trickle') if enabled.
   * @public
   * @returns {HolyProgress} The current instance for chaining methods.
   */
  public readonly start = (): HolyProgress => {
    if (this.progressN === null) {
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
      if (this.progressN === null) return;

      this.incrementStatus();
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
  private readonly incrementStatus = (amount?: number): HolyProgress => {
    if (this.progressN === null) {
      return this.start();
    }

    if (this.progressN > 1) {
      return this;
    }

    if (typeof amount !== 'number') {
      amount = this.calculateIncrement(this.progressN);
    }

    /**
     * Do not clamp to 1 - the progress bar can only fully finish by being set to 1 by the user.
     * This prevents the progress bar completing itself by incrementing to 1 before an action has been completed or a page loaded.
     */
    this.progressN = clamp(this.progressN + amount, 0, 0.994);

    return this.setTo(this.progressN);
  };

  /**
   * Creates and initializes a new progress bar element in the DOM.
   * It sets up the necessary styles and appends the element to the document body.
   * @private
   * @param {boolean} fromStart - Indicates if the bar is created from the start position.
   * @returns {HTMLElement | null} The created progress bar element, or null if creation fails.
   */
  private readonly createBar = (fromStart: boolean): HTMLElement | null => {
    const barContainer = document.createElement('div');
    barContainer.id = 'holy-progress';
    barContainer.style.pointerEvents = 'none';
    barContainer.innerHTML = '<div class="bar" role="bar"></div>';

    this.bar = barContainer.querySelector(
      '[role="bar"]',
    ) satisfies HTMLElement | null;

    if (!this.bar) {
      return null;
    }

    const percentage = this.toBarPercentage(
      fromStart ? 0 : (this.progressN ?? 0),
    );

    this.bar.style.background = this.settings.color;
    if (typeof this.settings.height === 'number') {
      this.bar.style.height = `${this.settings.height}px`;
    } else {
      this.bar.style.height = this.settings.height;
    }
    this.bar.style.zIndex = this.settings.zIndex.toString();
    this.bar.style.position = 'fixed';
    this.bar.style.width = '100%';
    this.bar.style.top = '0';
    this.bar.style.left = '0';
    this.bar.style.transition = 'all 0 linear';
    this.bar.style.transform = `translate3d(${percentage}%,0,0)`;
    this.bar.style.boxShadow = this.settings.boxShadow ?? '';

    document.body.appendChild(barContainer);

    return barContainer;
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

  private readonly getOrCreateBar = (fromStart: boolean): HTMLElement | null =>
    document.getElementById('holy-progress') ?? this.createBar(fromStart);

  private readonly removeBarFromDOM = (): void =>
    document.getElementById('holy-progress')?.remove();

  private readonly removeSpinnerFromDOM = (): void =>
    document.getElementById('holy-progress-spinner')?.remove();

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
    }
    if (transformProp !== '') {
      return 'translate';
    }
    return 'margin';
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
    const barPosition = `${this.toBarPercentage(n)}%`;

    if (transformStrategy === 'translate3d') {
      return { transform: `translate3d(${barPosition},0,0)` };
    }
    if (transformStrategy === 'translate') {
      return { transform: `translate(${barPosition},0)` };
    }
    return { marginLeft: barPosition };
  };
}
