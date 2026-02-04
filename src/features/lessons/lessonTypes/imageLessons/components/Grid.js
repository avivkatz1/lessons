import React from "react";
import GridLines from "./GridLines";

/**
 * Phase 2 - Stage 4: Memoized Grid component
 * Prevents re-rendering when parent updates (e.g., answer state changes)
 * Only re-renders when stageHeight prop actually changes
 */
const Grid = React.memo(({ stageHeight }) => {
  return (
    <>
      <GridLines orientation="height" stageHeight={stageHeight} />
      <GridLines orientation="width" stageHeight={stageHeight} />
    </>
  );
});

export default Grid;
