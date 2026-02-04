import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import { slope, halfwayPoint, intersectionTwoLines, MakeColoredAnglesCorrespond } from "./";

const MovablePointsAndLinesCorresponding = ({ points, changePosition, handleShapeMoving }) => {
  const startingPosition = {};

  const [shapeViews, setShapeViews] = useState({
    green: false,
    blue: false,
    red: false,
    yellow: false,
  });

  const newPoints = [
    ...points,
    {
      id: 3,
      x: points[1].x - points[0].x + points[2].x,
      y: points[1].y - points[0].y + points[2].y,
    },
  ].sort((a, b) => a.id - b.id);

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;

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

  const handleShapeClick = (e) => {
    const color = e.target.attrs.id;
    setShapeViews({ ...shapeViews, [color]: !shapeViews[color] });
  };

  const halfwayPointTwo = halfwayPoint([shapeX, shapeY, halfwayPointOne.x, halfwayPointOne.y]);
  const halfwayPointThree = halfwayPoint([
    halfwayPointOne.x,
    halfwayPointOne.y,
    newPoints[0].x,
    newPoints[0].y,
  ]);
  const halfwayFour = halfwayPoint([newPoints[2].x, newPoints[2].y, shapeX, shapeY]);
  const halfwayFive = halfwayPoint([shapeX, shapeY, newX, newY]);
  const halfwaySix = halfwayPoint([halfwayFive.x, halfwayFive.y, shapeX, shapeY]);
  const halfwaySeven = halfwayPoint([
    halfwayPointOne.x,
    halfwayPointOne.y,
    newPoints[1].x,
    newPoints[1].y,
  ]);
  const halfwayEight = halfwayPoint([shapeX, shapeY, newPoints[3].x, newPoints[3].y]);
  const halfwayNine = halfwayPoint([
    halfwayPointOne.x,
    halfwayPointOne.y,
    newPoints[4].x,
    newPoints[4].y,
  ]);

  const getStartPosition = (e) => {};

  const handleDragEnd = (e) => {};

  return (
    <>
      <Line
        points={[newPoints[4].x, newPoints[4].y, newX, newY]}
        stroke="black"
        strokeWidth={2}
        draggable={false}
      />
      {newPoints.map((p, i) => {
        return (
          <Circle
            id={i}
            radius={4}
            stroke={"black"}
            x={p.x}
            y={p.y}
            fill={i < 3 ? "yellow" : "black"}
            draggable={i != 3 ? true : false}
            onDragMove={changePosition}
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
      <MakeColoredAnglesCorrespond
        shapeViews={shapeViews.green}
        p1={[
          halfwayPointTwo.x,
          halfwayPointTwo.y,
          halfwayPointOne.x,
          halfwayPointOne.y,
          halfwayPointThree.x,
          halfwayPointThree.y,
        ]}
        p2={[shapeX, shapeY, halfwayFour.x, halfwayFour.y, halfwaySix.x, halfwaySix.y]}
        color="green"
        handleClick={handleShapeClick}
      />

      <MakeColoredAnglesCorrespond
        shapeViews={shapeViews.blue}
        p1={[
          halfwayPointTwo.x,
          halfwayPointTwo.y,
          halfwayPointOne.x,
          halfwayPointOne.y,
          halfwaySeven.x,
          halfwaySeven.y,
        ]}
        p2={[shapeX, shapeY, halfwaySix.x, halfwaySix.y, halfwayEight.x, halfwayEight.y]}
        color="blue"
        handleClick={handleShapeClick}
      />
      <MakeColoredAnglesCorrespond
        shapeViews={shapeViews.red}
        p1={[
          halfwayNine.x,
          halfwayNine.y,
          halfwayPointOne.x,
          halfwayPointOne.y,
          halfwaySeven.x,
          halfwaySeven.y,
        ]}
        p2={[shapeX, shapeY, halfwayPointTwo.x, halfwayPointTwo.y, halfwayEight.x, halfwayEight.y]}
        color="red"
        handleClick={handleShapeClick}
      />
      <MakeColoredAnglesCorrespond
        shapeViews={shapeViews.yellow}
        p1={[
          halfwayNine.x,
          halfwayNine.y,
          halfwayPointOne.x,
          halfwayPointOne.y,
          halfwayPointThree.x,
          halfwayPointThree.y,
        ]}
        p2={[shapeX, shapeY, halfwayPointTwo.x, halfwayPointTwo.y, halfwayFour.x, halfwayFour.y]}
        color="yellow"
        handleClick={handleShapeClick}
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

export default MovablePointsAndLinesCorresponding;
