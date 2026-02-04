import React, { useEffect, useState } from "react";
import { Rect, Circle, Line } from "react-konva";

const SunButton = ({
  handleClick,
  sun,
  x = 120,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [points, setPoints] = useState({
    x1: x + 40 + objPos.x,
    y1: y + 60 + objPos.y,
    x2: x + 40 + objPos.x,
    y2: y + 150 + objPos.y,
  });

  useEffect(() => {
    setPoints({
      x1: x + 40 + objPos.x,
      y1: y + 60 + objPos.y,
      x2: x + 40 + objPos.x,
      y2: y + 150 + objPos.y,
    });
  }, [sun]);

  const handleChangePoint = (e) => {
    if (e.target.attrs.id == "point")
      setPoints({ ...points, x1: e.target.attrs.x, y1: e.target.attrs.y });
    else if (e.target.attrs.id == "linePoint")
      setPoints({ ...points, x2: e.target.attrs.x, y2: e.target.attrs.y });
  };
  return (
    <>
      <Rect
        id="sun"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"blue"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      <Circle
        id="sun"
        x={x + 45}
        y={y + 15}
        radius={12}
        stroke={2}
        fill="yellow"
        onClick={handleClick}
      />
      {sun && (
        <>
          <Line
            id="line"
            stroke={"yellow"}
            strokeWidth={30}
            opacity={0.3}
            points={[points.x1, points.y1, points.x2, points.y2]}
          />
          <Circle
            id="point"
            x={x + 40 + objPos.x}
            y={y + 60 + objPos.y}
            radius={60}
            stroke={2}
            draggable={true}
            fill="yellow"
            opacity={1}
            onDragMove={handleChangePoint}
          />
          <Circle
            id="linePoint"
            x={points.x2}
            y={points.y2}
            radius={4}
            stroke={2}
            draggable={true}
            fill="black"
            opacity={1}
            onDragMove={handleChangePoint}
          />
        </>
      )}
    </>
  );
};

export default SunButton;
