import React from "react";
import { Layer, Line, Circle } from "react-konva";
import { useLessonState } from "../../../../../hooks";

const LineOnGraph = () => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const b = lessonProps.question[0][0].text;
  const deltaY = lessonProps.question[0][1].text;
  const deltaX = lessonProps.question[0][2].text;
  const { gridDetails, width, height } = lessonProps;

  //   let yCoordinate = questionNumbers[0].text;

  const changesX = width / gridDetails.widthLines;
  const changesY = height / gridDetails.heightLines;
  const point1 = { x: gridDetails.origin[0], y: gridDetails.origin[1] - b };
  return (
    <>
      <Circle radius={12} x={point1.x * changesX} y={point1.y * changesY} fill="red" />
      <Circle
        radius={12}
        x={(point1.x + deltaX) * changesX}
        y={(point1.y - deltaY) * changesY}
        fill="blue"
        opacity={1}
      />
      {/* <Circle
    radius={12}
    x={3 * grid.changesX}
    y={grid?.origin?(grid.origin[1]-questionNumbers ) * grid.changesY:0}
    fill="blue"
    /> */}
    </>
  );
};

export default LineOnGraph;
