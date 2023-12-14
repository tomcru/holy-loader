import * as React from 'react';
import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export type HolyProgressHandle = {
  start: () => void;
  stop: () => void;
};

export const useHolyProgress = () => {
  const ref = useRef<HolyProgressHandle>(null);

  // eslint-disable-next-line react/display-name
  const HolyProgress = React.forwardRef<HolyProgressHandle, HolyProgressProps>(
    (props, forwardedRef) => {
      return <HolyProgress ref={forwardedRef || ref} {...props} />;
    },
  );

  return {
    start: () => ref.current?.start(),
    stop: () => ref.current?.stop(),
    HolyProgress,
  };
};

type HolyProgressProps = {
  initialPosition?: number;
  easing?: string;
  speed?: number;
  trickle?: boolean;
  trickleSpeed?: number;
  color?: string;
  height?: number | string;
  zIndex?: number;
  style?: React.CSSProperties;
};

/**
 * A customizable progress bar component that can be rendered anywhere
 */
const HolyProgress = forwardRef<HolyProgressHandle, HolyProgressProps>(
  (
    {
      initialPosition = 0.08,
      easing = 'linear',
      speed = 200,
      trickle = true,
      trickleSpeed = 200,
      color = '#59a2ff',
      height = 4,
      zIndex = 2147483647,
      style = {},
    },
    ref,
  ) => {
    const progressRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();

    /**
     * Sets the progress of the progress bar.
     *
     * @param {number} progress - The new progress value.
     */
    const setProgress = (progress: number) => {
      if (progressRef.current) {
        progressRef.current.style.transform = `translate3d(${
          (-1 + progress) * 100
        }%, 0, 0)`;
      }
    };

    /**
     * Animates the progress bar.
     */
    const animateTrickle = () => {
      if (progressRef.current?.dataset.progress) {
        const currentProgress = parseFloat(
          progressRef.current.dataset.progress,
        );
        const newProgress = Math.min(currentProgress + 0.02, 1);
        progressRef.current.dataset.progress = String(newProgress);
        setProgress(newProgress);

        if (newProgress < 1) {
          requestRef.current = requestAnimationFrame(animateTrickle);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      start: () => {
        if (progressRef.current) {
          progressRef.current.style.transition = '';
          progressRef.current.style.opacity = '1';
          progressRef.current.dataset.progress = '0';
          setProgress(initialPosition);
          progressRef.current.offsetHeight;

          progressRef.current.style.transition = `${speed}ms ${easing}`;
          requestRef.current = requestAnimationFrame(animateTrickle);
        }
      },
      stop: () => {
        if (progressRef.current) {
          progressRef.current.dataset.progress = '1';
          setProgress(1);
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
          setTimeout(() => {
            if (progressRef.current) {
              progressRef.current.style.opacity = '0';
            }
          }, speed);
        }
      },
    }));

    useEffect(() => {
      if (progressRef.current) {
        progressRef.current.dataset.progress = String(initialPosition);
        setProgress(initialPosition);
        requestRef.current = requestAnimationFrame(animateTrickle);
      }

      return () => {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }, []);

    const barStyle = {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      zIndex,
      height,
      width: '100%',
      transition: `${speed}ms ${easing}`,
      opacity: 1,
      backgroundColor: color ?? '#fff',
      ...style,
    };

    return <div ref={progressRef} style={barStyle} />;
  },
);

HolyProgress.displayName = 'HolyProgress';

export default HolyProgress;
