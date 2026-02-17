import React, { useState } from "react";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, RegularPolygon, Line, Rect } from "react-konva";

/**
 * ReflectionSymmetry - Interactive exploration of reflection symmetry lines
 * Students drag a line of symmetry to align it with the axis of a polygon
 * Demonstrates which shapes have lines of symmetry and where they are
 */
function ReflectionSymmetry({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const generateShape = () => {
    const sides = Math.floor(Math.random() * 7) + 3; // 3-9 sides
    return {
      sides,
      x: 200,
      y: 150,
      radius: 80,
      rotation: Math.floor(Math.random() * 360),
    };
  };

  const [shape, setShape] = useState(generateShape());
  const [lineX, setLineX] = useState(200);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleNewShape = () => {
    setShape(generateShape());
    setLineX(200);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleLineDrag = (e) => {
    const newX = e.target.x();
    setLineX(newX);

    // Check if line is close to center of shape (within 10 pixels)
    const distance = Math.abs(newX - shape.x);
    setIsCorrect(distance < 10);
  };

  const canvasWidth = Math.min(width - 40, 600);
  const canvasHeight = 300;

  const hint = "Drag the line to show where the line of symmetry is for this shape!";

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
        {isCorrect && (
          <FeedbackText>
            ✓ Perfect! You found the line of symmetry!
          </FeedbackText>
        )}
      </QuestionSection>

      {/* 2. VisualSection - Interactive symmetry line */}
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
          </Layer>

          {/* Shape Layer */}
          <Layer>
            <RegularPolygon
              x={shape.x}
              y={shape.y}
              fill="red"
              opacity={0.5}
              radius={shape.radius}
              stroke={konvaTheme.shapeStroke}
              sides={shape.sides}
              strokeWidth={2}
              rotation={shape.rotation}
            />
          </Layer>

          {/* Draggable Line Layer */}
          <Layer>
            <Line
              draggable
              points={[0, 0, 0, canvasHeight]}
              y={0}
              x={lineX}
              stroke={isCorrect ? "#48BB78" : konvaTheme.shapeStroke}
              strokeWidth={isCorrect ? 6 : 2}
              onDragMove={handleLineDrag}
              dragBoundFunc={(pos) => {
                return {
                  x: Math.max(20, Math.min(pos.x, canvasWidth - 20)),
                  y: 0,
                };
              }}
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control buttons */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}
        <NewShapeButton onClick={handleNewShape}>
          Try Another Shape
        </NewShapeButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      {showHint && (
        <ExplanationSection>
          <ExplanationTitle>Understanding Reflection Symmetry</ExplanationTitle>
          <ExplanationText>
            <strong>Reflection symmetry</strong> (also called line symmetry) occurs when a shape can be
            divided by a line so that one half is a mirror image of the other half.
          </ExplanationText>
          <ExplanationText>
            <strong>Key Concepts:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Line of symmetry:</strong> The line that divides a shape into two mirror-image halves
            </li>
            <li>
              <strong>Regular polygons:</strong> Shapes with equal sides have multiple lines of symmetry
            </li>
            <li>
              <strong>Number of lines:</strong> A regular n-sided polygon has n lines of symmetry
            </li>
            <li>
              <strong>Mirror image:</strong> Each point on one side has a matching point on the other side,
              the same distance from the line
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Examples:</strong>
          </ExplanationText>
          <PropertyList>
            <li>A triangle (3 sides) has 3 lines of symmetry</li>
            <li>A square (4 sides) has 4 lines of symmetry</li>
            <li>A pentagon (5 sides) has 5 lines of symmetry</li>
            <li>A circle has infinite lines of symmetry</li>
          </PropertyList>
          <ExplanationText>
            The line will turn <strong style={{ color: "#48BB78" }}>green</strong> when you've correctly
            positioned it on a line of symmetry!
          </ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default ReflectionSymmetry;

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
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #48BB78;
  margin: 10px 0 0 0;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 768px) {
    font-size: 20px;
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

const NewShapeButton = styled.button`
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
