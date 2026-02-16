import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

/**
 * Dilation - Interactive exploration of dilation (scaling) transformations
 * Students click the transparent square to see it dilate (scale) by 2x from the center of dilation.
 * Demonstrates how dilation changes size but preserves shape and angles.
 */
function Dilation() {
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

  const [layerX, setLayerX] = useState({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });

  const newGrid = () => {
    const newOriginH = randomNum(10) + 5;
    const newOriginV = randomNum(10) + 10;
    const newPointX = randomNum(10) + 5;
    const newPointY = randomNum(10) + 5;

    setPoint({ PointX: newPointX, PointY: newPointY });
    setAxis({ OriginH: newOriginH, OriginV: newOriginV });
    setLayerX({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });
  };

  const handleDilation = () => {
    // Apply 2x scale from center of dilation (the origin point)
    const tempAttrs = {
      offsetX: point.PointX,
      offsetY: point.PointY,
      scaleX: 2,
      scaleY: 2,
    };
    setLayerX(tempAttrs);
  };

  return (
    <Wrapper>
      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>
          Click the transparent square to dilate it (scale by 2x). Watch how the size changes while the shape stays similar!
        </QuestionText>
      </QuestionSection>

      {/* 2. VisualSection - Grid and clickable squares */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 1300)} height={500}>
          {/* Grid Layer */}
          <Layer>
            {/* Horizontal grid lines */}
            {[...Array(38)].map((_, indexH) => {
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
            {[...Array(110)].map((_, indexV) => {
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

            {/* Center of dilation point */}
            <Circle
              x={axis.OriginV * 15 + 310}
              y={axis.OriginH * 15 + 10}
              fill="black"
              opacity={0.5}
              radius={3}
              stroke="black"
            />
          </Layer>

          {/* Fixed Squares Layer - Original size */}
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

          {/* Dilatable Squares Layer - Transparent copy that scales */}
          <Layer
            scaleX={layerX.scaleX}
            scaleY={layerX.scaleY}
            onClick={handleDilation}
            offsetX={layerX.offsetX}
            offsetY={layerX.offsetY}
          >
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
        <ExplanationTitle>Understanding Dilation</ExplanationTitle>
        <ExplanationText>
          <strong>Dilation</strong> is a transformation that changes the size of a shape by
          scaling it from a center point (center of dilation).
        </ExplanationText>
        <ExplanationText>
          <strong>Key Properties:</strong>
        </ExplanationText>
        <PropertyList>
          <li><strong>Changes size:</strong> The shape gets larger or smaller based on the scale factor</li>
          <li><strong>Preserves shape:</strong> The shape remains similar (same angles, proportions)</li>
          <li><strong>Preserves angles:</strong> All angles in the shape stay the same</li>
          <li><strong>Scale factor:</strong> This example uses a scale factor of 2 (doubles the size)</li>
          <li><strong>Center point:</strong> The black dot is the center of dilation</li>
        </PropertyList>
        <ExplanationText>
          <strong>Scale Factor Concept:</strong>
        </ExplanationText>
        <PropertyList>
          <li>Scale factor &gt; 1: Enlargement (shape gets bigger)</li>
          <li>Scale factor = 1: No change (original size)</li>
          <li>0 &lt; Scale factor &lt; 1: Reduction (shape gets smaller)</li>
        </PropertyList>
        <ExplanationText>
          Click the transparent square to see dilation in action. Notice how the shape doubles
          in size but keeps the same proportions and angles!
        </ExplanationText>
      </ExplanationSection>
    </Wrapper>
  );
}

export default Dilation;

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
