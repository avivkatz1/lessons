import React from "react";
import { Rect } from "react-konva";
const RightAngleButton = ({
  handleClick,
  right,
  x = 220,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  return (
    <>
      <Rect x={x + 35} y={y + 5} width={20} stroke={2} height={20} />
      <Rect
        id="right"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"red"}
        opacity={0.5}
        stroke={"black"}
        strokeWidth={2}
        onClick={handleClick}
      />
      {right && (
        <Rect
          x={240 + objPos.x}
          y={50 + objPos.y}
          width={50}
          height={50}
          fill="red"
          opacity={0.4}
          draggable={true}
          stroke="black"
        />
      )}
    </>
  );
};

export default RightAngleButton;
