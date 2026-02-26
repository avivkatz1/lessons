/**
 * useSmartPositioning Hook
 *
 * React hook for integrating the smart positioning system into geometry components.
 * Provides registry and calculator instances with automatic cleanup.
 *
 * Usage:
 * ```jsx
 * function MyLevel({ visualData }) {
 *   const { width, height } = useWindowDimensions();
 *   const { registry, calculator, textMeasurer } = useSmartPositioning(width, height);
 *
 *   // Register shapes
 *   useEffect(() => {
 *     registerShape(registry, 'rect1', { x, y, width, height }, 'shape', 10);
 *   }, [registry, x, y, width, height]);
 *
 *   return (
 *     <Stage width={width} height={height}>
 *       <Layer>
 *         <DimensionLabel
 *           x1={x1} y1={y1} x2={x2} y2={y2}
 *           label="10 cm"
 *           registry={registry}
 *           enableSmartPositioning={true}
 *           id="width-label"
 *         />
 *       </Layer>
 *     </Stage>
 *   );
 * }
 * ```
 */

import { useMemo, useEffect } from 'react';
import {
  TextMeasurer,
  BoundingBoxRegistry,
  SmartPositionCalculator
} from '../utils/smartPositioning';

/**
 * Hook for smart positioning system
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {number} cellSize - Spatial grid cell size (default: 50)
 * @returns {object} - { registry, calculator, textMeasurer }
 */
export function useSmartPositioning(canvasWidth, canvasHeight, cellSize = 50) {
  // Create instances (memoized to prevent recreation on every render)
  const instances = useMemo(() => {
    const textMeasurer = new TextMeasurer();
    const registry = new BoundingBoxRegistry(canvasWidth, canvasHeight, cellSize);
    const calculator = new SmartPositionCalculator(registry, textMeasurer);

    return { textMeasurer, registry, calculator };
  }, [canvasWidth, canvasHeight, cellSize]);

  // Clear registry when canvas dimensions change
  useEffect(() => {
    instances.registry.clear();

    // Cleanup on unmount
    return () => {
      instances.registry.clear();
      instances.textMeasurer.destroy();
    };
  }, [instances, canvasWidth, canvasHeight]);

  return instances;
}

export default useSmartPositioning;
