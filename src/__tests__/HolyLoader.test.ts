import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import HolyLoader, { startHolyLoader, stopHolyLoader } from '../index';

describe('HolyLoader', () => {
  it('should start the progress bar after the specified delay', () => {
    vi.useFakeTimers();
    const { container } = render(<HolyLoader delay={200} />);
    const anchor = document.createElement('a');
    anchor.href = '/test';
    document.body.appendChild(anchor);

    fireEvent.click(anchor);
    expect(container.querySelector('#holy-progress')).toBeNull();

    vi.advanceTimersByTime(200);
    expect(container.querySelector('#holy-progress')).not.toBeNull();

    vi.useRealTimers();
  });

  it('should not start the progress bar if navigation happens within the delay', () => {
    vi.useFakeTimers();
    const { container } = render(<HolyLoader delay={200} />);
    const anchor = document.createElement('a');
    anchor.href = '/test';
    document.body.appendChild(anchor);

    fireEvent.click(anchor);
    expect(container.querySelector('#holy-progress')).toBeNull();

    fireEvent.click(anchor);
    vi.advanceTimersByTime(200);
    expect(container.querySelector('#holy-progress')).toBeNull();

    vi.useRealTimers();
  });

  it('should start the progress bar immediately if delay is 0', () => {
    const { container } = render(<HolyLoader delay={0} />);
    const anchor = document.createElement('a');
    anchor.href = '/test';
    document.body.appendChild(anchor);

    fireEvent.click(anchor);
    expect(container.querySelector('#holy-progress')).not.toBeNull();
  });

  it('should manually start and stop the progress bar', () => {
    const { container } = render(<HolyLoader delay={0} />);

    startHolyLoader();
    expect(container.querySelector('#holy-progress')).not.toBeNull();

    stopHolyLoader();
    expect(container.querySelector('#holy-progress')).toBeNull();
  });
});
