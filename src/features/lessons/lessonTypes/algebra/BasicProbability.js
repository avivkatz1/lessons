import React, { useState } from "react";
import styled from "styled-components";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { Stage, Layer, RegularPolygon, Text, Rect } from "react-konva";

const numShapes = 10;

/**
 * BasicProbability - Interactive probability visualization
 * Students observe random patterns and see probability expressed in three formats
 * Demonstrates fraction, percentage, and decimal representations of probability
 */
function BasicProbability({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Generate initial random pattern
  const generatePattern = () =>
    [...Array(numShapes)].map(() => (Math.random() > 0.4 ? "red" : "white"));

  const [fillPattern, setFillPattern] = useState(generatePattern);
  const [showHint, setShowHint] = useState(false);

  // Calculate red count from current pattern
  const redCount = fillPattern.filter(color => color === "red").length;

  const changeFill = () => {
    setFillPattern(generatePattern());
    setShowHint(false);
  };

  const canvasWidth = Math.min(width - 40, 900);
  const canvasHeight = 300;

  const hint = "Observe the probability of getting a red shape!";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}
      {/* 1. QuestionSection - Instructions and probability display */}
      <QuestionSection>
        <QuestionText>
          {/* Question text hidden until hint button clicked */}
        </QuestionText>
        <ProbabilityDisplay>
          <ProbabilityFormat>
            <ProbabilityLabel>Fraction:</ProbabilityLabel>
            <ProbabilityValue color="#EF4444">{redCount}/10</ProbabilityValue>
          </ProbabilityFormat>
          <ProbabilityFormat>
            <ProbabilityLabel>Percentage:</ProbabilityLabel>
            <ProbabilityValue color="#EF4444">{redCount}0%</ProbabilityValue>
          </ProbabilityFormat>
          <ProbabilityFormat>
            <ProbabilityLabel>Decimal:</ProbabilityLabel>
            <ProbabilityValue color="#EF4444">0.{redCount}</ProbabilityValue>
          </ProbabilityFormat>
        </ProbabilityDisplay>
      </QuestionSection>

      {/* 2. VisualSection - Interactive probability visualization */}
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

            {/* Shape pattern */}
            {[...Array(numShapes)].map((_, index) => (
              <RegularPolygon
                key={index}
                x={100 + (canvasWidth - 200) * (index / (numShapes - 1))}
                y={150}
                fill={fillPattern[index]}
                opacity={0.6}
                radius={30}
                stroke={konvaTheme.shapeStroke}
                sides={5}
                strokeWidth={3}
              />
            ))}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control button */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}
        <ActionButton onClick={changeFill}>
          Generate New Pattern
        </ActionButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      {showHint && <ExplanationSection>
        <ExplanationTitle>Understanding Basic Probability</ExplanationTitle>
        <ExplanationText>
          <strong>Probability</strong> is a measure of how likely an event is to occur. It's expressed as
          a number between 0 (impossible) and 1 (certain).
        </ExplanationText>
        <ExplanationText>
          <strong>Three ways to express probability:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Fraction:</strong> {redCount}/10 means {redCount} red shapes out of 10 total shapes
          </li>
          <li>
            <strong>Percentage:</strong> {redCount}0% means {redCount}0 out of every 100 (multiply fraction by 100)
          </li>
          <li>
            <strong>Decimal:</strong> 0.{redCount} is the fraction written in decimal form (divide
            numerator by denominator)
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Key formula:</strong>
        </ExplanationText>
        <FormulaBox>
          Probability = (Number of favorable outcomes) / (Total number of outcomes)
        </FormulaBox>
        <ExplanationText>
          <strong>In this example:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Favorable outcomes:</strong> {redCount} red shapes (the event we're interested in)
          </li>
          <li>
            <strong>Total outcomes:</strong> 10 shapes total
          </li>
          <li>
            <strong>Probability of red:</strong> {redCount}/10 = {redCount}0% = 0.{redCount}
          </li>
          <li>
            <strong>Probability of white:</strong> {10 - redCount}/10 = {(10 - redCount) * 10}% = 0.{10 - redCount}
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Important concepts:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>All probabilities add to 1:</strong> The probability of getting red (0.{redCount}) plus
            the probability of getting white (0.{10 - redCount}) equals 1.0 (or 100%)
          </li>
          <li>
            <strong>Range:</strong> Probability is always between 0 and 1 (or 0% to 100%)
          </li>
          <li>
            <strong>Complementary events:</strong> If P(red) = 0.{redCount}, then P(not red) = 1 - 0.{redCount} = 0.{10 - redCount}
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Converting between formats:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Fraction to decimal:</strong> Divide the numerator by the denominator ({redCount} ÷ 10 = 0.{redCount})
          </li>
          <li>
            <strong>Decimal to percentage:</strong> Multiply by 100 (0.{redCount} × 100 = {redCount}0%)
          </li>
          <li>
            <strong>Percentage to fraction:</strong> Divide by 100 and simplify ({redCount}0% = {redCount}0/100 = {redCount}/10)
          </li>
        </PropertyList>
      </ExplanationSection>}
    </Wrapper>
  );
}

export default BasicProbability;

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
  margin: 0 0 20px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const ProbabilityDisplay = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const ProbabilityFormat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ProbabilityLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const ProbabilityValue = styled.p`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 36px;
  }

  @media (min-width: 1024px) {
    font-size: 40px;
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

const ActionButton = styled.button`
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
