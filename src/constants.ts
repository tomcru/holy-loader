export const DEFAULTS = {
  color: '#59a2ff',
  initialPosition: 0.08,
  height: 4,
  easing: 'ease',
  speed: 200,
  zIndex: 2147483647,
  showSpinner: false,
  boxShadow: undefined,
  ignoreSearchParams: false,
  dir: 'ltr',
} as const;

export const START_HOLY_EVENT = 'holy-progress-start';
export const STOP_HOLY_EVENT = 'holy-progress-stop';
