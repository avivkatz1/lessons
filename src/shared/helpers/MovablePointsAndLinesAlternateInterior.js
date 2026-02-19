import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import TouchDragHandle from "./TouchDragHandle";

const MovablePointsAndLinesAlternateInterior = ({
  points,
  changePosition,
  handleShapeMoving,
  objPos,
}) => {
  const newPoints = [
    ...points,
    {
      x: points[1].x - points[0].x + points[2].x,
      y: points[1].y - points[0].y + points[2].y,
      id: 3,
    },
  ];

  const trianglePoint = {
    a: ((newPoints[0].x + newPoints[1].x) / 2 + newPoints[1].x) / 2,
    b: ((newPoints[0].y + newPoints[1].y) / 2 + newPoints[1].y) / 2,
    c: ((newPoints[1].x + newPoints[2].x) / 2 + newPoints[1].x) / 2,
    d: ((newPoints[1].y + newPoints[2].y) / 2 + newPoints[1].y) / 2,
    e: ((newPoints[2].x + newPoints[1].x) / 2 + newPoints[2].x) / 2,
    f: ((newPoints[2].y + newPoints[1].y) / 2 + newPoints[2].y) / 2,
    g: ((newPoints[2].x + newPoints[3].x) / 2 + newPoints[2].x) / 2,
    h: ((newPoints[2].y + newPoints[3].y) / 2 + newPoints[2].y) / 2,
  };

  return (
    <>
      {newPoints.map((p, i) => {
        if (i < 3) {
          return (
            <TouchDragHandle
              key={i}
              id={i}
              radius={6}
              stroke={"black"}
              x={p.x}
              y={p.y}
              fill="yellow"
              onDragMove={changePosition}
              affordanceColor="yellow"
            />
          );
        }
        return (
          <Circle
            key={i}
            id={i}
            radius={4}
            stroke={"black"}
            x={p.x}
            y={p.y}
            fill="black"
            draggable={false}
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
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(newPoints[1].x, newPoints[1].y);
          context.lineTo(trianglePoint.a, trianglePoint.b);
          context.lineTo(trianglePoint.c, trianglePoint.d);
          context.lineTo(newPoints[1].x, newPoints[1].y);
          context.closePath();
          // (!) Konva specific method, it is very important
          context.fillStrokeShape(shape);
        }}
        id="green"
        fill="green"
        stroke="black"
        strokeWidth={0}
        opacity={0.2}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(newPoints[2].x, newPoints[2].y);
          context.lineTo(trianglePoint.e, trianglePoint.f);
          context.lineTo(trianglePoint.g, trianglePoint.h);
          context.lineTo(newPoints[2].x, newPoints[2].y);
          context.closePath();
          // (!) Konva specific method, it is very important
          context.fillStrokeShape(shape);
        }}
        id="green"
        fill="green"
        stroke="black"
        strokeWidth={0}
        opacity={0.2}
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
      <Line
        points={[newPoints[1].x, newPoints[1].y, newPoints[2].x, newPoints[2].y]}
        stroke="black"
        strokeWidth={2}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
    </>
  );
};

export default MovablePointsAndLinesAlternateInterior;
