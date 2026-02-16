import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, Circle, Line, Rect } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

function PlottingPoints({ triggerProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width, height } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const coordinates = lessonProps.question[0].map((item) => item.text);

  const PointX = coordinates[0];
  const PointY = coordinates[1];
  const OriginV = coordinates[2];
  const OriginH = coordinates[3];
  const [axis, setAxis] = useState({ OriginH, OriginV });
  const [point, setPoint] = useState({ PointX, PointY });
  const [practice, setPractice] = useState(false);
  const handlePractice = () => {
    setPractice(true);
  };
  const newGrid = () => {};

  return (
    <Wrapper>
      <div className="practice-container">
        <Stage width={width} height={350}>
          <Layer>
            <Rect x={0} y={0} width={width} height={350} fill={konvaTheme.canvasBackground} />
            {[...Array(20)].map((_, indexH) => {
              let strokeColorH = konvaTheme.gridRegular;
              let strokeWidthH = 3;
              let zIndex = 5;
              if (indexH === OriginH) {
                strokeColorH = konvaTheme.gridOrigin;
                strokeWidthH = 6;
                zIndex = 50;
              }
              return (
                <Line
                  key={`y${indexH}`}
                  points={[0, 0, width, 0]}
                  stroke={strokeColorH}
                  strokeWidth={strokeWidthH}
                  x={0}
                  y={indexH * (height / 20) + 5}
                  zIndex={zIndex}
                />
              );
            })}
            {[...Array(20)].map((_, indexV) => {
              let strokeColorV = konvaTheme.gridRegular;
              let strokeWidthV = 3;
              let z2Index = 0;
              if (indexV === OriginV) {
                strokeColorV = konvaTheme.gridOrigin;
                strokeWidthV = 6;
                z2Index = 50;
              }
              return (
                <Line
                  key={`x${indexV}`}
                  points={[0, 0, 0, height]}
                  stroke={strokeColorV}
                  strokeWidth={strokeWidthV}
                  x={indexV * (width / 20) + 5}
                  y={0}
                  zIndex={z2Index}
                />
              );
            })}
          </Layer>
          <Layer>
            <Circle
              x={OriginV * (width / 20) + 5 + PointX * (width / 20)}
              y={OriginH * (height / 20) + 5 - PointY * (height / 20)}
              fill={konvaTheme.point}
              opacity={1}
              radius={14}
              stroke={konvaTheme.shapeStroke}
            />
            <Circle
              x={OriginV * (width / 20) + 5}
              y={OriginH * (height / 20) + 5}
              fill={konvaTheme.shapeStroke}
              opacity={1}
              radius={6}
              stroke={konvaTheme.shapeStroke}
            />
          </Layer>
        </Stage>
      </div>
    </Wrapper>
  );
}

export default PlottingPoints;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 350px;

  .practice-container {
    align-items: center;
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
