import { useRef, useCallback } from 'react';

/**
 * Detects swipe gestures on a container.
 * Returns { onTouchStart, onTouchEnd } event handlers to spread onto a div.
 *
 * @param {object} options
 * @param {Function} options.onSwipeLeft  - called when user swipes left
 * @param {Function} options.onSwipeRight - called when user swipes right
 * @param {Function} options.onSwipeUp    - called when user swipes up
 * @param {Function} options.onSwipeDown  - called when user swipes down
 * @param {number}   options.threshold    - minimum px distance to count as a swipe (default 50)
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = {}) {
  const startX = useRef(null);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < threshold) return; // too short

    if (absDx > absDy) {
      // Horizontal swipe
      if (dx < 0) onSwipeLeft?.();
      else         onSwipeRight?.();
    } else {
      // Vertical swipe
      if (dy < 0) onSwipeUp?.();
      else         onSwipeDown?.();
    }

    startX.current = null;
    startY.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return { onTouchStart, onTouchEnd };
}

/**
 * Detects long-press on a touch element.
 * Returns { onTouchStart, onTouchEnd, onTouchMove } to spread onto a div.
 *
 * @param {Function} onLongPress - called after `delay` ms of holding
 * @param {number}   delay       - ms before triggering (default 500)
 */
export function useLongPress(onLongPress, delay = 500) {
  const timerRef = useRef(null);
  const movedRef = useRef(false);

  const start = useCallback(() => {
    movedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) onLongPress?.();
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const move = useCallback(() => {
    movedRef.current = true;
    cancel();
  }, [cancel]);

  return {
    onTouchStart: start,
    onTouchEnd:   cancel,
    onTouchMove:  move,
    onMouseDown:  start,
    onMouseUp:    cancel,
    onMouseLeave: cancel,
  };
}
