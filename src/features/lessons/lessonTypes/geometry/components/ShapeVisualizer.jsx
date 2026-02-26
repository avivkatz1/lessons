/**
 * Shape Visualizer Component
 *
 * Renders geometric shapes using Konva with dark mode support
 * Used across all levels for consistent shape rendering
 */

import React from 'react';
import { Rect, Line, Text as KonvaText, Circle } from 'react-konva';
import { useKonvaTheme } from '../../../../../hooks';

const CELL_SIZE = 40;

function ShapeVisualizer({
  visualData,
  canvasWidth,
  canvasHeight,
  showGrid = false,
  showDimensions = false,
  onCellClick = null, // For Level 1 clicking
  clickedCells = null, // For Level 1 state
}) {
  const konvaTheme = useKonvaTheme();

  const {
    shapeType,
    length,
    width,
    side,
    base,
    height: triangleHeight,
    area,
    perimeter,
    unknownDimension,
  } = visualData || {};

  const shapes = [];
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // ==================== RECTANGLE ====================
  if (shapeType === 'rectangle') {
    const rectLength = length || 0;
    const rectWidth = width || 0;
    const pixelWidth = showGrid ? rectLength * CELL_SIZE : Math.min(rectLength * 25, 300);
    const pixelHeight = showGrid ? rectWidth * CELL_SIZE : Math.min(rectWidth * 25, 250);
    const x = centerX - pixelWidth / 2;
    const y = centerY - pixelHeight / 2;

    // Draw grid for Level 1
    if (showGrid) {
      for (let r = 0; r < rectWidth; r++) {
        for (let c = 0; c < rectLength; c++) {
          const cellKey = `${r},${c}`;
          const isClicked = clickedCells && clickedCells.has(cellKey);

          shapes.push(
            <Rect
              key={`cell-${r}-${c}`}
              x={x + c * CELL_SIZE}
              y={y + r * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={isClicked ? '#3B82F6' : konvaTheme.gridRegular}
              opacity={isClicked ? 0.7 : 0.3}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={1}
              onClick={onCellClick ? () => onCellClick(r, c) : undefined}
              onTap={onCellClick ? () => onCellClick(r, c) : undefined}
              hitStrokeWidth={onCellClick ? 20 : 0}
              listening={!!onCellClick}
            />
          );
        }
      }
    } else {
      // Solid rectangle
      shapes.push(
        <Rect
          key="rect"
          x={x}
          y={y}
          width={pixelWidth}
          height={pixelHeight}
          fill="#3B82F6"
          opacity={0.5}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={3}
        />
      );
    }

    // Show dimensions
    if (showDimensions) {
      // Top label (length)
      if (!unknownDimension || unknownDimension !== 'length') {
        shapes.push(
          <KonvaText
            key="length-label"
            x={x}
            y={y - 30}
            width={pixelWidth}
            text={`${rectLength} cm`}
            fontSize={18}
            fill={konvaTheme.labelText || '#F97316'}
            align="center"
            fontStyle="bold"
          />
        );
        // Top dimension line
        shapes.push(
          <Line
            key="length-line"
            points={[x, y - 15, x + pixelWidth, y - 15]}
            stroke={konvaTheme.labelText || '#F97316'}
            strokeWidth={2}
          />,
          <Circle
            key="length-c1"
            x={x}
            y={y - 15}
            radius={4}
            fill={konvaTheme.labelText || '#F97316'}
          />,
          <Circle
            key="length-c2"
            x={x + pixelWidth}
            y={y - 15}
            radius={4}
            fill={konvaTheme.labelText || '#F97316'}
          />
        );
      } else {
        shapes.push(
          <KonvaText
            key="length-unknown"
            x={x}
            y={y - 30}
            width={pixelWidth}
            text="? cm"
            fontSize={18}
            fill="#EF4444"
            align="center"
            fontStyle="bold"
          />
        );
      }

      // Right label (width)
      if (!unknownDimension || unknownDimension !== 'width') {
        shapes.push(
          <KonvaText
            key="width-label"
            x={x + pixelWidth + 15}
            y={y + pixelHeight / 2 - 10}
            text={`${rectWidth} cm`}
            fontSize={18}
            fill={konvaTheme.labelText || '#F97316'}
            fontStyle="bold"
          />
        );
        // Right dimension line
        shapes.push(
          <Line
            key="width-line"
            points={[x + pixelWidth + 10, y, x + pixelWidth + 10, y + pixelHeight]}
            stroke={konvaTheme.labelText || '#F97316'}
            strokeWidth={2}
          />,
          <Circle
            key="width-c1"
            x={x + pixelWidth + 10}
            y={y}
            radius={4}
            fill={konvaTheme.labelText || '#F97316'}
          />,
          <Circle
            key="width-c2"
            x={x + pixelWidth + 10}
            y={y + pixelHeight}
            radius={4}
            fill={konvaTheme.labelText || '#F97316'}
          />
        );
      } else {
        shapes.push(
          <KonvaText
            key="width-unknown"
            x={x + pixelWidth + 15}
            y={y + pixelHeight / 2 - 10}
            text="? cm"
            fontSize={18}
            fill="#EF4444"
            fontStyle="bold"
          />
        );
      }
    }

    // Show area label if given (Level 3)
    if (unknownDimension && area) {
      shapes.push(
        <KonvaText
          key="area-label"
          x={x}
          y={y + pixelHeight / 2 - 12}
          width={pixelWidth}
          text={`Area = ${area} cm²`}
          fontSize={16}
          fill="#FFFFFF"
          align="center"
          fontStyle="bold"
        />
      );
    }
  }

  // ==================== SQUARE ====================
  if (shapeType === 'square') {
    const pixelSide = showGrid ? side * CELL_SIZE : Math.min(side * 25, 300);
    const x = centerX - pixelSide / 2;
    const y = centerY - pixelSide / 2;

    // Draw grid for Level 1
    if (showGrid) {
      for (let r = 0; r < side; r++) {
        for (let c = 0; c < side; c++) {
          const cellKey = `${r},${c}`;
          const isClicked = clickedCells && clickedCells.has(cellKey);

          shapes.push(
            <Rect
              key={`cell-${r}-${c}`}
              x={x + c * CELL_SIZE}
              y={y + r * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={isClicked ? '#10B981' : konvaTheme.gridRegular}
              opacity={isClicked ? 0.7 : 0.3}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={1}
              onClick={onCellClick ? () => onCellClick(r, c) : undefined}
              onTap={onCellClick ? () => onCellClick(r, c) : undefined}
              hitStrokeWidth={onCellClick ? 20 : 0}
              listening={!!onCellClick}
            />
          );
        }
      }
    } else {
      shapes.push(
        <Rect
          key="square"
          x={x}
          y={y}
          width={pixelSide}
          height={pixelSide}
          fill="#10B981"
          opacity={0.5}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={3}
        />
      );
    }

    // Show dimension
    if (showDimensions) {
      if (!unknownDimension) {
        shapes.push(
          <KonvaText
            key="side-label"
            x={x}
            y={y - 30}
            width={pixelSide}
            text={`${side} cm`}
            fontSize={18}
            fill={konvaTheme.labelText || '#F97316'}
            align="center"
            fontStyle="bold"
          />
        );
      } else {
        shapes.push(
          <KonvaText
            key="side-unknown"
            x={x}
            y={y - 30}
            width={pixelSide}
            text="? cm"
            fontSize={18}
            fill="#EF4444"
            align="center"
            fontStyle="bold"
          />
        );
      }
    }

    // Show area label if given (Level 3)
    if (unknownDimension && area) {
      shapes.push(
        <KonvaText
          key="area-label"
          x={x}
          y={y + pixelSide / 2 - 12}
          width={pixelSide}
          text={`Area = ${area} cm²`}
          fontSize={16}
          fill="#FFFFFF"
          align="center"
          fontStyle="bold"
        />
      );
    }
  }

  // ==================== TRIANGLE ====================
  if (shapeType === 'triangle') {
    const pixelBase = Math.min(base * 20, 300);
    const pixelHeight = Math.min(triangleHeight * 20, 250);
    const x1 = centerX - pixelBase / 2;
    const y1 = centerY + pixelHeight / 2;
    const x2 = centerX + pixelBase / 2;
    const y2 = y1;
    const x3 = centerX;
    const y3 = centerY - pixelHeight / 2;

    shapes.push(
      <Line
        key="triangle"
        points={[x1, y1, x2, y2, x3, y3]}
        fill="#8B5CF6"
        opacity={0.5}
        stroke={konvaTheme.shapeStroke}
        strokeWidth={3}
        closed
      />
    );

    // Height line (dashed)
    shapes.push(
      <Line
        key="height-line"
        points={[x3, y3, x3, y1]}
        stroke="#EF4444"
        strokeWidth={2}
        dash={[5, 3]}
      />
    );

    // Labels
    if (showDimensions) {
      shapes.push(
        <KonvaText
          key="base-label"
          x={x1}
          y={y1 + 15}
          width={pixelBase}
          text={`base = ${base} cm`}
          fontSize={16}
          fill={konvaTheme.labelText || '#F97316'}
          align="center"
          fontStyle="bold"
        />
      );
      shapes.push(
        <KonvaText
          key="height-label"
          x={x3 + 10}
          y={y3 + pixelHeight / 2 - 10}
          text={`h = ${triangleHeight} cm`}
          fontSize={16}
          fill="#EF4444"
          fontStyle="bold"
        />
      );
    }
  }

  return <>{shapes}</>;
}

export default ShapeVisualizer;
