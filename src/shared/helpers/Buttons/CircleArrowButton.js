import React, { useEffect, useState } from "react";
import { Rect, Circle, Line, Arrow } from "react-konva";

const CircleArrowButton = ({
  handleClick,
  circleArrow,
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
  }, [circleArrow]);

  const handleChangePoint = (e) => {
    if (e.target.attrs.id == "point")
      setPoints({ ...points, x1: e.target.attrs.x, y1: e.target.attrs.y });
    else if (e.target.attrs.id == "linePoint")
      setPoints({ ...points, x2: e.target.attrs.x, y2: e.target.attrs.y });
  };
  return (
    <>
      <Rect
        id="circleArrow"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"green"}
        opacity={0.2}
        stroke={"black"}
        onClick={handleClick}
      />
      <Arrow
        id="circleArrow"
        points={[x + 30, y + 15, x + 50, y + 15]}
        radius={12}
        stroke={"red"}
        strokeWidth={2}
        onClick={handleClick}
      />
      <Circle
        id="circleArrow"
        x={x + 20}
        y={y + 15}
        radius={12}
        stroke={"red"}
        strokeWidth={2}
        onClick={handleClick}
      />

      {circleArrow && (
        <>
          <Arrow
            id="line"
            stroke={"red"}
            strokeWidth={30}
            opacity={0.3}
            points={[points.x1, points.y1, points.x2, points.y2]}
            tension={100}
          />
          <Circle
            id="point"
            x={x + 40 + objPos.x}
            y={y + 60 + objPos.y}
            radius={60}
            stroke={"red"}
            strokeWidth={4}
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

export default CircleArrowButton;
