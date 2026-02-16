import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

/**
 * Translation - Interactive exploration of translation (sliding) transformations
 * Students drag a 2x2 colored square grid to explore how translations preserve
 * shape and size while changing position.
 */
function Translation() {
  const { width } = useWindowDimensions();

  // Initialize state inside component (was module-level)
  const [axis, setAxis] = useState(() => ({
    OriginH: randomNum(10) + 5,
    OriginV: randomNum(10) + 10
  }));

  const [point, setPoint] = useState(() => ({
    PointX: randomNum(10) + 5,
    PointY: randomNum(10) + 5
  }));

  const [layerX, setLayerX] = useState({ x: 0, y: 0 });

  const newGrid = () => {
    const newOriginH = randomNum(10) + 5;
    const newOriginV = randomNum(10) + 10;
    const newPointX = randomNum(10) + 5;
    const newPointY = randomNum(10) + 5;

    setPoint({ PointX: newPointX, PointY: newPointY });
    setAxis({ OriginH: newOriginH, OriginV: newOriginV });
    setLayerX({ x: 0, y: 0 });
  };

  const dragTrack = () => {
    // Reset layer position tracking on drag start
    setLayerX({ x: 0, y: 0 });
  };

  return (
    <Wrapper>
      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>
          Drag the colored square to explore translation (sliding). The shape preserves its size and orientation!
        </QuestionText>
      </QuestionSection>

      {/* 2. VisualSection - Grid and draggable squares */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 1300)} height={500}>
          {/* Grid Layer */}
          <Layer>
            {/* Horizontal grid lines */}
            {[...Array(50)].map((_, indexH) => {
              const isAxisLine = indexH === axis.OriginH;
              return (
                <Line
                  key={`y${indexH}`}
                  points={[0, 0, 1300, 0]}
                  stroke={isAxisLine ? "darkgray" : "lightgray"}
                  strokeWidth={isAxisLine ? 2 : 1}
                  x={0}
                  y={indexH * 15 + 10}
                />
              );
            })}

            {/* Vertical grid lines */}
            {[...Array(100)].map((_, indexV) => {
              const isAxisLine = indexV === axis.OriginV + 20;
              return (
                <Line
                  key={`x${indexV}`}
                  points={[0, 0, 0, 500]}
                  stroke={isAxisLine ? "darkgray" : "lightgray"}
                  strokeWidth={isAxisLine ? 2 : 1}
                  x={indexV * 15 + 10}
                  y={0}
                />
              );
            })}

            {/* Origin point */}
            <Circle
              x={axis.OriginV * 15 + 310}
              y={axis.OriginH * 15 + 10}
              fill="black"
              opacity={0.5}
              radius={3}
              stroke="black"
            />
          </Layer>

          {/* Fixed Squares Layer - Original position */}
          <Layer>
            <Rect
              x={point.PointX * 15 + 310}
              y={point.PointY * 15 + 10}
              fill="red"
              opacity={0.5}
              width={30}
              height={30}
              stroke="black"
            />
            <Rect
              x={point.PointX * 15 + 340}
              y={point.PointY * 15 + 10}
              fill="blue"
              opacity={0.5}
              width={30}
              height={30}
              stroke="black"
            />
            <Rect
              x={point.PointX * 15 + 310}
              y={point.PointY * 15 + 40}
              fill="green"
              opacity={0.5}
              width={30}
              height={30}
              stroke="black"
            />
            <Rect
              x={point.PointX * 15 + 340}
              y={point.PointY * 15 + 40}
              fill="yellow"
              opacity={0.5}
              width={30}
              height={30}
              stroke="black"
            />
          </Layer>

          {/* Draggable Squares Layer - Transparent copy */}
          <Layer draggable x={layerX.x} y={layerX.y} onDragStart={dragTrack}>
            <Rect
              x={point.PointX * 15 + 310}
              y={point.PointY * 15 + 10}
              fill="red"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
            />
            <Rect
              x={point.PointX * 15 + 340}
              y={point.PointY * 15 + 10}
              fill="blue"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
            />
            <Rect
              x={point.PointX * 15 + 310}
              y={point.PointY * 15 + 40}
              fill="green"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
            />
            <Rect
              x={point.PointX * 15 + 340}
              y={point.PointY * 15 + 40}
              fill="yellow"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control button */}
      <InteractionSection>
        <ResetButton onClick={newGrid}>
          Reset Grid
        </ResetButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      <ExplanationSection>
        <ExplanationTitle>Understanding Translation</ExplanationTitle>
        <ExplanationText>
          <strong>Translation</strong> is a transformation that slides a shape to a new position
          without changing its size, shape, or orientation.
        </ExplanationText>
        <ExplanationText>
          <strong>Key Properties:</strong>
        </ExplanationText>
        <PropertyList>
          <li><strong>Preserves distance:</strong> All points move the same amount in the same direction</li>
          <li><strong>Preserves angles:</strong> The shape doesn't rotate or flip</li>
          <li><strong>Preserves size:</strong> The shape stays exactly the same size</li>
          <li><strong>Parallel lines:</strong> If you connect corresponding points, the lines are parallel</li>
        </PropertyList>
        <ExplanationText>
          Try dragging the transparent square around the grid. Notice how it stays the same
          size and orientation no matter where you move it - that's translation!
        </ExplanationText>
      </ExplanationSection>
    </Wrapper>
  );
}

export default Translation;

// Styled Components - TangentLesson 5-section layout standard

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 30px;
  }
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;

  @media (min-width: 768px) {
    padding: 30px;
    margin-bottom: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const ResetButton = styled.button`
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 20px;
    padding: 14px 28px;
  }

  @media (min-width: 1024px) {
    font-size: 22px;
    padding: 16px 32px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #68d391;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;

  @media (min-width: 768px) {
    padding: 25px;
    margin-top: 30px;
  }

  @media (min-width: 1024px) {
    padding: 30px;
  }
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2f855a;
  margin: 0 0 15px 0;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 768px) {
    font-size: 17px;
    margin-bottom: 15px;
  }

  @media (min-width: 1024px) {
    font-size: 18px;
  }
`;

const PropertyList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;

  li {
    font-size: 16px;
    color: #2d3748;
    line-height: 1.8;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      font-size: 17px;
      margin-bottom: 10px;
    }

    @media (min-width: 1024px) {
      font-size: 18px;
    }
  }
`;
