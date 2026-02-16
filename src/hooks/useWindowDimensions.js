import { useState, useEffect } from 'react';

/**
 * Custom hook to safely access window dimensions with SSR support
 *
 * @returns {{ width: number, height: number }} Current window dimensions
 *
 * @example
 * const { width, height } = useWindowDimensions();
 * <Stage width={width} height={height} />
 */
export const useWindowDimensions = () => {
  // SSR-safe initialization: Use window dimensions if available, fallback to 800x600
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });

  useEffect(() => {
    // Skip effect if window is not available (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array - only set up listener once

  return windowDimensions;
};
