import React from 'react';
import { Group, Rect } from 'react-konva';
import TouchDragHandle from './TouchDragHandle';

/**
 * DraggableRectangle Component
 * Reusable rectangle with corner drag handles for resizing
 *
 * @param {number} width - Rectangle width in grid units
 * @param {number} height - Rectangle height in grid units
 * @param {number} x - X position in pixels
 * @param {number} y - Y position in pixels
 * @param {function} onResize - Callback(newWidth, newHeight) when resized
 * @param {number} gridSize - Grid cell size in pixels (default: 40)
 * @param {number} minWidth - Minimum width in grid units (default: 1)
 * @param {number} maxWidth - Maximum width in grid units (default: 10)
 * @param {number} minHeight - Minimum height in grid units (default: 1)
 * @param {number} maxHeight - Maximum height in grid units (default: 10)
 * @param {boolean} snapToGrid - Whether to snap to grid lines (default: true)
 * @param {boolean} showHandles - Whether to show drag handles (default: true)
 * @param {object} konvaTheme - Theme colors from useKonvaTheme()
 * @param {boolean} isCorrect - Whether current dimensions match target (default: false)
 * @param {string} askingFor - What is being targeted: 'area' or 'perimeter' (default: 'area')
 */
function DraggableRectangle({
  width,
  height,
  x,
  y,
  onResize,
  gridSize = 40,
  minWidth = 1,
  maxWidth = 10,
  minHeight = 1,
  maxHeight = 10,
  snapToGrid = true,
  showHandles = true,
  konvaTheme,
  isCorrect = false,
  askingFor = 'area',
}) {
  // Convert grid units to pixels
  const widthPx = width * gridSize;
  const heightPx = height * gridSize;

  // Compute fill color based on mode and correctness
  const fillColor = (() => {
    if (askingFor === 'area') {
      return isCorrect
        ? 'rgba(34, 197, 94, 0.3)'   // Green
        : 'rgba(249, 115, 22, 0.3)';  // Orange
    }
    // For perimeter mode, use neutral fill
    return 'rgba(59, 130, 246, 0.15)';
  })();

  // Compute stroke color based on mode and correctness
  const strokeColor = (() => {
    if (askingFor === 'perimeter') {
      return isCorrect
        ? '#22C55B'   // Green
        : '#F97316';  // Orange
    }
    // For area mode, use theme-based stroke
    return konvaTheme.shapeStroke || '#3B82F6';
  })();

  // Snap to grid function
  const snapValue = (value) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Constrain value to min/max
  const constrain = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
  };

  // Handle drag for bottom-right corner (resize both width and height)
  const handleBottomRightDrag = (e) => {
    const groupX = e.target.x();
    const groupY = e.target.y();

    const newWidthPx = snapValue(groupX - x);
    const newHeightPx = snapValue(groupY - y);

    const newWidth = constrain(Math.round(newWidthPx / gridSize), minWidth, maxWidth);
    const newHeight = constrain(Math.round(newHeightPx / gridSize), minHeight, maxHeight);

    if (newWidth !== width || newHeight !== height) {
      onResize(newWidth, newHeight);
    }
  };

  // Handle drag for bottom-left corner (resize width from left, height from bottom)
  const handleBottomLeftDrag = (e) => {
    const groupX = e.target.x();
    const groupY = e.target.y();

    const newWidthPx = snapValue((x + widthPx) - groupX);
    const newHeightPx = snapValue(groupY - y);

    const newWidth = constrain(Math.round(newWidthPx / gridSize), minWidth, maxWidth);
    const newHeight = constrain(Math.round(newHeightPx / gridSize), minHeight, maxHeight);

    if (newWidth !== width || newHeight !== height) {
      onResize(newWidth, newHeight);
    }
  };

  // Handle drag for top-right corner (resize width from right, height from top)
  const handleTopRightDrag = (e) => {
    const groupX = e.target.x();
    const groupY = e.target.y();

    const newWidthPx = snapValue(groupX - x);
    const newHeightPx = snapValue((y + heightPx) - groupY);

    const newWidth = constrain(Math.round(newWidthPx / gridSize), minWidth, maxWidth);
    const newHeight = constrain(Math.round(newHeightPx / gridSize), minHeight, maxHeight);

    if (newWidth !== width || newHeight !== height) {
      onResize(newWidth, newHeight);
    }
  };

  // Handle drag for top-left corner (resize both from top-left)
  const handleTopLeftDrag = (e) => {
    const groupX = e.target.x();
    const groupY = e.target.y();

    const newWidthPx = snapValue((x + widthPx) - groupX);
    const newHeightPx = snapValue((y + heightPx) - groupY);

    const newWidth = constrain(Math.round(newWidthPx / gridSize), minWidth, maxWidth);
    const newHeight = constrain(Math.round(newHeightPx / gridSize), minHeight, maxHeight);

    if (newWidth !== width || newHeight !== height) {
      onResize(newWidth, newHeight);
    }
  };

  return (
    <Group>
      {/* Rectangle */}
      <Rect
        x={x}
        y={y}
        width={widthPx}
        height={heightPx}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={3}
        listening={false}
      />

      {/* Drag Handles (4 corners) - positioned at current rectangle corners */}
      {showHandles && (
        <>
          {/* Bottom-Right */}
          <TouchDragHandle
            x={x + width * gridSize}
            y={y + height * gridSize}
            onDragMove={handleBottomRightDrag}
            onDragEnd={handleBottomRightDrag}
            konvaTheme={konvaTheme}
            dragBoundFunc={(pos) => ({
              x: Math.round((pos.x - x) / gridSize) * gridSize + x,
              y: Math.round((pos.y - y) / gridSize) * gridSize + y,
            })}
          />

          {/* Bottom-Left */}
          <TouchDragHandle
            x={x}
            y={y + height * gridSize}
            onDragMove={handleBottomLeftDrag}
            onDragEnd={handleBottomLeftDrag}
            konvaTheme={konvaTheme}
            dragBoundFunc={(pos) => ({
              x: Math.round((pos.x - x) / gridSize) * gridSize + x,
              y: Math.round((pos.y - y) / gridSize) * gridSize + y,
            })}
          />

          {/* Top-Right */}
          <TouchDragHandle
            x={x + width * gridSize}
            y={y}
            onDragMove={handleTopRightDrag}
            onDragEnd={handleTopRightDrag}
            konvaTheme={konvaTheme}
            dragBoundFunc={(pos) => ({
              x: Math.round((pos.x - x) / gridSize) * gridSize + x,
              y: Math.round((pos.y - y) / gridSize) * gridSize + y,
            })}
          />

          {/* Top-Left */}
          <TouchDragHandle
            x={x}
            y={y}
            onDragMove={handleTopLeftDrag}
            onDragEnd={handleTopLeftDrag}
            konvaTheme={konvaTheme}
            dragBoundFunc={(pos) => ({
              x: Math.round((pos.x - x) / gridSize) * gridSize + x,
              y: Math.round((pos.y - y) / gridSize) * gridSize + y,
            })}
          />
        </>
      )}
    </Group>
  );
}

export default DraggableRectangle;
