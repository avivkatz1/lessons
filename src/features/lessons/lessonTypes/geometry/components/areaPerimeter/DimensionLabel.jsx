import React, { useEffect, useMemo } from 'react';
import { Group, Line, Text, Arrow } from 'react-konva';

/**
 * DimensionLabel Component
 * Renders dimension annotations with measurement lines and labels
 * Uses technical drawing convention: dimension line breaks around text
 *
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {string} label - Dimension text (e.g., "5 cm")
 * @param {string} orientation - 'horizontal' or 'vertical' (default: auto-detect)
 * @param {number} offset - Distance from shape edge (default: 15)
 * @param {object} konvaTheme - Theme colors from useKonvaTheme()
 * @param {number} fontSize - Label font size (default: 14)
 * @param {object} registry - Optional BoundingBoxRegistry for collision detection
 * @param {object} calculator - Optional SmartPositionCalculator for smart positioning
 * @param {boolean} enableSmartPositioning - Enable smart positioning system (default: false)
 * @param {string} id - Unique identifier (required when enableSmartPositioning is true)
 * @param {string} fontStyle - Font style (default: 'bold')
 * @param {string} fontFamily - Font family (default: 'Arial')
 * @param {string} color - Optional color override (default: konvaTheme.labelText)
 */
function DimensionLabel({
  x1,
  y1,
  x2,
  y2,
  label,
  orientation,
  offset = 15,
  konvaTheme,
  fontSize = 14,
  registry = null,
  calculator = null,
  enableSmartPositioning = false,
  id = null,
  fontStyle = 'bold',
  fontFamily = 'Arial',
  color = null,
}) {
  // Use custom color if provided, otherwise use theme
  const lineColor = color || konvaTheme.labelText || '#4B5563';
  // Auto-detect orientation if not specified
  const isHorizontal = orientation === 'horizontal' || (orientation !== 'vertical' && Math.abs(y2 - y1) < Math.abs(x2 - x1));

  // Calculate dimension line angle (for text rotation)
  const lineAngle = useMemo(() => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  }, [x1, y1, x2, y2]);

  // Calculate dimension line position (perpendicular offset from shape edge)
  const dimensionLineOffset = isHorizontal ? offset - 5 : -(offset - 5);

  // Dimension line coordinates
  const { lineX1, lineY1, lineX2, lineY2 } = useMemo(() => {
    if (isHorizontal) {
      return {
        lineX1: x1,
        lineY1: y1 + dimensionLineOffset,
        lineX2: x2,
        lineY2: y1 + dimensionLineOffset
      };
    } else {
      return {
        lineX1: x1 + dimensionLineOffset,
        lineY1: y1,
        lineX2: x1 + dimensionLineOffset,
        lineY2: y2
      };
    }
  }, [x1, y1, x2, y2, isHorizontal, dimensionLineOffset]);

  // Calculate text dimensions using actual measurement
  const textBounds = useMemo(() => {
    if (!calculator || !enableSmartPositioning) {
      // Fallback estimation
      const estimatedWidth = label.length * fontSize * 0.6;
      const estimatedHeight = fontSize * 1.2;
      return { width: estimatedWidth, height: estimatedHeight };
    }

    // Use calculator's text measurer for accurate dimensions
    const measured = calculator.textMeasurer.measureText(label, { fontSize, fontStyle, fontFamily });
    return { width: measured.width + 10, height: measured.height + 6 }; // Add padding
  }, [calculator, enableSmartPositioning, label, fontSize, fontStyle, fontFamily]);

  // Calculate label position (centered on dimension line)
  const { labelX, labelY, labelBounds, needsLeader } = useMemo(() => {
    const midX = (lineX1 + lineX2) / 2;
    const midY = (lineY1 + lineY2) / 2;

    // For rotated text, position is the center point (we'll use offset for centering)
    const defaultX = midX;
    const defaultY = midY;

    // Create bounding box for collision detection (accounts for rotation)
    // Use conservative bounds (maximum extent)
    const maxDimension = Math.max(textBounds.width, textBounds.height);
    const bounds = {
      x: defaultX - maxDimension / 2,
      y: defaultY - maxDimension / 2,
      width: maxDimension,
      height: maxDimension
    };

    // If smart positioning enabled, check for collisions
    if (enableSmartPositioning && registry && calculator && id) {
      const isValid = registry.isPositionValid(bounds, id);

      if (!isValid) {
        // Only use leader line as last resort with very short arrow
        const perpDist = 10; // Very short distance for leader line (minimal offset)

        // Calculate perpendicular direction (away from shape)
        const dx = lineX2 - lineX1;
        const dy = lineY2 - lineY1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / len;
        const perpY = dx / len;

        // Try minimal offset positions (very close to dimension line)
        const positions = [
          { x: midX + perpX * perpDist, y: midY + perpY * perpDist, side: 1 },
          { x: midX - perpX * perpDist, y: midY - perpY * perpDist, side: -1 }
        ];

        for (const pos of positions) {
          const testBounds = {
            x: pos.x - maxDimension / 2,
            y: pos.y - maxDimension / 2,
            width: maxDimension,
            height: maxDimension
          };
          if (registry.isPositionValid(testBounds, id)) {
            return {
              labelX: pos.x,
              labelY: pos.y,
              labelBounds: testBounds,
              needsLeader: true,
              leaderStart: { x: pos.x, y: pos.y },
              leaderEnd: { x: midX, y: midY }
            };
          }
        }

        // Fallback: use default position even with collision
        console.warn(`[DimensionLabel] No collision-free position for "${label}". Using on-line position.`);
      }
    }

    return { labelX: defaultX, labelY: defaultY, labelBounds: bounds, needsLeader: false };
  }, [lineX1, lineY1, lineX2, lineY2, textBounds, enableSmartPositioning, registry, calculator, id, label]);

  // Register the label's bounding box
  useEffect(() => {
    if (enableSmartPositioning && registry && id && labelBounds) {
      registry.register(id, labelBounds, 'text', 7);
      return () => {
        registry.unregister(id);
      };
    }
  }, [enableSmartPositioning, registry, id, labelBounds]);

  // Calculate dimension line segments (break around text)
  const lineSegments = useMemo(() => {
    const gapSize = Math.max(textBounds.width, textBounds.height) / 2 + 5; // Half of max dimension + padding

    // Calculate positions along the dimension line where text sits
    const midX = (lineX1 + lineX2) / 2;
    const midY = (lineY1 + lineY2) / 2;
    const lineLength = Math.sqrt((lineX2 - lineX1) ** 2 + (lineY2 - lineY1) ** 2);
    const dx = (lineX2 - lineX1) / lineLength;
    const dy = (lineY2 - lineY1) / lineLength;

    // Gap start and end points along the line
    const gapStart = {
      x: midX - dx * gapSize,
      y: midY - dy * gapSize
    };
    const gapEnd = {
      x: midX + dx * gapSize,
      y: midY + dy * gapSize
    };

    return {
      segment1: { x1: lineX1, y1: lineY1, x2: gapStart.x, y2: gapStart.y },
      segment2: { x1: gapEnd.x, y1: gapEnd.y, x2: lineX2, y2: lineY2 }
    };
  }, [lineX1, lineY1, lineX2, lineY2, textBounds]);

  return (
    <Group>
      {/* Dimension line - Segment 1 (before text) */}
      <Line
        points={[lineSegments.segment1.x1, lineSegments.segment1.y1, lineSegments.segment1.x2, lineSegments.segment1.y2]}
        stroke={lineColor}
        strokeWidth={1.5}
        dash={[5, 3]}
        listening={false}
      />

      {/* Dimension line - Segment 2 (after text) */}
      <Line
        points={[lineSegments.segment2.x1, lineSegments.segment2.y1, lineSegments.segment2.x2, lineSegments.segment2.y2]}
        stroke={lineColor}
        strokeWidth={1.5}
        dash={[5, 3]}
        listening={false}
      />

      {/* End markers (small perpendicular lines) */}
      {isHorizontal ? (
        <>
          <Line
            points={[x1, lineY1 - 3, x1, lineY1 + 3]}
            stroke={lineColor}
            strokeWidth={2}
            listening={false}
          />
          <Line
            points={[x2, lineY2 - 3, x2, lineY2 + 3]}
            stroke={lineColor}
            strokeWidth={2}
            listening={false}
          />
        </>
      ) : (
        <>
          <Line
            points={[lineX1 - 3, y1, lineX1 + 3, y1]}
            stroke={lineColor}
            strokeWidth={2}
            listening={false}
          />
          <Line
            points={[lineX2 - 3, y2, lineX2 + 3, y2]}
            stroke={lineColor}
            strokeWidth={2}
            listening={false}
          />
        </>
      )}

      {/* Leader line (if text was moved away from dimension line) - very short arrow */}
      {needsLeader && (
        <Arrow
          points={[labelX, labelY, (lineX1 + lineX2) / 2, (lineY1 + lineY2) / 2]}
          stroke={lineColor}
          strokeWidth={0.75}
          fill={lineColor}
          pointerLength={3}
          pointerWidth={3}
          listening={false}
        />
      )}

      {/* Label text - rotated to align with dimension line */}
      <Text
        x={labelX}
        y={labelY}
        text={label}
        fontSize={fontSize}
        fontStyle={fontStyle}
        fontFamily={fontFamily}
        fill={lineColor}
        rotation={lineAngle}
        offsetX={textBounds.width / 2}
        offsetY={textBounds.height / 2}
        listening={false}
      />
    </Group>
  );
}

export default DimensionLabel;
