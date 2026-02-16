import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

const imageColors = ["red", "blue", "green", "yellow"];

function Reflection({ triggerNewProblem }) {
  // Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width, height } = useWindowDimensions();

  // Move module-level state to component scope with lazy initializers
  const [axis, setAxis] = useState(() => ({
    OriginH: randomNum(10) + 5,
    OriginV: randomNum(10) + 5,
  }));
  const [point, setPoint] = useState(() => ({
    PointX: randomNum(10),
    PointY: randomNum(10),
  }));
  const [rectPoints, setRectPoints] = useState(() => {
    const initPoint = {
      PointX: randomNum(10),
      PointY: randomNum(10),
    };
    return [
      { x: initPoint.PointX * 15 + 310, y: initPoint.PointY * 15 + 10 },
      { x: initPoint.PointX * 15 + 340, y: initPoint.PointY * 15 + 10 },
      { x: initPoint.PointX * 15 + 310, y: initPoint.PointY * 15 + 40 },
      { x: initPoint.PointX * 15 + 340, y: initPoint.PointY * 15 + 40 },
    ];
  });
  const [layerX, setLayerX] = useState(0);
  const [fillPattern, setFillPattern] = useState(imageColors);

  const newGrid = () => {
    const newPointX = randomNum(10);
    const newPointY = randomNum(10);
    const newOriginH = randomNum(10) + 5;
    const newOriginV = randomNum(10) + 5;
    setPoint({ PointX: newPointX, PointY: newPointY });
    setAxis({ OriginH: newOriginH, OriginV: newOriginV });
    setRectPoints([
      { x: newPointX * 15 + 310, y: newPointY * 15 + 10 },
      { x: newPointX * 15 + 340, y: newPointY * 15 + 10 },
      { x: newPointX * 15 + 310, y: newPointY * 15 + 40 },
      { x: newPointX * 15 + 340, y: newPointY * 15 + 40 },
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
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          Explore reflections! Drag the transparent shape to see how it reflects across the axes.
          Use the buttons to flip the shape.
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Light background container for grid and shapes */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 900)} height={500}>
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
              x={axis.OriginV * 15 + 310}
              y={axis.OriginH * 15 + 10}
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
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons */}
      <InteractionSection>
        <ButtonContainer>
          <ActionButton onClick={newGrid}>Reset Grid</ActionButton>
          <ActionButton onClick={flipHorizon}>Flip Horizontal</ActionButton>
          <ActionButton onClick={flipVertical}>Flip Vertical</ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Educational content */}
        <ExplanationSection>
          <ExplanationText>
            <strong>About Reflections:</strong> A reflection flips a shape across a line (axis).
            The reflected shape is the same distance from the axis as the original, but on the opposite side.
          </ExplanationText>
          <ExplanationText>
            <strong>Horizontal Flip:</strong> Flips the shape across the horizontal axis (left ↔ right).
          </ExplanationText>
          <ExplanationText>
            <strong>Vertical Flip:</strong> Flips the shape across the vertical axis (top ↔ bottom).
          </ExplanationText>
        </ExplanationSection>
      </InteractionSection>
    </Wrapper>
  );
}

export default Reflection;

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

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    margin: 12px 0;
  }
`;

const ActionButton = styled.button`
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
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
