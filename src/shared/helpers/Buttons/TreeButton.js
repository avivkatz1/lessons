import React, { useEffect, useState } from "react";
import { Rect, Circle, Line } from "react-konva";

const TreeButton = ({
  handleClick,
  tree,
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
      y2: y + 200 + objPos.y,
    });
  }, [tree]);

  const handleChangePoint = (e) => {
    if (e.target.attrs.id == "point")
      setPoints({ ...points, x1: e.target.attrs.x, y1: e.target.attrs.y });
    else if (e.target.attrs.id == "linePoint")
      setPoints({ ...points, x2: e.target.attrs.x, y2: e.target.attrs.y });
  };
  return (
    <>
      <Rect
        id="tree"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"blue"}
        opacity={0.2}
        stroke={"black"}
        onClick={handleClick}
      />
      <Circle
        id="tree"
        x={x + 50}
        y={y + 12}
        radius={6}
        strokeWidth={0.5}
        stroke="black"
        fill="green"
        onClick={handleClick}
      />
      <Circle
        id="tree"
        x={x + 42}
        y={y + 14}
        radius={6}
        strokeWidth={0.5}
        stroke="black"
        fill="green"
        onClick={handleClick}
      />
      <Rect
        id="tree"
        x={x + 45}
        y={y + 12}
        width={4}
        height={15}
        fill="brown"
        strokeWidth={0.5}
        stroke="black"
        onClick={handleClick}
      />
      <Circle
        id="tree"
        x={x + 45}
        y={y + 9}
        radius={6}
        strokeWidth={0.5}
        stroke="black"
        fill="green"
        onClick={handleClick}
      />

      {tree && (
        <>
          <Circle
            id="point"
            x={points.x1 - 30}
            y={points.y1 + 30}
            radius={60}
            stroke={2}
            fill="green"
            opacity={1}
          />
          <Circle
            id="point"
            x={points.x1 + 45}
            y={points.y1 + 22}
            radius={60}
            stroke={2}
            fill="green"
            opacity={1}
          />
          <Line
            id="line"
            stroke={"brown"}
            strokeWidth={30}
            opacity={0.8}
            points={[points.x1, points.y1, points.x2, points.y2]}
          />
          <Circle
            id="point"
            x={x + 40 + objPos.x}
            y={y + 60 + objPos.y}
            radius={70}
            stroke={2}
            draggable={true}
            fill="green"
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
            fill="brown"
            opacity={1}
            onDragMove={handleChangePoint}
          />
        </>
      )}
    </>
  );
};

export default TreeButton;
