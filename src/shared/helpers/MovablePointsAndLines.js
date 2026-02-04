import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const MovablePointsAndLines = ({ points, changePosition, handleShapeMoving }) => {
  return (
    <>
      {points.map((p, i) => {
        return (
          <Circle
            id={i}
            radius={4}
            stroke={"black"}
            x={p.x}
            y={p.y}
            fill="black"
            draggable={true}
            onDragMove={changePosition}
          />
        );
      })}
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          context.lineTo(points[1].x, points[1].y);
          context.lineTo(points[2].x, points[2].y);
          context.lineTo(points[3].x, points[3].y);
          context.lineTo(points[0].x, points[0].y);

          context.closePath();
          // (!) Konva specific method, it is very important
          context.fillStrokeShape(shape);
        }}
        fill="green"
        stroke="black"
        strokeWidth={2}
        opacity={0.4}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
    </>
  );
};

export default MovablePointsAndLines;
