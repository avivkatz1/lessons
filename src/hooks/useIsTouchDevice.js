import { useState, useEffect } from 'react';

/**
 * Detects whether the current device supports touch input.
 * Used to conditionally render MathKeypad (instead of native keyboard)
 * and TouchDragHandle affordances (instead of tiny circle points).
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    const check = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(check);
  }, []);

  return { isTouchDevice };
}
