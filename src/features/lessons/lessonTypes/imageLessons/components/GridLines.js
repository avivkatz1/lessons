import React, { useMemo } from "react";
import { Line } from "react-konva";
import { useLessonState, useKonvaTheme } from "../../../../../hooks";

/**
 * Phase 2 - Stage 4: Optimized GridLines component
 * - Memoizes grid line calculations
 * - Wrapped in React.memo to prevent unnecessary re-renders
 * - Uses useLessonState hook for state management
 */
const GridLines = React.memo(({ orientation, stageHeight }) => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { gridDetails, width, height } = lessonProps;
  const konvaTheme = useKonvaTheme();

  // Phase 2 - Stage 4: Memoize grid line calculations
  const gridLines = useMemo(() => {
    const changesX = width / gridDetails.widthLines;
    const changesY = height / gridDetails.heightLines;
    const change = orientation === "width" ? changesX : changesY;
    const origin = gridDetails.origin;
    const numberOfLines =
      orientation === "width" ? gridDetails.widthLines : gridDetails.heightLines;

    return [...Array(numberOfLines)].map((_, index) => {
      const coord =
        orientation === "width"
          ? [index * change, 0, index * change, stageHeight]
          : [0, index * change, width, index * change];

      const isOriginLine =
        (orientation === "width" && index === origin[0]) ||
        (orientation === "height" && index === origin[1]);

      return {
        key: `${orientation}-${index}`,
        points: coord,
        stroke: isOriginLine ? konvaTheme.gridOrigin : konvaTheme.gridRegular,
        strokeWidth: isOriginLine ? 6 : 3,
      };
    });
  }, [orientation, stageHeight, width, height, gridDetails, konvaTheme]);

  return (
    <>
      {gridLines.map((line) => (
        <Line
          key={line.key}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          points={line.points}
          opacity={0.5}
        />
      ))}
    </>
  );
});

export default GridLines;
