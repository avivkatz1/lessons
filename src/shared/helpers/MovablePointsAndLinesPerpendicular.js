import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import halfwayPoint from "./halfwayPoint";
import slope from "./slope";
import intersectionTwoLines from "./intersectionTwoLines";
const MovablePointsAndLines = ({ points, changePosition, handleShapeMoving }) => {
  const x2 =
    points[0].y <= points[1].y
      ? points[1].x - Math.abs(points[0].y - points[1].y)
      : points[1].x + Math.abs(points[0].y - points[1].y);
  const y2 =
    points[0].x >= points[1].x
      ? points[1].y - Math.abs(points[0].x - points[1].x)
      : points[1].y + Math.abs(points[0].x - points[1].x);
  const x3 =
    points[0].y <= points[1].y
      ? points[1].x + Math.abs(points[0].y - points[1].y)
      : points[1].x - Math.abs(points[0].y - points[1].y);
  const y3 =
    points[0].x >= points[1].x
      ? points[1].y + Math.abs(points[0].x - points[1].x)
      : points[1].y - Math.abs(points[0].x - points[1].x);

  const newPoints = [...points, { id: 2, x: x2, y: y2 }, { id: 3, x: x3, y: y3 }];

  const shapePoint1 = halfwayPoint([
    newPoints[0].x,
    newPoints[0].y,
    newPoints[1].x,
    newPoints[1].y,
  ]);
  const shapePoint2 = halfwayPoint([
    newPoints[2].x,
    newPoints[2].y,
    newPoints[1].x,
    newPoints[1].y,
  ]);

  const slope1 = slope({
    x1: newPoints[0].x,
    y1: newPoints[0].y,
    x2: newPoints[1].x,
    y2: newPoints[1].y,
  });

  const slope2 = slope({
    x1: newPoints[2].x,
    y1: newPoints[2].y,
    x2: newPoints[1].x,
    y2: newPoints[1].y,
  });

  let shapePoint3;
  if (slope1 == 0 || slope2 == 0) {
    if (shapePoint2.x == newPoints[2].x) shapePoint3 = { x: shapePoint1.x, y: shapePoint2.y };
    else shapePoint3 = { x: shapePoint2.x, y: shapePoint1.y };
  } else
    shapePoint3 = intersectionTwoLines({
      a: shapePoint1.x,
      b: shapePoint1.y,
      c: shapePoint2.x,
      d: shapePoint2.y,
      m1: slope1,
      m2: slope2,
    });

  return (
    <>
      {newPoints.map((p, i) => {
        return (
          <Circle
            id={i}
            radius={i < 2 ? 6 : 4}
            stroke={"black"}
            x={p.x}
            y={p.y}
            fill={i < 2 ? "red" : i == 2 ? "green" : "yellow"}
            draggable={i < 2 ? true : false}
            onDragMove={changePosition}
          />
        );
      })}

      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(shapePoint1.x, shapePoint1.y);
          context.lineTo(newPoints[1].x, newPoints[1].y);

          context.lineTo(shapePoint2.x, shapePoint2.y);
          context.lineTo(shapePoint3.x, shapePoint3.y);

          context.closePath();
          // (!) Konva specific method, it is very important
          context.fillStrokeShape(shape);
        }}
        fill="red"
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
