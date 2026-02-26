import React from 'react';
import { Group, Circle, Line } from 'react-konva';

/**
 * TouchDragHandle Component
 * A touch-friendly drag handle for resizing shapes
 * Adapted from ZoomFactorLesson.jsx pattern
 *
 * @param {number} x - X position of handle
 * @param {number} y - Y position of handle
 * @param {function} onDragMove - Callback when handle is dragged
 * @param {function} onDragEnd - Callback when drag ends
 * @param {function} dragBoundFunc - Function to constrain drag position (for snapping)
 * @param {object} konvaTheme - Theme colors from useKonvaTheme()
 * @param {number} radius - Handle radius (default: 8, min 22 for touch)
 * @param {boolean} draggable - Whether handle is draggable (default: true)
 */
function TouchDragHandle({
  x,
  y,
  onDragMove,
  onDragEnd,
  dragBoundFunc,
  konvaTheme,
  radius = 8,
  draggable = true,
}) {
  // Ensure minimum touch target of 44px (22px radius)
  const touchRadius = Math.max(radius, 22);

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      dragBoundFunc={dragBoundFunc}
    >
      {/* Invisible larger hit area for touch */}
      <Circle
        radius={touchRadius}
        fill="transparent"
      />

      {/* Visible handle */}
      <Circle
        radius={radius}
        fill={konvaTheme.canvasBackground || '#FFFFFF'}
        stroke={konvaTheme.shapeStroke || '#3B82F6'}
        strokeWidth={2}
        listening={false}
      />

      {/* Visual indicator (crosshair) */}
      <Line
        points={[-radius + 2, 0, radius - 2, 0]}
        stroke={konvaTheme.shapeStroke || '#3B82F6'}
        strokeWidth={1.5}
        listening={false}
      />
      <Line
        points={[0, -radius + 2, 0, radius - 2]}
        stroke={konvaTheme.shapeStroke || '#3B82F6'}
        strokeWidth={1.5}
        listening={false}
      />
    </Group>
  );
}

export default TouchDragHandle;
