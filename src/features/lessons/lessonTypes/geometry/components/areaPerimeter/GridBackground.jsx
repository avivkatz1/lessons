import React from 'react';
import { Group, Line, Text } from 'react-konva';

/**
 * GridBackground Component
 * Renders a grid with unit labels for area/perimeter lessons
 *
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {number} gridSize - Number of grid divisions (default: 10)
 * @param {number} cellSize - Size of each cell in pixels (if not provided, calculated from width/gridSize)
 * @param {object} konvaTheme - Theme colors from useKonvaTheme()
 * @param {boolean} showLabels - Whether to show axis labels (default: false)
 */
function GridBackground({ width, height, gridSize = 10, cellSize, konvaTheme, showLabels = false }) {
  const actualCellSize = cellSize || (width / gridSize);
  const horizontalLines = Math.floor(height / actualCellSize) + 1;
  const verticalLines = Math.floor(width / actualCellSize) + 1;
  const lines = [];
  const labels = [];

  // Generate horizontal grid lines
  for (let i = 0; i < horizontalLines; i++) {
    const y = i * actualCellSize;

    lines.push(
      <Line
        key={`h${i}`}
        points={[0, y, width, y]}
        stroke={konvaTheme.gridRegular}
        strokeWidth={1}
        opacity={0.3}
        listening={false}
      />
    );
  }

  // Generate vertical grid lines
  for (let i = 0; i < verticalLines; i++) {
    const x = i * actualCellSize;

    lines.push(
      <Line
        key={`v${i}`}
        points={[x, 0, x, height]}
        stroke={konvaTheme.gridRegular}
        strokeWidth={1}
        opacity={0.3}
        listening={false}
      />
    );

  }

  // Optional axis labels (for coordinate-based grids)
  if (showLabels) {
    for (let i = 1; i < verticalLines - 1; i++) {
      labels.push(
        <Text
          key={`label-x-${i}`}
          x={i * actualCellSize - 4}
          y={height + 5}
          text={i.toString()}
          fontSize={11}
          fill={konvaTheme.labelText}
          listening={false}
        />
      );
    }
    for (let i = 1; i < horizontalLines - 1; i++) {
      labels.push(
        <Text
          key={`label-y-${i}`}
          x={-15}
          y={i * actualCellSize - 6}
          text={i.toString()}
          fontSize={11}
          fill={konvaTheme.labelText}
          listening={false}
        />
      );
    }
  }

  return (
    <Group>
      {lines}
      {showLabels && labels}
    </Group>
  );
}

export default GridBackground;
