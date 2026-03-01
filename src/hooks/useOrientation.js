import { useState, useEffect } from 'react';

/**
 * Detects device orientation based on viewport dimensions
 *
 * Approach: Width/height ratio (most reliable)
 * - landscape: width > height
 * - portrait: height >= width
 *
 * @returns {{
 *   orientation: 'portrait' | 'landscape',
 *   isPortrait: boolean,
 *   isLandscape: boolean,
 *   width: number,
 *   height: number,
 *   aspectRatio: number,
 *   deviceType: 'mobile' | 'tablet' | 'desktop'
 * }}
 *
 * @example
 * const { isPortrait, isLandscape, orientation } = useOrientation();
 *
 * // Log for analytics
 * useEffect(() => {
 *   console.log('Orientation:', orientation);
 * }, [orientation]);
 */
export function useOrientation() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return {
        orientation: 'portrait',
        isPortrait: true,
        isLandscape: false,
        width: 810,
        height: 1080,
        aspectRatio: 0.75,
        deviceType: 'tablet'
      };
    }

    return calculateOrientation(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const handleResize = () => {
      setState(calculateOrientation(window.innerWidth, window.innerHeight));
    };

    // Listen to both resize and orientationchange
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}

function calculateOrientation(width, height) {
  const orientation = width > height ? 'landscape' : 'portrait';
  const aspectRatio = width / height;

  // Device type classification
  const maxDimension = Math.max(width, height);
  let deviceType = 'desktop';
  if (maxDimension <= 768) deviceType = 'mobile';
  else if (maxDimension <= 1366) deviceType = 'tablet'; // Includes iPad Pro 12.9"

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    width,
    height,
    aspectRatio,
    deviceType,
  };
}
