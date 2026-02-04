import React from "react";
import { Line } from "react-konva";
const LineData = ({ xPosition = 100, yPosition = 90, points = [-20, 35, 40, 35] }) => {
  return (
    <Line
      x={xPosition}
      y={yPosition}
      points={points}
      tension={0.5}
      closed
      stroke="red"
      fillLinearGradientStartPoint={{ x: -50, y: -50 }}
      fillLinearGradientEndPoint={{ x: 50, y: 50 }}
      fillLinearGradientColorStops={[0, "red", 1, "yellow"]}
    />
  );
};

export default LineData;
