/**
 * Get current window dimensions with SSR safety
 * @returns {{ width: number, height: number }} Window dimensions or fallback
 */
function getCurrentDimensions() {
  if (typeof window === 'undefined') {
    return {
      width: 800,
      height: 600,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export { getCurrentDimensions };
