import React, { useState } from "react";
import styled from "styled-components";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { Stage, Layer, RegularPolygon, Text, Rect } from "react-konva";

/**
 * RotationalSymmetry - Interactive exploration of rotational symmetry
 * Students click on a polygon to rotate it and observe when it overlaps with the original
 * Demonstrates the concept of rotational symmetry orders
 */
function RotationalSymmetry({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const generateShape = () => {
    const sides = Math.floor(Math.random() * 8) + 3;
    return {
      sides,
      rotationAmount: 360 / (4 * sides),
      degrees: 0,
    };
  };

  const [shape, setShape] = useState(generateShape());
  const [showHint, setShowHint] = useState(false);

  const handleNewShape = () => {
    setShape(generateShape());
    setShowHint(false);
  };

  const handleClick = () => {
    let newRotation = shape.degrees + shape.rotationAmount;
    if (newRotation > 360) newRotation = shape.rotationAmount;

    setShape({
      ...shape,
      degrees: newRotation,
    });
  };

  const canvasWidth = Math.min(width - 40, 900);
  const canvasHeight = 300;
  const centerX = canvasWidth / 2;
  const centerY = 150;

  const hint = "Click on the blue polygon to rotate it. Watch how it aligns with the red outline!";

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

      {/* 2. VisualSection - Interactive rotation visualization */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Instruction text */}
            <Text
              x={centerX - 50}
              y={20}
              fontSize={14}
              fill={konvaTheme.labelText}
              text="Press to turn"
            />

            {/* Static polygon (red outline) */}
            <RegularPolygon
              sides={shape.sides}
              radius={100}
              fill="red"
              opacity={0.2}
              x={centerX}
              y={centerY}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2}
            />

            {/* Rotating polygon (blue) */}
            <RegularPolygon
              sides={shape.sides}
              radius={100}
              fill="blue"
              opacity={0.2}
              x={centerX}
              y={centerY}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2}
              rotation={shape.degrees}
              onClick={handleClick}
              style={{ cursor: 'pointer' }}
            />

            {/* Rotation counter */}
            <Text
              x={centerX + 120}
              y={centerY - 15}
              fontSize={24}
              fill={konvaTheme.labelText}
              text={`${shape.degrees.toFixed(0)}°`}
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control button */}
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
          <ExplanationTitle>Understanding Rotational Symmetry</ExplanationTitle>
          <ExplanationText>
            <strong>Rotational symmetry</strong> occurs when a shape looks the same after being rotated
            by less than a full turn (360°).
          </ExplanationText>
          <ExplanationText>
            <strong>Key Concepts:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Order of symmetry:</strong> The number of times a shape matches itself during a
              full 360° rotation
            </li>
            <li>
              <strong>Angle of rotation:</strong> 360° divided by the order of symmetry
            </li>
            <li>
              <strong>Center of rotation:</strong> The point around which the shape rotates
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>In this visualization:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              The <strong style={{ color: "red" }}>red polygon</strong> stays fixed in place
            </li>
            <li>
              The <strong style={{ color: "blue" }}>blue polygon</strong> rotates when you click it
            </li>
            <li>
              A <strong>{shape.sides}-sided polygon</strong> has rotational symmetry of order{" "}
              {shape.sides}
            </li>
            <li>
              It rotates by <strong>{(360 / shape.sides).toFixed(1)}°</strong> each time it matches
              the original
            </li>
          </PropertyList>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default RotationalSymmetry;

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
