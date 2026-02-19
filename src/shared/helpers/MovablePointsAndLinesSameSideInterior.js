import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import TouchDragHandle from "./TouchDragHandle";
import slope from "./slope";
import halfwayPoint from "./halfwayPoint";
import intersectionTwoLines from "./intersectionTwoLines";
import MakeColoredAngle from "./MakeColoredAngle";

const MovablePointsAndLinesSameSideInterior = ({ points, changePosition, handleShapeMoving }) => {
  const [shapeViews, setShapeViews] = useState({ green: false, red: false });

  const handleClickedAngle = (e) => {
    const color = e.target.attrs.id;
    setShapeViews({ ...shapeViews, [color]: !shapeViews[color] });
  };

  const newPoints = [
    ...points,
    {
      id: 3,
      x: points[1].x - points[0].x + points[2].x,
      y: points[1].y - points[0].y + points[2].y,
    },
  ].sort((a, b) => a.id - b.id);

  const x1 = newPoints[0].x;
  const y1 = newPoints[0].y;
  const x2 = newPoints[1].x;
  const y2 = newPoints[1].y;

  const halfwayPointOne = halfwayPoint([x1, y1, x2, y2]);

  const m = slope({
    x2: halfwayPointOne.x,
    y2: halfwayPointOne.y,
    x1: newPoints[4].x,
    y1: newPoints[4].y,
  });

  const lowestXPoint = newPoints[2].y + 200;

  const newX = (lowestXPoint - newPoints[4].y) / m + newPoints[4].x;

  const newY = lowestXPoint;

  const m2 = slope({
    x2: newPoints[2].x,
    y2: newPoints[2].y,
    x1: newPoints[3].x,
    y1: newPoints[3].y,
  });

  const a = newPoints[3].x;
  const b = newPoints[3].y;
  const c = newPoints[4].x;
  const d = newPoints[4].y;

  const shapePoints = intersectionTwoLines({ a, b, c, d, m1: m, m2 });

  const shapeX = shapePoints.x;
  const shapeY = shapePoints.y;

  const halfwayPointTwo = halfwayPoint([halfwayPointOne.x, halfwayPointOne.y, shapeX, shapeY]);
  const halfwayThree = halfwayPoint([
    halfwayPointOne.x,
    halfwayPointOne.y,
    newPoints[0].x,
    newPoints[0].y,
  ]);
  const halfwayFour = halfwayPoint([shapeX, shapeY, newPoints[2].x, newPoints[2].y]);
  const halfwayFive = halfwayPoint([
    halfwayPointOne.x,
    halfwayPointOne.y,
    newPoints[1].x,
    newPoints[1].y,
  ]);
  const halfwaySix = halfwayPoint([shapeX, shapeY, newPoints[3].x, newPoints[3].y]);

  return (
    <>
      <Line
        points={[newPoints[4].x, newPoints[4].y, newX, newY]}
        stroke="black"
        strokeWidth={2}
        draggable={false}
      />
      {newPoints.map((p, i) => {
        if (i !== 3) {
          return (
            <TouchDragHandle
              key={i}
              id={i}
              radius={4}
              stroke={"black"}
              x={p.x}
              y={p.y}
              fill={i < 3 ? "yellow" : "black"}
              onDragMove={changePosition}
              affordanceColor={i < 3 ? "yellow" : "black"}
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
      <Circle
        id={`h${1}`}
        radius={4}
        stroke="black"
        x={halfwayPointOne.x}
        y={halfwayPointOne.y}
        fill="black"
      />

      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(newPoints[0].x, newPoints[0].y);
          context.lineTo(halfwayPointOne.x, halfwayPointOne.y);
          context.lineTo(shapeX, shapeY);
          context.lineTo(newPoints[2].x, newPoints[2].y);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill="green"
        stroke="black"
        strokeWidth={0}
        opacity={0.08}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(newPoints[1].x, newPoints[1].y);
          context.lineTo(halfwayPointOne.x, halfwayPointOne.y);
          context.lineTo(shapeX, shapeY);
          context.lineTo(newPoints[3].x, newPoints[3].y);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill="red"
        stroke="black"
        strokeWidth={0}
        opacity={0.08}
        draggable={false}
        onDragEnd={handleShapeMoving}
      />
      <MakeColoredAngle
        p={[
          halfwayPointOne.x,
          halfwayPointOne.y,
          halfwayPointTwo.x,
          halfwayPointTwo.y,
          halfwayThree.x,
          halfwayThree.y,
        ]}
        color="green"
        handleClick={handleClickedAngle}
        on={shapeViews.green}
      />
      <MakeColoredAngle
        p={[shapeX, shapeY, halfwayPointTwo.x, halfwayPointTwo.y, halfwayFour.x, halfwayFour.y]}
        color="green"
        handleClick={handleClickedAngle}
        on={shapeViews.green}
      />
      <MakeColoredAngle
        p={[
          halfwayPointOne.x,
          halfwayPointOne.y,
          halfwayPointTwo.x,
          halfwayPointTwo.y,
          halfwayFive.x,
          halfwayFive.y,
        ]}
        color="red"
        handleClick={handleClickedAngle}
        on={shapeViews.red}
      />
      <MakeColoredAngle
        p={[shapeX, shapeY, halfwayPointTwo.x, halfwayPointTwo.y, halfwaySix.x, halfwaySix.y]}
        color="red"
        handleClick={handleClickedAngle}
        on={shapeViews.red}
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

export default MovablePointsAndLinesSameSideInterior;
