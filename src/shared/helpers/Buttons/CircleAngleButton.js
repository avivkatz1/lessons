import React from "react";
import { Rect, Circle } from "react-konva";

const CircleAngleButton = ({
  handleClick,
  circle,
  x = 120,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  return (
    <>
      <Circle x={x + 45} y={y + 15} radius={12} stroke={2} />

      <Rect
        id="circle"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"blue"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      {circle && (
        <>
          <Circle
            x={x + 40 + objPos.x}
            y={y + 100 + objPos.y}
            radius={50}
            stroke={2}
            draggable={true}
            fill="blue"
            opacity={0.4}
          />
          {/* <Circle
            x={x + 40}
            y={y + 100}
            fill="black"
            radius={3}
            stroke={2}
          /> */}
        </>
      )}
    </>
  );
};

export default CircleAngleButton;
