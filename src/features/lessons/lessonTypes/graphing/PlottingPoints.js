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
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          The point ({PointX}, {PointY}) is plotted on the coordinate plane below.
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Light background container for grid */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={350}>
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
      </VisualSection>

      {/* Section 4 & 5: InteractionSection with educational content */}
      <InteractionSection>
        <ExplanationSection>
          <ExplanationText>
            <strong>Understanding Coordinate Planes:</strong> A coordinate plane has two perpendicular axes that intersect at the origin (0, 0).
          </ExplanationText>
          <ExplanationText>
            <strong>The x-coordinate</strong> shows how far left or right the point is from the origin. Positive values go right, negative go left.
          </ExplanationText>
          <ExplanationText>
            <strong>The y-coordinate</strong> shows how far up or down the point is from the origin. Positive values go up, negative go down.
          </ExplanationText>
          <ExplanationText>
            The point ({PointX}, {PointY}) means: move {Math.abs(PointX)} unit{Math.abs(PointX) !== 1 ? 's' : ''} {PointX >= 0 ? 'right' : 'left'}, then {Math.abs(PointY)} unit{Math.abs(PointY) !== 1 ? 's' : ''} {PointY >= 0 ? 'up' : 'down'}.
          </ExplanationText>
        </ExplanationSection>
      </InteractionSection>
    </Wrapper>
  );
}

export default PlottingPoints;

// Styled Components

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;

  @media (max-width: 1024px) {
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const QuestionSection = styled.div`
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const QuestionText = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const VisualSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;

  @media (max-width: 1024px) {
    margin: 16px 0;
    padding: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 8px;
  }
`;

const InteractionSection = styled.div`
  margin-top: 20px;

  @media (max-width: 1024px) {
    margin-top: 16px;
  }
`;

const ExplanationSection = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;

  @media (max-width: 1024px) {
    padding: 16px;
    margin-top: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #2d3748;
  margin: 12px 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
    margin: 10px 0;
  }
`;
