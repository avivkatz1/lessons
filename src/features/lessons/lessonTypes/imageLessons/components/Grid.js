import React from "react";
import { Rect } from "react-konva";
import GridLines from "./GridLines";
import { useKonvaTheme } from "../../../../../hooks";

/**
 * Phase 2 - Stage 4: Memoized Grid component
 * Prevents re-rendering when parent updates (e.g., answer state changes)
 * Only re-renders when stageHeight prop actually changes
 */
const Grid = React.memo(({ stageHeight, stageWidth }) => {
  const konvaTheme = useKonvaTheme();

  return (
    <>
      <Rect
        x={0}
        y={0}
        width={stageWidth}
        height={stageHeight}
        fill={konvaTheme.canvasBackground}
      />
      <GridLines orientation="height" stageHeight={stageHeight} />
      <GridLines orientation="width" stageHeight={stageHeight} />
    </>
  );
});

export default Grid;
