import React, { useEffect, useState } from "react";
import { Rect, Circle, Line } from "react-konva";

const BuildingButton = ({
  handleClick,
  building,
  x = 120,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  return (
    <>
      <Rect
        id="building"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"lightblue"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      <Rect
        id="building"
        height={25}
        width={24}
        x={x + 35}
        y={y + 2}
        stroke={2}
        fill="gray"
        onClick={handleClick}
      />
      <Rect
        id="building"
        height={10}
        width={4}
        x={x + 45}
        y={y + 15}
        stroke={2}
        fill="brown"
        onClick={handleClick}
      />
      <Rect
        id="building"
        height={3}
        width={4}
        x={x + 40}
        strokeWidth={1}
        stroke={"black"}
        y={y + 6}
        fill={"blue"}
        onClick={handleClick}
      />
      <Rect
        id="building"
        height={3}
        width={4}
        x={x + 50}
        strokeWidth={1}
        stroke={"black"}
        y={y + 6}
        fill={"blue"}
        onClick={handleClick}
      />
      {building && (
        <>
          <Rect
            draggable={true}
            height={200}
            width={100}
            fill={"gray"}
            x={x + 10 + objPos.x}
            y={y + 40 + objPos.y}
          />
        </>
      )}
    </>
  );
};

export default BuildingButton;
