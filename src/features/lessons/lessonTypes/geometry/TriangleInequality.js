import React, { useState } from "react";
import styled from "styled-components";
import { useWindowDimensions } from "../../../../hooks";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function TriangleInequality(props) {
  const { width } = useWindowDimensions();
  const [points, setPoints] = useState([
    { id: 0, x: 328, y: 43 },
    { id: 1, x: 250, y: 190 },
    { id: 2, x: 855, y: 190 },
    { id: 3, x: 700, y: 63 },
  ]);
  const [layerX, setLayerX] = useState({ x: 0, y: 0 });
  const [practice, setPractice] = useState(false);
  const handlePractice = () => {
    setPractice(true);
  };

  const changePosition = (e) => {
    // const points = [...points,]
    // setPoints({ x: e.target.attrs.x, y: e.target.attrs.y });
    const newPoints = points.map((point) => {
      if (point.id != e.target.attrs.id) return point;
      point.x = e.target.attrs.x;
      point.y = e.target.attrs.y;
      return point;
    });
    setPoints(newPoints);
  };

  const width1 = ((points[1].y - points[0].y) ** 2 + (points[1].x - points[0].x) ** 2) ** (1 / 2);
  const width2 = ((points[3].y - points[2].y) ** 2 + (points[3].x - points[2].x) ** 2) ** (1 / 2);
  const longSide = ((points[2].y - points[1].y) ** 2 + (points[2].x - points[1].x) ** 2) ** (1 / 2);
  const longEnough = longSide < width1 + width2 ? true : false;
  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={width} height={500} className="stage-background">
            <Layer>
              <Text
                fontSize={30}
                fontStyle={"bold"}
                fill={longEnough ? "green" : "red"}
                text={
                  longEnough
                    ? `The two little sides can reach!`
                    : `The two little sides aren't big enough to make a triangle`
                }
                x={41}
                y={35}
                width={200}
                wrap={"word"}
                draggable={true}
              />
            </Layer>
            <Layer>
              <Rect
                stroke={"lightgreen"}
                strokeWidth={2}
                x={points[1].x}
                y={points[1].y + 20}
                width={width1}
                height={12}
                fill={"lightgreen"}
                opacity={0.4}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightgreen"}
                text={width1.toFixed(1)}
                x={350}
                y={250}
                width={200}
                wrap={"word"}
                draggable={true}
              />
              <Rect
                stroke={"orange"}
                strokeWidth={2}
                x={points[2].x - width2}
                y={points[2].y + 20}
                width={width2}
                height={12}
                fill={"orange"}
                opacity={0.4}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"orange"}
                text={width2.toFixed(1)}
                x={650}
                y={250}
                width={200}
                wrap={"word"}
                draggable={true}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"black"}
                text={longSide.toFixed(0)}
                x={500}
                y={150}
                width={200}
                wrap={"word"}
                draggable={true}
              />
            </Layer>
            <Layer>
              <Line
                stroke={"lightgreen"}
                strokeWidth={3}
                points={[points[1].x, points[1].y, points[0].x, points[0].y]}
              />
              <Line
                stroke={"black"}
                strokeWidth={3}
                points={[points[1].x, points[1].y, points[2].x, points[2].y]}
              />
              <Line
                stroke={"orange"}
                strokeWidth={3}
                points={[points[2].x, points[2].y, points[3].x, points[3].y]}
              />
              {points.map((p, i) => {
                return (
                  <Circle
                    id={i}
                    radius={4}
                    stroke={i != 0 && i != 3 ? "black" : longEnough ? "green" : "red"}
                    strokeWidth={i == 0 || i == 3 ? 10 : 3}
                    x={p.x}
                    y={p.y}
                    fill={i == 0 || i == 3 ? "red" : "black"}
                    draggable={i == 0 || i == 3 ? true : false}
                    onDragMove={changePosition}
                  />
                );
              })}
            </Layer>
          </Stage>
          {/* TODO: Implement reset graph functionality */}
          <button onClick={() => {}}>Reset Graph</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default TriangleInequality;

const Wrapper = styled.div`
  margin-top: 20px;
  button {
    background-color: lightgreen;
    height: 50px;
    border-radius: 7px;
    font-size: 24px;
  }

  .practice-container {
    margin-top: 100px;
    display: flex;
    justify-content: center;
  }
  .problem-text {
    font-size: x-large;
    font-weight: 700;
    text-transform: lowercase;
  }
`;
