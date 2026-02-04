import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

let PointX = randomNum(20) + 5;
let PointY = randomNum(5) + 5;
let OriginH = 20;
let OriginV = 15;

function SlopeTriangle(props) {
  const [axis, setAxis] = useState({ OriginH, OriginV });
  const [point, setPoint] = useState({ PointX, PointY });
  const [layerX, setLayerX] = useState({ x: 0, y: 0 });
  const [practice, setPractice] = useState(false);
  const [showY, setShowY] = useState(false);
  const [showX, setShowX] = useState(false);
  const [answer, setAnswer] = useState(false);
  const handlePractice = () => {
    setPractice(true);
  };
  const newGrid = () => {
    OriginH = 20;
    OriginV = 15;
    PointX = randomNum(20) + 20;
    PointY = randomNum(5) + 5;
    setPoint({ PointX, PointY });
    setAxis({ OriginH, OriginV });
    setLayerX({ x: 0, y: 0 });
    setShowY(false);
    setShowX(false);
    setAnswer(false);
  };
  const dragTrack = (e) => {
    setLayerX(0);
  };
  const toggleY = () => {
    setShowY(!showY);
  };
  const toggleX = () => {
    setShowX(!showX);
  };
  const toggleAnswer = () => {
    setAnswer(!answer);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer>
              {[...Array(30)].map((_, indexH) => {
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
              <Line
                points={[
                  OriginV * 15 + 310,
                  OriginH * 15 + 10,
                  point.PointX * 15 + 310,
                  point.PointY * 15 + 10,
                ]}
                stroke={"red"}
                strokeWidth={3}
              />
              <Line
                points={[
                  point.PointX * 15 + 310,
                  point.PointY * 15 + 10,
                  point.PointX * 15 + 310,
                  OriginH * 15 + 10,
                ]}
                stroke={"blue"}
                strokeWidth={15}
                opacity={0.4}
              />
              <Line
                points={[
                  OriginV * 15 + 310,
                  OriginH * 15 + 10,
                  point.PointX * 15 + 310,
                  OriginH * 15 + 10,
                ]}
                stroke={"green"}
                strokeWidth={15}
                opacity={0.4}
              />
              <Circle
                x={point.PointX * 15 + 310}
                y={point.PointY * 15 + 10}
                fill="black"
                radius={8}
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
              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"blue"}
                text={showY ? `${OriginH - point.PointY}` : `▲y`}
                x={point.PointX * 15 + 310 + 10}
                y={(point.PointY * 15 + 10 + OriginH * 15 + 10) / 2}
                opacity={0.4}
                wrap={"word"}
                onClick={toggleY}
              />
              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"green"}
                text={showX ? `${-1 * (OriginV - point.PointX)}` : `▲x`}
                x={(OriginV * 15 + 310 + point.PointX * 15 + 310) / 2}
                y={OriginH * 15 + 10 + 10}
                opacity={0.4}
                wrap={"word"}
                onClick={toggleX}
              />
              {answer && (
                <Text
                  fontSize={50}
                  fontStyle={"bold"}
                  fill={"blue"}
                  text={answer ? `${OriginH - point.PointY}/${-1 * (OriginV - point.PointX)}` : ``}
                  x={point.PointX}
                  y={(point.PointY * 15 + 10 + OriginH * 15 + 10) / 2}
                  opacity={0.4}
                  wrap={"word"}
                  onClick={toggleY}
                />
              )}
            </Layer>
          </Stage>
          <button onClick={newGrid}>New Slope Triangle</button>
          <button onClick={toggleAnswer}>{answer ? "hide answer" : "Show Answer"}</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default SlopeTriangle;

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
