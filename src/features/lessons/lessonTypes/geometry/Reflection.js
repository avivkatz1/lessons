import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

const imageColors = ["red", "blue", "green", "yellow"];

let PointX;
let PointY;
let OriginH;
let OriginV;

PointX = randomNum(10);
PointY = randomNum(10);
OriginH = randomNum(10) + 5;
OriginV = randomNum(10) + 5;

function Reflection(props) {
  const [axis, setAxis] = useState({ OriginH, OriginV });
  const [point, setPoint] = useState({ PointX, PointY });
  const [rectPoints, setRectPoints] = useState([
    { x: point.PointX * 15 + 310, y: point.PointY * 15 + 10 },
    { x: point.PointX * 15 + 340, y: point.PointY * 15 + 10 },
    { x: point.PointX * 15 + 310, y: point.PointY * 15 + 40 },
    { x: point.PointX * 15 + 340, y: point.PointY * 15 + 40 },
  ]);
  const [layerX, setLayerX] = useState(0);
  const [practice, setPractice] = useState(false);
  const [fillPattern, setFillPattern] = useState(imageColors);
  const handlePractice = () => {
    setPractice(true);
  };
  const newGrid = () => {
    PointX = randomNum(10);
    PointY = randomNum(10);
    OriginH = randomNum(10) + 5;
    OriginV = randomNum(10) + 5;
    setPoint({ PointX, PointY });
    setAxis({ OriginH, OriginV });
    setRectPoints([
      { x: point.PointX * 15 + 310, y: point.PointY * 15 + 10 },
      { x: point.PointX * 15 + 340, y: point.PointY * 15 + 10 },
      { x: point.PointX * 15 + 310, y: point.PointY * 15 + 40 },
      { x: point.PointX * 15 + 340, y: point.PointY * 15 + 40 },
    ]);

    setFillPattern(imageColors);
    setLayerX(0);
  };
  const dragTrack = (e) => {};

  const flipHorizon = () => {
    const newOrder = [1, 0, 3, 2];
    const newColorOrder = newOrder.map((newNum, index) => {
      return fillPattern[newNum];
    });
    setFillPattern(newColorOrder);
  };

  const flipVertical = () => {
    const newOrder = [2, 3, 0, 1];
    const newColorOrder = newOrder.map((newNum, index) => {
      return fillPattern[newNum];
    });
    setFillPattern(newColorOrder);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer>
              {[...Array(50)].map((_, indexH) => {
                let strokeColorH = "lightgray";
                let strokeWidthH = 1;
                if (indexH === axis.OriginH) {
                  strokeColorH = "darkgray";
                  strokeWidthH = 2;
                }
                return (
                  <Line
                    key={`y${indexH}`}
                    points={[0, 0, 1300, 0]}
                    stroke={strokeColorH}
                    strokeWidth={strokeWidthH}
                    x={0}
                    y={indexH * 15 + 10}
                  />
                );
              })}
              {[...Array(100)].map((_, indexV) => {
                let strokeColorV = "lightgray";
                let strokeWidthV = 1;
                if (indexV === axis.OriginV + 20) {
                  strokeColorV = "darkgray";
                  strokeWidthV = 2;
                }
                return (
                  <Line
                    key={`x${indexV}`}
                    points={[0, 0, 0, 500]}
                    stroke={strokeColorV}
                    strokeWidth={strokeWidthV}
                    x={indexV * 15 + 10}
                    y={0}
                  />
                );
              })}
            </Layer>
            <Layer>
              <Rect
                x={rectPoints[0].x}
                y={rectPoints[0].y}
                fill="red"
                opacity={0.5}
                width={30}
                height={30}
                stroke="black"
              />
              <Rect
                x={rectPoints[1].x}
                y={rectPoints[1].y}
                fill="blue"
                opacity={0.5}
                width={30}
                height={30}
                stroke="black"
              />
              <Rect
                x={rectPoints[2].x}
                y={rectPoints[2].y}
                fill="green"
                opacity={0.5}
                width={30}
                height={30}
                stroke="black"
              />
              <Rect
                x={rectPoints[3].x}
                y={rectPoints[3].y}
                fill="yellow"
                opacity={0.5}
                width={30}
                height={30}
                stroke="black"
              />
              <Circle
                x={OriginV * 15 + 310}
                y={OriginH * 15 + 10}
                fill="black"
                opacity={0.5}
                radius={3}
                stroke="black"
              />
            </Layer>
            <Layer draggable={true} onDragStart={dragTrack}>
              <Rect
                x={point.PointX * 15 + 310}
                y={point.PointY * 15 + 10}
                fill={fillPattern[0]}
                opacity={0.2}
                width={30}
                height={30}
                stroke="black"
              />
              <Rect
                x={point.PointX * 15 + 340}
                y={point.PointY * 15 + 10}
                fill={fillPattern[1]}
                opacity={0.2}
                width={30}
                height={30}
                stroke="black"
              />
              <Rect
                x={point.PointX * 15 + 310}
                y={point.PointY * 15 + 40}
                fill={fillPattern[2]}
                opacity={0.2}
                width={30}
                height={30}
                stroke="black"
              />
              <Rect
                x={point.PointX * 15 + 340}
                y={point.PointY * 15 + 40}
                fill={fillPattern[3]}
                opacity={0.2}
                width={30}
                height={30}
                stroke="black"
              />
            </Layer>
          </Stage>
          <button onClick={newGrid}>Reset Graph</button>
          <button onClick={flipHorizon}>Flip Horizontal</button>
          <button onClick={flipVertical}>Flip Vertical</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default Reflection;

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

//not really working yet, loop for react element

{
  /* <Rect  
    key={9}
    fill='red'
    width={30}
    height={10}
    stroke='black'
    strokeWidth={1}
    x={100*4}
    y={100}
    /> */
}
