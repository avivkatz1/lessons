import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const MovablePointsAndLines = ({ points, changePosition, handleShapeMoving }) => {
  const newPoints = [
    ...points,
    {
      x: points[1].x - points[0].x + points[2].x,
      y: points[1].y - points[0].y + points[2].y,
      id: 3,
    },
  ];

  return (
    <>
      {newPoints.map((p, i) => {
        return (
          <Circle
            id={i}
            radius={4}
            stroke={"black"}
            x={p.x}
            y={p.y}
            fill={i < 3 ? "yellow" : "black"}
            draggable={i < 3 ? true : false}
            onDragMove={changePosition}
          />
        );
      })}

      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(newPoints[0].x, newPoints[0].y);
          context.lineTo(newPoints[1].x, newPoints[1].y);
          context.lineTo(newPoints[3].x, newPoints[3].y);
          context.lineTo(newPoints[2].x, newPoints[2].y);
          context.lineTo(newPoints[0].x, newPoints[0].y);

          context.closePath();
          // (!) Konva specific method, it is very important
          context.fillStrokeShape(shape);
        }}
        fill="yellow"
        stroke="black"
        strokeWidth={0}
        opacity={0.4}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
      <Line
        points={[newPoints[0].x, newPoints[0].y, newPoints[1].x, points[1].y]}
        stroke="black"
        strokeWidth={2}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
      <Line
        points={[newPoints[2].x, newPoints[2].y, newPoints[3].x, newPoints[3].y]}
        stroke="black"
        strokeWidth={2}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
    </>
  );
};

export default MovablePointsAndLines;
