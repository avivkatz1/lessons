import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, Shape, Text } from "react-konva";
import { AnswerInput } from "../../../../shared/components";

const getTanFromDegrees = (degrees) => {
  return Math.tan((degrees * Math.PI) / 180);
};

/**
 * Tangent - Interactive exploration of the tangent ratio
 * Students click on side labels to reveal unknown sides using tan(θ) = opposite/adjacent
 * Simpler version focused on basic tangent ratio understanding
 */
function Tangent() {
  const [angleDegree, setAngleDegree] = useState(30);
  const [sideLength, setSideLength] = useState(numbers(1, 50)[0] + 1);
  const [solveY, setSolveY] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { width } = useWindowDimensions();

  const newSlope = () => {
    setAngleDegree(numbers(1, 89)[0]);
    setSideLength(numbers(1, 50)[0] + 1);
    setSolveY(numbers(1, 10)[0] > 4);
    setShowAnswer(false);
    setShowHint(false);
  };

  const correctAnswer = solveY
    ? (getTanFromDegrees(angleDegree) * sideLength).toFixed(2)
    : (sideLength / getTanFromDegrees(angleDegree)).toFixed(2);

  const oppositeValue = solveY
    ? (showAnswer ? correctAnswer : "x")
    : sideLength;

  const adjacentValue = solveY
    ? sideLength
    : (showAnswer ? correctAnswer : "x");

  const hint = "Use the tangent ratio to calculate the missing side. tan(θ) = opposite / adjacent";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* 2. VisualSection - Right triangle */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 900)} height={500}>
          <Layer>
            {/* Right Triangle Shape */}
            <Shape
              sceneFunc={(context, shape) => {
                context.beginPath();
                context.moveTo(619, 50);
                context.lineTo(619, 350);
                context.lineTo(850, 350);
                context.closePath();
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

            {/* Angle Label */}
            <Text
              fontSize={50}
              fontStyle="bold"
              fill="blue"
              text={`${angleDegree}°`}
              opacity={0.4}
              x={590}
              y={225}
            />

            {/* Opposite Side Label (Vertical) */}
            <Text
              fontSize={50}
              fontStyle="bold"
              fill="black"
              text={oppositeValue}
              x={820}
              y={160}
              opacity={1}
            />

            {/* Adjacent Side Label (Horizontal) */}
            <Text
              fontSize={50}
              fontStyle="bold"
              fill="black"
              text={adjacentValue}
              x={633}
              y={283}
              opacity={1}
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Answer input and controls */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && (
              <HintBox>{hint}</HintBox>
            )}
            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="number"
                onCorrect={() => setShowAnswer(true)}
                onTryAnother={newSlope}
                disabled={showAnswer}
                placeholder="x = ?"
              />
            </AnswerInputContainer>
          </>
        )}
        <NewProblemButton onClick={newSlope}>
          New Triangle
        </NewProblemButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
      <ExplanationSection>
        <ExplanationTitle>Understanding the Tangent Ratio</ExplanationTitle>
        <ExplanationText>
          <strong>Tangent (tan)</strong> is a trigonometric ratio that relates an angle in a right
          triangle to the lengths of two sides.
        </ExplanationText>
        <ExplanationText>
          <strong>Formula:</strong>
        </ExplanationText>
        <FormulaBox>
          tan(θ) = opposite / adjacent
        </FormulaBox>
        <ExplanationText>
          <strong>How to use it:</strong>
        </ExplanationText>
        <PropertyList>
          <li><strong>Find opposite side:</strong> opposite = tan(θ) × adjacent</li>
          <li><strong>Find adjacent side:</strong> adjacent = opposite / tan(θ)</li>
          <li><strong>Find angle:</strong> θ = arctan(opposite / adjacent)</li>
        </PropertyList>
        <ExplanationText>
          In this triangle:
        </ExplanationText>
        <PropertyList>
          <li>The angle is {angleDegree}°</li>
          <li>The blue side is the hypotenuse (not used in tangent)</li>
          <li>The answer x = {correctAnswer}</li>
        </PropertyList>
      </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Tangent;

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

const NewProblemButton = styled.button`
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

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media (min-width: 768px) {
    margin: 15px 0;
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
