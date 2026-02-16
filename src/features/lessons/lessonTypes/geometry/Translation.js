import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

const GRID_SPACING = 20; // Bigger grid spacing (was 15)
const GRID_OFFSET_X = 40;
const GRID_OFFSET_Y = 40;
const TOLERANCE = 15; // pixels tolerance for "correct" positioning

/**
 * Translation - Multi-level lesson for translation transformations
 *
 * Level 1: Drag to green outline (visual guide)
 * Level 2: Drag without outline (instructions only)
 * Level 3: Apply algebraic notation (x,y) → (x+5, y-3)
 * Level 4: Calculate translation from before/after (type answer)
 * Level 5: Complete the translation rule (x,y) → (x+?, y+?)
 */
function Translation({ triggerNewProblem }) {
  // Phase 2 pattern: Use hook for lesson state
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
  } = useLessonState();

  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Extract problem data from backend
  const {
    level = 1,
    interactionType = 'drag',
    showOutline = true,
    question,
    startX,
    startY,
    dx,
    dy,
    targetX,
    targetY,
    answer,
    acceptedAnswers,
    hint,
    explanation,
    visualData,
    secondQuestion
  } = lessonProps || {};

  // Dragging state
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCorrectPosition, setIsCorrectPosition] = useState(false);

  // Reset drag position when problem changes
  useEffect(() => {
    setDragPosition({ x: 0, y: 0 });
    setIsCorrectPosition(false);
  }, [startX, startY, dx, dy]);

  // Calculate canvas size
  const canvasWidth = Math.min(width - 80, 900);
  const canvasHeight = 500;

  // Check if current drag position is correct
  const checkDragPosition = () => {
    if (!startX || !dx === undefined || !dy === undefined) return false;

    const currentX = dragPosition.x / GRID_SPACING;
    const currentY = -dragPosition.y / GRID_SPACING; // Negative because canvas Y is inverted

    const distanceX = Math.abs(currentX - dx);
    const distanceY = Math.abs(currentY - dy);

    return (
      distanceX < TOLERANCE / GRID_SPACING &&
      distanceY < TOLERANCE / GRID_SPACING
    );
  };

  const handleDragEnd = (e) => {
    const layer = e.target.getStage().findOne('.draggableLayer');
    const newPos = { x: layer.x(), y: layer.y() };
    setDragPosition(newPos);
    setIsDragging(false);

    // Check if position is correct for drag levels
    if (interactionType === 'drag') {
      const isCorrect = checkDragPosition();
      setIsCorrectPosition(isCorrect);

      if (isCorrect) {
        // Automatically reveal answer for drag levels
        setTimeout(() => revealAnswer(), 300);
      }
    }
  };

  const handleTryAnother = () => {
    setDragPosition({ x: 0, y: 0 });
    setIsCorrectPosition(false);
    triggerNewProblem();
    hideAnswer();
  };

  // Format correct answer for typing levels
  const correctAnswer = useMemo(() => {
    if (interactionType === 'type') {
      if (acceptedAnswers?.length > 0) return acceptedAnswers;
      if (Array.isArray(answer)) return answer.map(a => a.text || String(a));
      return [String(answer)];
    }
    return ['correct']; // For drag levels
  }, [answer, acceptedAnswers, interactionType]);

  // Render question text
  const renderQuestion = () => {
    if (!question) return null;

    return question.map((line, i) => (
      <QuestionLine key={i}>
        {line.map((part, j) => (
          <span key={j} style={{ fontWeight: part.bold ? 'bold' : 'normal' }}>
            {part.text}
          </span>
        ))}
      </QuestionLine>
    ));
  };

  // Render second question for level 4
  const renderSecondQuestion = () => {
    if (!secondQuestion) return null;

    return secondQuestion.map((line, i) => (
      <QuestionLine key={i}>
        {line.map((part, j) => (
          <span key={j} style={{ fontWeight: part.bold ? 'bold' : 'normal' }}>
            {part.text}
          </span>
        ))}
      </QuestionLine>
    ));
  };

  if (!startX || dx === undefined || dy === undefined) {
    return <LoadingText>Loading translation problem...</LoadingText>;
  }

  return (
    <Wrapper>
      {/* Question Section */}
      <QuestionSection>
        {renderQuestion()}
        {isCorrectPosition && interactionType === 'drag' && (
          <FeedbackText correct>
            ✓ Correct! You translated the shape perfectly!
          </FeedbackText>
        )}
      </QuestionSection>

      {/* Visual Section - Grid with draggable or static shapes */}
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

          {/* Grid Layer */}
          <Layer>
            {/* Horizontal grid lines */}
            {[...Array(30)].map((_, indexH) => (
              <Line
                key={`y${indexH}`}
                points={[0, 0, canvasWidth, 0]}
                stroke={konvaTheme.gridRegular || 'lightgray'}
                strokeWidth={1}
                opacity={0.3}
                x={0}
                y={indexH * GRID_SPACING + GRID_OFFSET_Y}
              />
            ))}

            {/* Vertical grid lines */}
            {[...Array(45)].map((_, indexV) => (
              <Line
                key={`x${indexV}`}
                points={[0, 0, 0, canvasHeight]}
                stroke={konvaTheme.gridRegular || 'lightgray'}
                strokeWidth={1}
                opacity={0.3}
                x={indexV * GRID_SPACING + GRID_OFFSET_X}
                y={0}
              />
            ))}
          </Layer>

          {/* Target Outline Layer (Levels 1 with green outline) */}
          {showOutline && interactionType === 'drag' && (
            <Layer>
              {/* 2x2 grid of outlined squares */}
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="transparent"
                width={40}
                height={40}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
                opacity={0.7}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 40}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="transparent"
                width={40}
                height={40}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
                opacity={0.7}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 40}
                fill="transparent"
                width={40}
                height={40}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
                opacity={0.7}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 40}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 40}
                fill="transparent"
                width={40}
                height={40}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
                opacity={0.7}
              />
            </Layer>
          )}

          {/* Starting Position Layer (semi-transparent) */}
          <Layer>
            <Rect
              x={startX * GRID_SPACING + GRID_OFFSET_X}
              y={startY * GRID_SPACING + GRID_OFFSET_Y}
              fill="red"
              opacity={interactionType === 'drag' ? 0.2 : 0.4}
              width={40}
              height={40}
              stroke={konvaTheme.shapeStroke || 'black'}
              strokeWidth={1}
            />
            <Rect
              x={startX * GRID_SPACING + GRID_OFFSET_X + 40}
              y={startY * GRID_SPACING + GRID_OFFSET_Y}
              fill="blue"
              opacity={interactionType === 'drag' ? 0.2 : 0.4}
              width={40}
              height={40}
              stroke={konvaTheme.shapeStroke || 'black'}
              strokeWidth={1}
            />
            <Rect
              x={startX * GRID_SPACING + GRID_OFFSET_X}
              y={startY * GRID_SPACING + GRID_OFFSET_Y + 40}
              fill="green"
              opacity={interactionType === 'drag' ? 0.2 : 0.4}
              width={40}
              height={40}
              stroke={konvaTheme.shapeStroke || 'black'}
              strokeWidth={1}
            />
            <Rect
              x={startX * GRID_SPACING + GRID_OFFSET_X + 40}
              y={startY * GRID_SPACING + GRID_OFFSET_Y + 40}
              fill="yellow"
              opacity={interactionType === 'drag' ? 0.2 : 0.4}
              width={40}
              height={40}
              stroke={konvaTheme.shapeStroke || 'black'}
              strokeWidth={1}
            />
          </Layer>

          {/* Target Position Layer (for typing levels 4-5 showing final position) */}
          {interactionType === 'type' && (
            <Layer>
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="red"
                opacity={0.8}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 40}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="blue"
                opacity={0.8}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 40}
                fill="green"
                opacity={0.8}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 40}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 40}
                fill="yellow"
                opacity={0.8}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
            </Layer>
          )}

          {/* Draggable Layer (for drag levels 1-3) */}
          {interactionType === 'drag' && (
            <Layer
              name="draggableLayer"
              draggable
              x={dragPosition.x}
              y={dragPosition.y}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
            >
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X}
                y={startY * GRID_SPACING + GRID_OFFSET_Y}
                fill="red"
                opacity={isCorrectPosition ? 0.9 : 0.7}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X + 40}
                y={startY * GRID_SPACING + GRID_OFFSET_Y}
                fill="blue"
                opacity={isCorrectPosition ? 0.9 : 0.7}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X}
                y={startY * GRID_SPACING + GRID_OFFSET_Y + 40}
                fill="green"
                opacity={isCorrectPosition ? 0.9 : 0.7}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X + 40}
                y={startY * GRID_SPACING + GRID_OFFSET_Y + 40}
                fill="yellow"
                opacity={isCorrectPosition ? 0.9 : 0.7}
                width={40}
                height={40}
                stroke={konvaTheme.shapeStroke || 'black'}
                strokeWidth={2}
              />
            </Layer>
          )}
        </Stage>
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {interactionType === 'drag' ? (
          // Drag levels - show hint or next button
          <>
            {isCorrectPosition && showAnswer ? (
              <NextButton onClick={handleTryAnother}>
                Next Problem →
              </NextButton>
            ) : (
              <HintText>
                {showOutline
                  ? "Drag the colored shape to the green dashed outline"
                  : "Drag the colored shape to match the instructions"}
              </HintText>
            )}
          </>
        ) : (
          // Typing levels - use AnswerInput component
          <>
            {!showAnswer && renderSecondQuestion()}
            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="array"
                onCorrect={revealAnswer}
                onTryAnother={handleTryAnother}
                disabled={showAnswer}
                placeholder={level === 4 ? "Enter horizontal, then vertical" : "Enter the numbers"}
              />
            </AnswerInputContainer>
          </>
        )}
      </InteractionSection>

      {/* Explanation Section */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Explanation</ExplanationTitle>
          <ExplanationText>
            {explanation || `The shape moved ${Math.abs(dx)} spaces ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} spaces ${dy > 0 ? 'down' : 'up'}.`}
          </ExplanationText>
          {hint && (
            <HintBox>
              <strong>Hint:</strong> {hint}
            </HintBox>
          )}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Translation;

// Styled Components

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
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

const QuestionLine = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.textPrimary || '#2d3748'};
  line-height: 1.6;
  margin: 5px 0;

  @media (min-width: 768px) {
    font-size: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 22px;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.correct ? '#48BB78' : '#F56565'};
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
  background-color: ${props => props.theme?.colors?.cardBackground || '#f7fafc'};
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
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  min-height: 60px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const NextButton = styled.button`
  background-color: #48BB78;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #38A169;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 20px;
    padding: 16px 36px;
  }
`;

const HintText = styled.p`
  font-size: 16px;
  color: ${props => props.theme?.colors?.textSecondary || '#718096'};
  margin: 0;
  font-style: italic;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const AnswerInputContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #48BB78;
  border-radius: 8px;
  padding: 20px;

  @media (min-width: 768px) {
    padding: 25px;
  }
`;

const ExplanationTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #2f855a;
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 17px;
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px 16px;
  margin-top: 15px;
  border-radius: 4px;
  font-size: 15px;
  color: #2d3748;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 18px;
  color: ${props => props.theme?.colors?.textSecondary || '#718096'};
  padding: 40px;
`;
