import React from "react";
import { Arc, Rect } from "react-konva";

const SupplementaryAngleButton = ({
  handleClick,
  supplementary,
  x = 120,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  return (
    <>
      <Arc
        x={x + 40}
        y={y + 25}
        innerRadius={0}
        outerRadius={20}
        stroke={2}
        angle={180}
        rotationDeg={180}
      />
      <Rect
        id="supplementary"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"purple"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      {supplementary && (
        <Arc
          x={x + 40 + objPos.x}
          y={y + 100 + objPos.y}
          innerRadius={0}
          outerRadius={50}
          stroke={2}
          angle={180}
          rotationDeg={180}
          draggable={true}
          fill="purple"
          opacity={0.4}
        />
      )}
    </>
  );
};

export default SupplementaryAngleButton;
