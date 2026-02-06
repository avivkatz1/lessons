import React, { useState } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Arc, Text, Rect } from 'react-konva';

/**
 * TangentLesson - Main component for Tangent lesson (5 levels)
 * Levels 1-2: Visual triangle-based problems
 * Levels 3-5: Text-based calculator and word problems
 */
function TangentLesson({ lessonData, onAnswerSubmit }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  if (!lessonData) return null;

  // Get current problem from questionAnswerArray if available (backend-generated data)
  // Otherwise fall back to top-level lessonData (frontend-only data)
  const currentProblem = lessonData.questionAnswerArray?.[currentProblemIndex] || lessonData;

  const {
    levelNum = lessonData.levelNum,
    question = currentProblem.question,
    answer = currentProblem.answer,
    acceptedAnswers = currentProblem.acceptedAnswers,
    visualData = currentProblem.visualData,
    hint = currentProblem.hint,
    explanation = currentProblem.explanation,
    calculation = currentProblem.calculation
  } = currentProblem;

  // Levels 1-3 use visual triangles (1: labeled, 2: identify sides, 3: unlabeled calculate)
  const isVisualLevel = levelNum <= 3;

  const handleSubmit = () => {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correct = acceptedAnswers?.some(
      accepted => normalizedAnswer === accepted.toLowerCase()
    ) || normalizedAnswer === answer[0].toLowerCase();

    setShowExplanation(correct);
    if (onAnswerSubmit) {
      onAnswerSubmit(correct);
    }
  };

  const handleTryAnother = () => {
    setUserAnswer('');
    setShowHint(false);
    setShowExplanation(false);

    // Move to next problem in batch if available
    if (lessonData.questionAnswerArray && currentProblemIndex < lessonData.questionAnswerArray.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Reset to first problem if we've used all problems in batch
      setCurrentProblemIndex(0);
    }
  };

  return (
    <Wrapper>
      <QuestionSection>
        <QuestionText>{question?.[0]?.text || question}</QuestionText>
      </QuestionSection>

      {isVisualLevel && visualData && (
        <VisualSection>
          <RightTriangle visualData={visualData} width={600} height={400} />
        </VisualSection>
      )}

      <InteractionSection>
        {!showExplanation && (
          <>
            {!showHint && (
              <HintButton onClick={() => setShowHint(true)}>
                Need a hint?
              </HintButton>
            )}

            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

            <AnswerInputContainer>
              <AnswerLabel>Your answer:</AnswerLabel>
              <AnswerInput
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter your answer"
                aria-label="Answer input"
              />
              <SubmitButton onClick={handleSubmit}>
                Check Answer
              </SubmitButton>
            </AnswerInputContainer>
          </>
        )}

        {showExplanation && (
          <ExplanationSection>
            <CorrectBadge>✓ Correct!</CorrectBadge>

            {calculation && (
              <CalculationBox>
                <CalculationStep><strong>Formula:</strong> {calculation.formula}</CalculationStep>
                <CalculationStep><strong>Substitution:</strong> {calculation.substitution}</CalculationStep>
                <CalculationStep><strong>Result:</strong> {calculation.result}</CalculationStep>
              </CalculationBox>
            )}

            {explanation && (
              <ExplanationText>{explanation}</ExplanationText>
            )}

            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

/**
 * RightTriangle - Reusable Konva component for rendering right triangles
 * Can be reused for Sine, Cosine lessons!
 */
function RightTriangle({ visualData, width = 600, height = 400 }) {
  if (!visualData) return null;

  const { angle, sides, rightAngle } = visualData;
  const scale = 15; // Scale factor for side lengths
  const padding = 100; // Padding from edges

  // Calculate triangle coordinates based on angle position
  // For simplicity, we'll use bottom-left angle position as default
  const anglePos = angle?.position || 'bottom-left';

  // Base triangle coordinates (angle at bottom-left)
  let x1 = padding; // Left corner (angle here)
  let y1 = height - padding; // Bottom
  let x2 = x1 + (sides?.adjacent?.length || 10) * scale; // Right corner
  let y2 = y1; // Same y (horizontal)
  let x3 = x2; // Same x (vertical)
  let y3 = y1 - (sides?.opposite?.length || 8) * scale; // Top corner

  // Adjust coordinates based on angle position
  if (anglePos === 'bottom-right') {
    x1 = width - padding;
    y1 = height - padding;
    x2 = x1 - (sides?.adjacent?.length || 10) * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 - (sides?.opposite?.length || 8) * scale;
  } else if (anglePos === 'top-left') {
    x1 = padding;
    y1 = padding;
    x2 = x1 + (sides?.adjacent?.length || 10) * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 + (sides?.opposite?.length || 8) * scale;
  }

  const oppositeColor = sides?.opposite?.color || '#EF4444'; // red
  const adjacentColor = sides?.adjacent?.color || '#3B82F6'; // blue
  const hypotenuseColor = sides?.hypotenuse?.color || '#9CA3AF'; // gray

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Draw the three sides of the triangle */}

        {/* Adjacent (horizontal) */}
        <Line
          points={[x1, y1, x2, y2]}
          stroke={adjacentColor}
          strokeWidth={4}
        />

        {/* Opposite (vertical) */}
        <Line
          points={[x2, y2, x3, y3]}
          stroke={oppositeColor}
          strokeWidth={4}
        />

        {/* Hypotenuse */}
        <Line
          points={[x1, y1, x3, y3]}
          stroke={hypotenuseColor}
          strokeWidth={4}
        />

        {/* Right angle indicator (small square) */}
        {rightAngle && (
          <Rect
            x={x2 - 15}
            y={y2 - 15}
            width={15}
            height={15}
            stroke="#666"
            strokeWidth={2}
          />
        )}

        {/* Angle arc */}
        {angle?.showValue && (
          <>
            <Arc
              x={x1}
              y={y1}
              innerRadius={0}
              outerRadius={40}
              angle={angle.value}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3B82F6"
              strokeWidth={2}
              rotation={anglePos === 'bottom-right' ? 135 : 0}
            />
            <Text
              x={x1 + (anglePos === 'bottom-right' ? -60 : 20)}
              y={y1 - 30}
              text={angle.label || `${angle.value}°`}
              fontSize={18}
              fill="#333"
              fontStyle="bold"
            />
          </>
        )}

        {/* Side labels */}
        {sides?.opposite?.showLabel && (
          <Text
            x={x2 + 10}
            y={(y2 + y3) / 2}
            text={sides.opposite.label + (sides.opposite.showLength ? `: ${sides.opposite.length}` : '')}
            fontSize={16}
            fill={oppositeColor}
            fontStyle="bold"
          />
        )}

        {sides?.adjacent?.showLabel && (
          <Text
            x={(x1 + x2) / 2 - 40}
            y={y1 + 25}
            text={sides.adjacent.label + (sides.adjacent.showLength ? `: ${sides.adjacent.length}` : '')}
            fontSize={16}
            fill={adjacentColor}
            fontStyle="bold"
          />
        )}

        {sides?.hypotenuse?.showLabel && (
          <Text
            x={(x1 + x3) / 2 - 50}
            y={(y1 + y3) / 2}
            text={sides.hypotenuse.label + (sides.hypotenuse.showLength ? `: ${sides.hypotenuse.length}` : '')}
            fontSize={16}
            fill={hypotenuseColor}
            fontStyle="bold"
          />
        )}
      </Layer>
    </Stage>
  );
}

export default TangentLesson;

// Styled Components

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
`;

const QuestionSection = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const QuestionText = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const VisualSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 30px 0;
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
`;

const InteractionSection = styled.div`
  margin-top: 30px;
`;

const HintButton = styled.button`
  background: #edf2f7;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;

  &:hover {
    background: #e2e8f0;
    border-color: #a0aec0;
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 16px;
  color: #744210;
`;

const AnswerInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const AnswerLabel = styled.label`
  font-size: 18px;
  font-weight: 500;
  color: #2d3748;
`;

const AnswerInput = styled.input`
  padding: 12px 16px;
  font-size: 18px;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  width: 200px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const SubmitButton = styled.button`
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3182ce;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ExplanationSection = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
`;

const CorrectBadge = styled.div`
  background: #48bb78;
  color: white;
  font-size: 20px;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
`;

const CalculationBox = styled.div`
  background: white;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CalculationStep = styled.div`
  font-size: 16px;
  color: #2d3748;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #2d3748;
  margin: 16px 0;
`;

const TryAnotherButton = styled.button`
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  transition: background 0.2s;

  &:hover {
    background: #38a169;
  }
`;
