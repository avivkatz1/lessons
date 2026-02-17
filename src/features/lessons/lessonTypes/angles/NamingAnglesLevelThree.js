import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Circle, Line, Arc, Text, Rect } from "react-konva";

/**
 * NamingAnglesLevelThree - Simple angle naming practice
 * Students name angles in clear, simple diagrams
 * Supports both text input and multiple choice interactions
 */
function NamingAnglesLevelThree({ triggerNewProblem }) {
  const { lessonProps, showAnswer, revealAnswer, hideAnswer } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [showHint, setShowHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Extract lesson data
  const question = lessonProps?.question?.[0]?.[0]?.text || "Name the angle indicated by the arc.";
  const answer = lessonProps?.answer?.[0]?.text;
  const acceptedAnswers = lessonProps?.acceptedAnswers || [];
  const hints = lessonProps?.hints || [];
  const explanation = lessonProps?.explanation?.[0]?.text;
  const visualData = lessonProps?.visualData || {};

  // Visual data
  const points = visualData.points || [];
  const lines = visualData.lines || [];
  const indicatedAngle = visualData.indicatedAngle || {};
  const interactionType = visualData.interactionType || "text";
  const options = visualData.options || [];

  // Format answer for AnswerInput
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers.length > 0) return acceptedAnswers;
    if (answer) return [answer];
    return [];
  }, [answer, acceptedAnswers]);

  const handleTryAnother = () => {
    setShowHint(false);
    setSelectedOption(null);
    triggerNewProblem();
    hideAnswer();
  };

  const handleMultipleChoiceSelect = (option) => {
    setSelectedOption(option);
    // Check if correct
    if (acceptedAnswers.includes(option) || option === answer) {
      revealAnswer();
    }
  };

  const canvasWidth = Math.min(width - 40, 700);
  const canvasHeight = 400;

  // Find point positions by name
  const getPoint = (name) => points.find(p => p.name === name);

  // Compute centroid of all points so we can push labels outward from center
  const centroidX = points.length ? points.reduce((s, p) => s + p.x, 0) / points.length : 200;
  const centroidY = points.length ? points.reduce((s, p) => s + p.y, 0) / points.length : 200;

  // Return label position pushed outward from the centroid by `dist` pixels
  const getLabelPos = (point) => {
    const dx = point.x - centroidX;
    const dy = point.y - centroidY;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const push = 34;
    return {
      x: point.x + (dx / mag) * push - 10,
      y: point.y + (dy / mag) * push - 14,
    };
  };

  return (
    <Wrapper>
      {/* Hint Button - Fixed position top-right */}
      {!showAnswer && !showHint && hints.length > 0 && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>{question}</QuestionText>
      </QuestionSection>

      {/* 2. VisualSection - Angle diagram */}
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

            {/* Draw lines */}
            {lines.map((line, index) => {
              const fromPoint = getPoint(line.from);
              const toPoint = getPoint(line.to);
              if (!fromPoint || !toPoint) return null;

              return (
                <Line
                  key={`line-${index}`}
                  points={[fromPoint.x, fromPoint.y, toPoint.x, toPoint.y]}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={3}
                />
              );
            })}

            {/* Draw angle arc indicator */}
            {indicatedAngle.vertex && (
              <Arc
                x={getPoint(indicatedAngle.vertex)?.x || 0}
                y={getPoint(indicatedAngle.vertex)?.y || 0}
                innerRadius={indicatedAngle.arcRadius - 10}
                outerRadius={indicatedAngle.arcRadius}
                angle={indicatedAngle.arcAngle}
                rotation={indicatedAngle.rotation}
                fill={konvaTheme.angle}
                opacity={0.6}
              />
            )}

            {/* Draw points and labels */}
            {points.map((point, index) => {
              const labelPos = getLabelPos(point);
              return (
                <React.Fragment key={`point-${index}`}>
                  <Circle
                    x={point.x}
                    y={point.y}
                    radius={6}
                    fill={konvaTheme.shapeStroke}
                    stroke={konvaTheme.shapeStroke}
                    strokeWidth={2}
                  />
                  <Text
                    x={labelPos.x}
                    y={labelPos.y}
                    text={point.name}
                    fontSize={28}
                    fontStyle="bold"
                    fill="#4299E1"
                  />
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Answer input and controls */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hints.length > 0 && (
              <HintBox>{hints[0]}</HintBox>
            )}

            {interactionType === "text" && (
              <AnswerInputContainer>
                <AnswerInput
                  correctAnswer={correctAnswer}
                  answerType="array"
                  onCorrect={revealAnswer}
                  onTryAnother={handleTryAnother}
                  disabled={showAnswer}
                  placeholder="Enter angle name (e.g., ABC)"
                />
              </AnswerInputContainer>
            )}

            {interactionType === "multiple_choice" && (
              <MultipleChoiceContainer>
                {options.map((option, index) => (
                  <ChoiceButton
                    key={index}
                    onClick={() => handleMultipleChoiceSelect(option)}
                    selected={selectedOption === option}
                    disabled={showAnswer}
                  >
                    ∠{option}
                  </ChoiceButton>
                ))}
              </MultipleChoiceContainer>
            )}
          </>
        )}

        {/* 4. ExplanationSection - Shown after correct answer */}
        {showAnswer && explanation && (
          <ExplanationSection>
            <ExplanationTitle>Well Done!</ExplanationTitle>
            <ExplanationText>{explanation}</ExplanationText>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default NamingAnglesLevelThree;

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
  width: 100%;
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 16px;
  color: #744210;

  @media (min-width: 768px) {
    padding: 20px;
    font-size: 17px;
  }
`;

const MultipleChoiceContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 500px;

  @media (min-width: 768px) {
    gap: 20px;
    max-width: 600px;
  }
`;

const ChoiceButton = styled.button`
  background-color: ${props =>
    props.selected
      ? props.theme.colors.buttonSuccess
      : props.theme.colors.cardBackground};
  color: ${props =>
    props.selected
      ? props.theme.colors.textInverted
      : props.theme.colors.textPrimary};
  border: 2px solid ${props =>
    props.selected
      ? props.theme.colors.buttonSuccess
      : props.theme.colors.border};
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background-color: ${props =>
      props.selected
        ? props.theme.colors.hoverBackground
        : props.theme.colors.border};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 18px 28px;
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
  margin: 0 0 20px 0;

  @media (min-width: 768px) {
    font-size: 17px;
  }

  @media (min-width: 1024px) {
    font-size: 18px;
  }
`;

const TryAnotherButton = styled.button`
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
