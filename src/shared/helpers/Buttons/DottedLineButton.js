import React, { useEffect, useState } from "react";
import { Rect, Circle, Line } from "react-konva";

const DottedLine = ({
  handleClick,
  dottedLine,
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
  }, [dottedLine]);

  const handleChangePoint = (e) => {
    if (e.target.attrs.id == "point")
      setPoints({ ...points, x1: e.target.attrs.x, y1: e.target.attrs.y });
    else if (e.target.attrs.id == "linePoint")
      setPoints({ ...points, x2: e.target.attrs.x, y2: e.target.attrs.y });
  };
  return (
    <>
      <Rect
        id="dottedLine"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"black"}
        opacity={0.2}
        stroke={"black"}
        onClick={handleClick}
      />
      <Line
        id="dottedLine"
        points={[x + 5, y + 15, x + 85, y + 15]}
        strokeWidth={5}
        stroke={"red"}
        onClick={handleClick}
        dash={[6, 4]}
      />
      {dottedLine && (
        <>
          <Line
            id="line"
            stroke={"red"}
            strokeWidth={5}
            opacity={0.7}
            points={[points.x1, points.y1, points.x2, points.y2]}
            dash={[15, 5]}
          />
          <Circle
            id="point"
            x={x + 40 + objPos.x}
            y={y + 60 + objPos.y}
            radius={6}
            stroke={2}
            draggable={true}
            fill="red"
            opacity={1}
            onDragMove={handleChangePoint}
          />
          <Circle
            id="linePoint"
            x={points.x2}
            y={points.y2}
            radius={6}
            stroke={2}
            draggable={true}
            fill="red"
            opacity={1}
            onDragMove={handleChangePoint}
          />
        </>
      )}
    </>
  );
};

export default DottedLine;
