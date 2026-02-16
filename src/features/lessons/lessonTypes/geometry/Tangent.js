import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, Shape, Text, Image } from "react-konva";
import { FaBullseye } from "react-icons/fa";

const getTanFromDegrees = (degrees) => {
  return Math.tan((degrees * Math.PI) / 180);
};

function Tangent(props) {
  const [showY, setShowY] = useState(false);
  const [showX, setShowX] = useState(false);
  const [angleDegree, setAngleDegree] = useState(30);
  const [sideLength, setSideLength] = useState(numbers(1, 50)[0] + 1);
  const [solveY, setSolveY] = useState(true);
  const [flash, setFlash] = useState(true);
  const { width, height } = useWindowDimensions();

  const newSlope = () => {
    setAngleDegree(numbers(1, 89)[0]);
    setSideLength(numbers(1, 50)[0] + 1);
    setShowY(false);
    setShowX(false);
    if (numbers(1, 10)[0] > 4) setSolveY(false);
    else setSolveY(true);
  };
  const showDrag = (e) => {};
  const toggleY = () => {
    setShowY(!showY);
  };
  const toggleX = () => {
    setShowX(!showX);
  };

  const showFlashlight = () => {};
  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={width} height={500}>
            <Layer
            // rotation={40} offsetX={500} offsetY={180} x={500} y ={180}
            >
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(619, 50);
                  context.lineTo(619, 350);
                  context.lineTo(850, 350);
                  context.closePath();
                  // (!) Konva specific method, it is very important
                  context.fillStrokeShape(shape);
                }}
                rotation={-90}
                fill="#00D2FF"
                stroke="black"
                strokeWidth={4}
                offsetX={682}
                offsetY={219}
                x={682}
                y={219}
              />

              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"blue"}
                text={`${angleDegree}°`}
                opacity={0.4}
                wrap={"word"}
                onClick={showFlashlight}
                x={590}
                y={225}
                // rotation={-40}
                // offsetY={-20}
              />

              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"black"}
                text={
                  solveY && showY
                    ? (getTanFromDegrees(angleDegree) * sideLength).toFixed(2)
                    : solveY && !showY
                      ? "x"
                      : sideLength
                }
                x={820}
                y={160}
                opacity={1}
                wrap={"word"}
                onClick={solveY ? toggleY : ""}
                // rotation={-40}
              />
              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"black"}
                text={
                  solveY
                    ? sideLength
                    : showX
                      ? (sideLength / getTanFromDegrees(angleDegree)).toFixed(2)
                      : "x"
                }
                x={633}
                y={283}
                opacity={1}
                wrap={"word"}
                onClick={solveY ? "" : toggleX}
                // rotation={-40}
                // offsetX={50}
              />
            </Layer>
          </Stage>
          <button onClick={newSlope}>New Slope Triangle</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default Tangent;

const Wrapper = styled.div`
  margin-top: 20px;
  button {
    background-color: blue;
    height: 50px;
    border-radius: 7px;
    font-size: 24px;
  }

  .practice-container {
    margin-top: 100px;
    /* display: flex; */
    /* justify-content: center; */
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
