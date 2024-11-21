import { describe, expect, it, vi } from 'vitest';
import { HolyLoaderProps } from '../index';
import HolyLoader from '../index';

describe('HolyLoader', () => {
  it('should skip loader for replaceState transitions when skipReplaceTransitions is true', () => {
    const props: HolyLoaderProps = {
      skipReplaceTransitions: true,
    };

    const holyLoader = new HolyLoader(props);

    const startSpy = vi.spyOn(holyLoader, 'start');
    const completeSpy = vi.spyOn(holyLoader, 'complete');

    history.replaceState({}, '', '/new-url');
    expect(startSpy).not.toHaveBeenCalled();
    expect(completeSpy).not.toHaveBeenCalled();
  });

  it('should not skip loader for replaceState transitions when skipReplaceTransitions is false', () => {
    const props: HolyLoaderProps = {
      skipReplaceTransitions: false,
    };

    const holyLoader = new HolyLoader(props);

    const startSpy = vi.spyOn(holyLoader, 'start');
    const completeSpy = vi.spyOn(holyLoader, 'complete');

    history.replaceState({}, '', '/new-url');
    expect(startSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
