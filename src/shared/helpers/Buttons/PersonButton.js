import React, { useEffect, useState } from "react";
import { Rect, Circle, Line } from "react-konva";

const PersonButton = ({
  handleClick,
  person,
  x = 120,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const initialPos = {
    x1: x + 40 + objPos.x,
    y1: y + 60 + objPos.y,
    x2: x + 40 + objPos.x,
    y2: y + 150 + objPos.y,
  };
  const [points, setPoints] = useState(initialPos);

  useEffect(() => {
    setPoints(initialPos);
  }, [person]);

  const handleChangePoint = (e) => {
    if (e.target.attrs.id == "point")
      setPoints({ ...points, x1: e.target.attrs.x, y1: e.target.attrs.y, x2: e.target.attrs.x });
    else if (e.target.attrs.id == "linePoint") setPoints({ ...points, y2: e.target.attrs.y });
  };
  return (
    <>
      <Rect
        id="person"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"gray"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      <Circle
        id="person"
        x={x + 45}
        y={y + 8}
        radius={6}
        stroke={"black"}
        strokeWidth={1}
        // fill="yellow"
        onClick={handleClick}
      />
      <Line
        id="person"
        stroke="black"
        strokeWidth={1}
        points={[
          x + 45,
          y + 14,
          x + 45,
          y + 22,
          x + 50,
          y + 28,
          x + 45,
          y + 22,
          x + 40,
          y + 28,
          x + 45,
          y + 22,
          x + 45,
          y + 18,
          x + 40,
          y + 18,
          x + 50,
          y + 18,
        ]}
      />
      {person && (
        <>
          <Line
            id="line"
            stroke={"black"}
            strokeWidth={5}
            opacity={0.85}
            points={[
              points.x1,
              points.y1 + 20,
              points.x2,
              points.y2,
              points.x2 + 15,
              points.y2 + 40,
              points.x2,
              points.y2,
              points.x2 - 15,
              points.y2 + 40,
              points.x2,
              points.y2,
              points.x2,
              points.y2,
              points.x1,
              points.y1 + 30,
              points.x1 - 10,
              points.y1 + 60,
              points.x1,
              points.y1 + 30,
              points.x1 + 10,
              points.y1 + 60,
            ]}
          />
          <Circle
            id="point"
            x={x + 40 + objPos.x}
            y={y + 60 + objPos.y}
            radius={20}
            stroke={2}
            draggable={true}
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

export default PersonButton;
