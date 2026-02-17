import React, { useState } from "react";
import styled from "styled-components";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { Stage, Layer, Circle, Line, Text, Rect } from "react-konva";

/**
 * TriangleInequality - Interactive demonstration of the triangle inequality theorem
 * Students drag the endpoints to see when three sides can form a triangle
 * Demonstrates that the sum of two sides must be greater than the third side
 */
function TriangleInequality({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const generatePoints = () => [
    { id: 0, x: 328, y: 43 },   // Top left endpoint (draggable)
    { id: 1, x: 250, y: 190 },  // Bottom left corner (fixed)
    { id: 2, x: 855, y: 190 },  // Bottom right corner (fixed)
    { id: 3, x: 700, y: 63 },   // Top right endpoint (draggable)
  ];

  const [points, setPoints] = useState(generatePoints());
  const [showHint, setShowHint] = useState(false);

  const handleReset = () => {
    setPoints(generatePoints());
    setShowHint(false);
  };

  const handleDrag = (e) => {
    const draggedId = e.target.attrs.id;
    const newPoints = points.map((point) => {
      if (point.id !== draggedId) return point;
      return {
        ...point,
        x: e.target.x(),
        y: e.target.y(),
      };
    });
    setPoints(newPoints);
  };

  // Calculate side lengths using distance formula
  const sideA = Math.sqrt(
    Math.pow(points[1].y - points[0].y, 2) + Math.pow(points[1].x - points[0].x, 2)
  );
  const sideB = Math.sqrt(
    Math.pow(points[3].y - points[2].y, 2) + Math.pow(points[3].x - points[2].x, 2)
  );
  const sideC = Math.sqrt(
    Math.pow(points[2].y - points[1].y, 2) + Math.pow(points[2].x - points[1].x, 2)
  );

  // Triangle inequality theorem: sum of any two sides must be greater than the third
  const canFormTriangle = sideC < sideA + sideB;

  const canvasWidth = Math.min(width - 40, 1100);
  const canvasHeight = 350;

  const hint = "Drag the red endpoints to explore when three sides can form a triangle!";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}
      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>
          {/* Question text hidden until hint button clicked */}
        </QuestionText>
      </QuestionSection>

      {/* 2. VisualSection - Interactive triangle inequality */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          {/* Background Layer */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Feedback text */}
            <Text
              fontSize={24}
              fontStyle="bold"
              fill={canFormTriangle ? "#48BB78" : "#EF4444"}
              text={
                canFormTriangle
                  ? "✓ The two sides can reach!"
                  : "✗ The two sides aren't long enough"
              }
              x={40}
              y={30}
              width={400}
              wrap="word"
            />
          </Layer>

          {/* Side labels and bars Layer */}
          <Layer>
            {/* Side A (green) - length bar */}
            <Rect
              stroke="#48BB78"
              strokeWidth={2}
              x={points[1].x}
              y={points[1].y + 30}
              width={sideA}
              height={12}
              fill="#48BB78"
              opacity={0.4}
            />
            {/* Side A label */}
            <Text
              fontSize={32}
              fontStyle="bold"
              fill="#48BB78"
              text={sideA.toFixed(1)}
              x={350}
              y={260}
            />

            {/* Side B (orange) - length bar */}
            <Rect
              stroke="#F59E0B"
              strokeWidth={2}
              x={points[2].x - sideB}
              y={points[2].y + 30}
              width={sideB}
              height={12}
              fill="#F59E0B"
              opacity={0.4}
            />
            {/* Side B label */}
            <Text
              fontSize={32}
              fontStyle="bold"
              fill="#F59E0B"
              text={sideB.toFixed(1)}
              x={650}
              y={260}
            />

            {/* Side C (base) label */}
            <Text
              fontSize={32}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              text={sideC.toFixed(0)}
              x={500}
              y={150}
            />
          </Layer>

          {/* Triangle lines Layer */}
          <Layer>
            {/* Side A (green line) */}
            <Line
              stroke="#48BB78"
              strokeWidth={4}
              points={[points[1].x, points[1].y, points[0].x, points[0].y]}
            />

            {/* Side C (base - black line) */}
            <Line
              stroke={konvaTheme.shapeStroke}
              strokeWidth={4}
              points={[points[1].x, points[1].y, points[2].x, points[2].y]}
            />

            {/* Side B (orange line) */}
            <Line
              stroke="#F59E0B"
              strokeWidth={4}
              points={[points[2].x, points[2].y, points[3].x, points[3].y]}
            />

            {/* Endpoint circles */}
            {points.map((p, i) => {
              const isDraggable = i === 0 || i === 3;
              return (
                <Circle
                  key={p.id}
                  id={i}
                  radius={isDraggable ? 10 : 6}
                  stroke={
                    isDraggable
                      ? canFormTriangle
                        ? "#48BB78"
                        : "#EF4444"
                      : konvaTheme.shapeStroke
                  }
                  strokeWidth={isDraggable ? 4 : 2}
                  x={p.x}
                  y={p.y}
                  fill={isDraggable ? "#EF4444" : konvaTheme.shapeStroke}
                  draggable={isDraggable}
                  onDragMove={handleDrag}
                  dragBoundFunc={(pos) => {
                    return {
                      x: Math.max(20, Math.min(pos.x, canvasWidth - 20)),
                      y: Math.max(20, Math.min(pos.y, 200)),
                    };
                  }}
                />
              );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control button */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}
        <ResetButton onClick={handleReset}>
          Reset Position
        </ResetButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      <ExplanationSection>
        <ExplanationTitle>Understanding the Triangle Inequality Theorem</ExplanationTitle>
        <ExplanationText>
          <strong>Triangle Inequality Theorem:</strong> For any triangle, the sum of the lengths of
          any two sides must be greater than the length of the third side.
        </ExplanationText>
        <FormulaBox>
          a + b &gt; c
        </FormulaBox>
        <ExplanationText>
          <strong>Why this matters:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Can form a triangle:</strong> If two sides can "reach" when stretched toward each
            other across the base, they can form a triangle
          </li>
          <li>
            <strong>Cannot form a triangle:</strong> If the two sides are too short to meet, no
            triangle is possible
          </li>
          <li>
            <strong>Edge case:</strong> If a + b = c exactly, the three sides would lie flat in a
            straight line (degenerate triangle)
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>In this visualization:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong style={{ color: "#48BB78" }}>Green side (a):</strong> Drag the top-left red endpoint
          </li>
          <li>
            <strong style={{ color: "#F59E0B" }}>Orange side (b):</strong> Drag the top-right red endpoint
          </li>
          <li>
            <strong>Black base (c):</strong> Fixed length at the bottom
          </li>
          <li>
            The colored bars below show you can physically "add" the two side lengths
          </li>
          <li>
            Watch how the endpoints turn <strong style={{ color: "#48BB78" }}>green</strong> when
            they can reach!
          </li>
        </PropertyList>
      </ExplanationSection>
    </Wrapper>
  );
}

export default TriangleInequality;

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
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 20px;
    padding: 16px 32px;
  }

  @media (min-width: 1024px) {
    font-size: 22px;
    padding: 18px 36px;
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

const FormulaBox = styled.div`
  background-color: #e6fffa;
  border: 2px solid #4299e1;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 20px;
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

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
    padding: 5px 10px;
    font-size: 12px;
  }

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
    border-color: ${props => props.theme.colors.borderDark};
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;

  @media (max-width: 1024px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 14px;
  }
`;
