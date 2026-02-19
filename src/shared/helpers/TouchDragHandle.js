import React from "react";
import { Circle, Group } from "react-konva";
import { useIsTouchDevice } from "../../hooks";

/**
 * TouchDragHandle — A Konva draggable circle with an enlarged invisible
 * hit area for touch devices. On desktop, renders identically to a plain Circle.
 *
 * On touch devices:
 *   - Invisible 22px-radius circle provides a finger-friendly tap target
 *   - Dashed affordance ring shows the draggable area
 *   - Visual circle stays at original size (clean look)
 *
 * Props:
 *   x, y          — position
 *   radius        — visual circle radius (default 4)
 *   hitRadius     — invisible hit area radius (default 22)
 *   fill, stroke  — visual circle colors
 *   strokeWidth   — visual circle stroke width
 *   opacity       — visual circle opacity
 *   draggable     — whether the handle is draggable (default true)
 *   onDragMove    — drag move handler
 *   onDragEnd     — drag end handler
 *   onDragStart   — drag start handler
 *   id            — passed through for identification in handlers
 *   showAffordance — override: force show/hide affordance ring
 *   affordanceColor — color of the dashed ring (default: same as fill)
 *   dragBoundFunc — Konva dragBoundFunc for constraining drag position
 */
const TouchDragHandle = ({
  x,
  y,
  radius = 4,
  hitRadius = 22,
  fill = "black",
  stroke = "black",
  strokeWidth = 1,
  opacity = 1,
  draggable = true,
  onDragMove,
  onDragEnd,
  onDragStart,
  id,
  showAffordance,
  affordanceColor,
  dragBoundFunc,
}) => {
  const { isTouchDevice } = useIsTouchDevice();
  const shouldShowAffordance = showAffordance !== undefined ? showAffordance : isTouchDevice;

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      id={id !== undefined ? String(id) : undefined}
      dragBoundFunc={dragBoundFunc}
    >
      {/* Invisible hit area — only on touch devices */}
      {isTouchDevice && (
        <Circle
          radius={hitRadius}
          fill="transparent"
          hitStrokeWidth={0}
        />
      )}

      {/* Affordance ring — dashed circle showing draggable area */}
      {shouldShowAffordance && (
        <Circle
          radius={hitRadius * 0.7}
          stroke={affordanceColor || fill}
          strokeWidth={1.5}
          opacity={0.25}
          dash={[4, 4]}
          listening={false}
        />
      )}

      {/* Visual circle — the actual visible point */}
      <Circle
        radius={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    </Group>
  );
};

export default TouchDragHandle;
