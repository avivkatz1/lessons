import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Arc, Text, Rect } from 'react-konva';
import { useLessonState, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

/**
 * TangentLesson - Main component for Tangent lesson (5 levels)
 * Levels 1-2: Visual triangle-based problems
 * Levels 3-5: Text-based calculator and word problems
 */
function TangentLesson({ triggerNewProblem }) {
  // Use shared lesson state hook
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  // Keep local UI state for hint
  const [showHint, setShowHint] = useState(false);

  // Get current problem from questionAnswerArray if available (backend-generated data)
  // Otherwise fall back to top-level lessonProps (frontend-only data)
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;

  const {
    levelNum = lessonProps.levelNum,
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

  // Prepare answer format for AnswerInput component
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers && Array.isArray(acceptedAnswers) && acceptedAnswers.length > 0) {
      return acceptedAnswers;
    }
    if (Array.isArray(answer)) {
      return answer;
    }
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  return (
    <Wrapper>
      {/* Hint button positioned at top right, inline with header */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      <QuestionSection>
        <QuestionText>{question?.[0]?.text || question}</QuestionText>
      </QuestionSection>

      {isVisualLevel && visualData && (
        <VisualSection>
          <RightTriangle visualData={visualData} width={500} height={300} />
        </VisualSection>
      )}

      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="array"
                onCorrect={revealAnswer}
                onTryAnother={handleTryAnother}
                disabled={showAnswer}
                placeholder="Enter your answer"
              />
            </AnswerInputContainer>
          </>
        )}

        {showAnswer && (
          <ExplanationSection>
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
function RightTriangle({ visualData, width = 500, height = 300 }) {
  const konvaTheme = useKonvaTheme();
  if (!visualData) return null;

  const { angle, sides, rightAngle } = visualData;
  const padding = 60; // Padding from edges

  // Get side lengths with defaults
  const adjacentLength = sides?.adjacent?.length || 10;
  const oppositeLength = sides?.opposite?.length || 8;

  // Calculate dynamic scale to fit triangle in canvas
  const maxWidth = width - (padding * 2);
  const maxHeight = height - (padding * 2);
  const scaleX = maxWidth / adjacentLength;
  const scaleY = maxHeight / oppositeLength;
  const scale = Math.min(scaleX, scaleY, 20); // Max scale of 20 to prevent tiny triangles

  // Calculate triangle coordinates based on angle position
  const anglePos = angle?.position || 'bottom-left';

  // Base triangle coordinates (angle at bottom-left)
  let x1 = padding; // Left corner (acute angle here)
  let y1 = height - padding; // Bottom
  let x2 = x1 + adjacentLength * scale; // Right corner (right angle here)
  let y2 = y1; // Same y (horizontal)
  let x3 = x2; // Same x (vertical)
  let y3 = y1 - oppositeLength * scale; // Top corner

  // Adjust coordinates based on angle position
  if (anglePos === 'bottom-right') {
    x1 = width - padding;
    y1 = height - padding;
    x2 = x1 - adjacentLength * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 - oppositeLength * scale;
  } else if (anglePos === 'top-left') {
    x1 = padding;
    y1 = padding;
    x2 = x1 + adjacentLength * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 + oppositeLength * scale;
  }

  const oppositeColor = sides?.opposite?.color || konvaTheme.opposite;
  const adjacentColor = sides?.adjacent?.color || konvaTheme.adjacent;
  const hypotenuseColor = sides?.hypotenuse?.color || konvaTheme.shapeStroke;

  // Calculate dynamic arc radius (proportional to triangle size, max 50px)
  const minSide = Math.min(adjacentLength * scale, oppositeLength * scale);
  const arcRadius = Math.min(minSide * 0.4, 50, adjacentLength * scale * 0.6);

  // Calculate hypotenuse angle for rotated text
  const hypotenuseAngle = Math.atan2(y3 - y1, x3 - x1) * (180 / Math.PI);

  // Calculate perpendicular offset for hypotenuse label (outside triangle)
  const hypotenuseLength = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));
  const perpX = (y3 - y1) / hypotenuseLength; // Perpendicular x component (reversed)
  const perpY = -(x3 - x1) / hypotenuseLength; // Perpendicular y component (reversed)
  const labelOffset = 30; // Distance to move label outside triangle

  // Determine if angle text fits inside arc (needs at least 30px radius and angle > 20°)
  const angleValue = angle?.value || 0;
  const textFitsInside = arcRadius >= 30 && angleValue >= 25;

  // Check if angle text would overlap with right angle indicator or triangle sides
  // Calculate where the angle text would be positioned
  const angleTextX = x1 + arcRadius * 0.65 * Math.cos((angleValue / 2) * Math.PI / 180);
  const angleTextY = y1 - arcRadius * 0.65 * Math.sin((angleValue / 2) * Math.PI / 180);
  const distanceToRightAngle = Math.sqrt(Math.pow(angleTextX - x2, 2) + Math.pow(angleTextY - y2, 2));

  // Multiple overlap conditions:
  // 1. Too close to right angle square
  const hasRightAngleOverlap = distanceToRightAngle < 45;
  // 2. Angle too small (text too close to adjacent/horizontal line)
  const angleTooSmall = angleValue < 30;
  // 3. Angle too large (text too close to opposite/vertical line)
  const angleTooLarge = angleValue > 75;
  // 4. Text too close to adjacent line (within 25px vertically)
  const tooCloseToAdjacent = Math.abs(angleTextY - y1) < 25;

  const hasOverlap = hasRightAngleOverlap || angleTooSmall || angleTooLarge || tooCloseToAdjacent;

  // If overlap detected, always position text outside with arrow (regardless of arc size)
  const needsExternalLabel = hasOverlap;
  const externalLabelX = x1 - 60;
  const externalLabelY = y1 - 40;

  // Only show text inside if it fits AND there's no overlap
  const showTextInside = textFitsInside && !hasOverlap;

  // Dynamic right angle indicator size (smaller for large angles)
  const rightAngleSize = angleValue > 75 ? 12 : angleValue > 60 ? 15 : 20;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Canvas background */}
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />

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
            x={anglePos === 'bottom-right' ? x2 : x2 - rightAngleSize}
            y={anglePos === 'top-left' ? y2 : y2 - rightAngleSize}
            width={rightAngleSize}
            height={rightAngleSize}
            stroke="#666"
            strokeWidth={2}
            fill="none"
          />
        )}

        {/* Angle arc - shows the acute angle */}
        {angle?.showValue && (
          <>
            <Arc
              x={x1}
              y={y1}
              innerRadius={0}
              outerRadius={arcRadius}
              angle={angleValue}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3B82F6"
              strokeWidth={2}
              rotation={anglePos === 'bottom-right' ? 180 - angleValue : -angleValue}
            />
            {needsExternalLabel ? (
              // Text outside with arrow pointing to angle (when overlap detected)
              <>
                <Line
                  points={[
                    externalLabelX + 35,
                    externalLabelY + 10,
                    x1 + Math.min(arcRadius * 0.5, 30),
                    y1 - Math.min(arcRadius * 0.5, 30) * Math.tan((angleValue / 2) * Math.PI / 180)
                  ]}
                  stroke="#333"
                  strokeWidth={1.5}
                  dash={[4, 4]}
                />
                <Text
                  x={externalLabelX}
                  y={externalLabelY}
                  text={angle.label || `${angleValue}°`}
                  fontSize={20}
                  fill={konvaTheme.labelText}
                  fontStyle="bold"
                />
              </>
            ) : showTextInside ? (
              // Text inside the arc, centered at half the angle
              <Text
                x={x1 + arcRadius * 0.65 * Math.cos((angleValue / 2) * Math.PI / 180)}
                y={y1 - arcRadius * 0.65 * Math.sin((angleValue / 2) * Math.PI / 180)}
                text={angle.label || `${angleValue}°`}
                fontSize={18}
                fill={konvaTheme.labelText}
                fontStyle="bold"
                offsetX={12}
                offsetY={8}
              />
            ) : (
              // Text outside the arc without arrow (arc too small)
              <Text
                x={x1 + (anglePos === 'bottom-right' ? -arcRadius - 30 : arcRadius + 10)}
                y={y1 - arcRadius - 10}
                text={angle.label || `${angleValue}°`}
                fontSize={20}
                fill={konvaTheme.labelText}
                fontStyle="bold"
              />
            )}
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
            x={(x1 + x3) / 2 + perpX * labelOffset}
            y={(y1 + y3) / 2 + perpY * labelOffset}
            text={sides.hypotenuse.label + (sides.hypotenuse.showLength ? `: ${sides.hypotenuse.length}` : '')}
            fontSize={16}
            fill={hypotenuseColor}
            fontStyle="bold"
            rotation={hypotenuseAngle}
            offsetX={sides.hypotenuse.showLength ? 50 : 40}
            offsetY={8}
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
  color: ${props => props.theme.colors.textPrimary};
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
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;

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

const HintButton = styled.button`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    padding: 8px 16px;
    font-size: 14px;
    margin-bottom: 12px;
  }

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
    border-color: ${props => props.theme.colors.borderDark};
  }
`;

const TopHintButton = styled(HintButton)`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;

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

const AnswerInputContainer = styled.div`
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

const CalculationBox = styled.div`
  background: white;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 10px;
  }
`;

const CalculationStep = styled.div`
  font-size: 15px;
  color: #2d3748;
  margin: 6px 0;
  font-family: 'Courier New', monospace;

  @media (max-width: 1024px) {
    font-size: 14px;
    margin: 5px 0;
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

