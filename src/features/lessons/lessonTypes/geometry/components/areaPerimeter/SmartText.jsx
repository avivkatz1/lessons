import React, { useEffect } from 'react';
import { Text } from 'react-konva';

/**
 * SmartText Component
 * Renders text with intelligent positioning to avoid collisions
 * Used for shape labels (A, B, area values, etc.)
 *
 * @param {object} calculator - SmartPositionCalculator instance
 * @param {object} shapeBounds - Shape bounding box { x, y, width, height }
 * @param {string} label - Text to display
 * @param {number} fontSize - Font size (default: 16)
 * @param {string} fontStyle - Font style (default: 'normal')
 * @param {string} fontFamily - Font family (default: 'Arial')
 * @param {string} fill - Text color
 * @param {object} registry - BoundingBoxRegistry instance
 * @param {string} id - Unique identifier for collision tracking
 * @param {number} x - Override X position (disables smart positioning)
 * @param {number} y - Override Y position (disables smart positioning)
 * @param {string} preferredPosition - 'above', 'below', 'inside', 'left', 'right' (default: 'inside')
 * @param {object} textProps - Additional Text component props
 */
function SmartText({
  calculator,
  shapeBounds,
  label,
  fontSize = 16,
  fontStyle = 'normal',
  fontFamily = 'Arial',
  fill = '#000000',
  registry,
  id,
  x = null,
  y = null,
  preferredPosition = 'inside',
  ...textProps
}) {
  let textX, textY, bounds;

  if (x !== null && y !== null) {
    // Manual positioning - smart positioning disabled
    textX = x;
    textY = y;
  } else if (calculator && shapeBounds && registry && id) {
    // Smart positioning enabled
    const position = calculator.calculateShapeLabelPosition({
      shapeBounds,
      label,
      fontSize,
      fontStyle,
      fontFamily,
      id,
      preferredPosition
    });

    textX = position.x;
    textY = position.y;
    bounds = position.bounds;
  } else {
    // Fallback to center of shape bounds
    console.warn('[SmartText] Missing required props for smart positioning. Using fallback.');
    textX = shapeBounds ? shapeBounds.x + shapeBounds.width / 2 - (label.length * fontSize / 4) : 0;
    textY = shapeBounds ? shapeBounds.y + shapeBounds.height / 2 - fontSize / 2 : 0;
  }

  // Register the text's bounding box (hook must be called unconditionally)
  useEffect(() => {
    if (calculator && shapeBounds && registry && id && bounds) {
      registry.register(id, bounds, 'text', 6);
      return () => {
        registry.unregister(id);
      };
    }
  }, [registry, id, bounds, calculator, shapeBounds]);

  return (
    <Text
      x={textX}
      y={textY}
      text={label}
      fontSize={fontSize}
      fontStyle={fontStyle}
      fontFamily={fontFamily}
      fill={fill}
      listening={false}
      {...textProps}
    />
  );
}

export default SmartText;
