import React, { useState, useMemo } from "react";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Rect, Line } from "react-konva";
import { AnswerInput } from "../../../../shared/components";

const GRID_SPACING = 15;
const GRID_OFFSET_X = 310;
const GRID_OFFSET_Y = 10;
const TOLERANCE = 10; // pixels tolerance for "correct" positioning

/**
 * Translation - Interactive exploration of translation (sliding) transformations
 * Students learn translation through 5 progressive levels
 * - Level 1: Drag with green outline guide
 * - Level 2: Drag without outline (instructions only)
 * - Level 3: Apply algebraic notation (x,y) → (x+5, y-3)
 * - Level 4: Calculate translation from before/after (type answer)
 * - Level 5: Complete the translation rule (type answer)
 */
function Translation({ triggerNewProblem }) {
  // Use shared lesson state hook
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Current problem from backend
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const {
    interactionType,
    showOutline,
    question,
    answer,
    acceptedAnswers,
    hint,
    explanation,
    startX,
    startY,
    dx,
    dy,
    targetX,
    targetY,
    visualData = {},
    secondQuestion
  } = currentProblem;

  // Local state for drag interaction
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragCorrect, setIsDragCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Format answer for typed input (levels 4-5)
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer.map(a => a.text || String(a));
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Check if dragged position is correct
  const checkDragPosition = (currentDragPos) => {
    if (dx === undefined || dy === undefined) return false;

    const currentX = currentDragPos.x / GRID_SPACING;
    const currentY = -currentDragPos.y / GRID_SPACING; // Negative because canvas Y is inverted

    const distanceX = Math.abs(currentX - dx);
    const distanceY = Math.abs(currentY - dy);

    return (
      distanceX < TOLERANCE / GRID_SPACING &&
      distanceY < TOLERANCE / GRID_SPACING
    );
  };

  const handleDragEnd = (e) => {
    const layer = e.target.getLayer();
    const newPos = { x: layer.x(), y: layer.y() };
    setDragPosition(newPos);

    const isCorrect = checkDragPosition(newPos);
    setIsDragCorrect(isCorrect);

    if (isCorrect && !showAnswer) {
      revealAnswer();
    }
  };

  const handleTryAnother = () => {
    setDragPosition({ x: 0, y: 0 });
    setIsDragCorrect(false);
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  // Render question text from array format
  const renderQuestion = (questionArray) => {
    if (!questionArray) return null;
    if (typeof questionArray === 'string') return questionArray;

    return questionArray.map((line, i) => (
      <QuestionLine key={i}>
        {Array.isArray(line)
          ? line.map((part, j) => (
              part.bold ? <strong key={j}>{part.text}</strong> : <span key={j}>{part.text}</span>
            ))
          : line.text || line
        }
      </QuestionLine>
    ));
  };

  // Don't render if missing critical data
  if (startX === undefined || startY === undefined || dx === undefined || dy === undefined) {
    return (
      <Wrapper>
        <QuestionSection>
          <QuestionText>Loading translation problem...</QuestionText>
        </QuestionSection>
      </Wrapper>
    );
  }

  const canvasWidth = Math.min(width - 40, 1300);
  const canvasHeight = 500;

  // Extract hint text from question for TopHintButton
  const questionHint = typeof question === 'string' ? question :
    (Array.isArray(question) ? question.map(line => {
      if (Array.isArray(line)) {
        return line.map(part => part.text).join('');
      }
      return line.text || line;
    }).join(' ') : '');

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right (for all levels) */}
      {!showAnswer && !showHint && questionHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        {/* Question text now hidden - shown in hint */}
      </QuestionSection>

      {/* 2. VisualSection - Grid and draggable/positioned squares */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          {/* Grid Layer */}
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Horizontal grid lines */}
            {[...Array(35)].map((_, indexH) => (
              <Line
                key={`y${indexH}`}
                points={[0, 0, 1300, 0]}
                stroke={konvaTheme.gridRegular}
                strokeWidth={1}
                opacity={0.3}
                x={0}
                y={indexH * GRID_SPACING + GRID_OFFSET_Y}
              />
            ))}

            {/* Vertical grid lines */}
            {[...Array(60)].map((_, indexV) => (
              <Line
                key={`x${indexV}`}
                points={[0, 0, 0, 500]}
                stroke={konvaTheme.gridRegular}
                strokeWidth={1}
                opacity={0.3}
                x={indexV * GRID_SPACING + GRID_OFFSET_X}
                y={0}
              />
            ))}
          </Layer>

          {/* Target Outline Layer - Shows where shape should end up (Level 1 only) */}
          {showOutline && (
            <Layer>
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="transparent"
                opacity={0.5}
                width={30}
                height={30}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="transparent"
                opacity={0.5}
                width={30}
                height={30}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="transparent"
                opacity={0.5}
                width={30}
                height={30}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="transparent"
                opacity={0.5}
                width={30}
                height={30}
                stroke="#48BB78"
                strokeWidth={3}
                dash={[5, 5]}
              />
            </Layer>
          )}

          {/* Starting Position Layer - Semi-transparent original */}
          {visualData.showStartingPosition && (
            <Layer>
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X}
                y={startY * GRID_SPACING + GRID_OFFSET_Y}
                fill="red"
                opacity={0.2}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={startY * GRID_SPACING + GRID_OFFSET_Y}
                fill="blue"
                opacity={0.2}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X}
                y={startY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="green"
                opacity={0.2}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={startY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="yellow"
                opacity={0.2}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1}
              />
            </Layer>
          )}

          {/* Target Position Layer - Solid for levels 4-5 */}
          {visualData.showTargetPosition && interactionType === 'type' && (
            <Layer>
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="red"
                opacity={0.9}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y}
                fill="blue"
                opacity={0.9}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="green"
                opacity={0.9}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Rect
                x={targetX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={targetY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="yellow"
                opacity={0.9}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
            </Layer>
          )}

          {/* Draggable Squares Layer - Only for drag levels (1-3) */}
          {interactionType === 'drag' && (
            <Layer
              draggable
              x={dragPosition.x}
              y={dragPosition.y}
              onDragEnd={handleDragEnd}
            >
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X}
                y={startY * GRID_SPACING + GRID_OFFSET_Y}
                fill="red"
                opacity={isDragCorrect ? 0.9 : 0.7}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={startY * GRID_SPACING + GRID_OFFSET_Y}
                fill="blue"
                opacity={isDragCorrect ? 0.9 : 0.7}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X}
                y={startY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="green"
                opacity={isDragCorrect ? 0.9 : 0.7}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Rect
                x={startX * GRID_SPACING + GRID_OFFSET_X + 30}
                y={startY * GRID_SPACING + GRID_OFFSET_Y + 30}
                fill="yellow"
                opacity={isDragCorrect ? 0.9 : 0.7}
                width={30}
                height={30}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
            </Layer>
          )}
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control buttons or answer input */}
      <InteractionSection>
        {interactionType === 'drag' ? (
          // Drag interaction (Levels 1-3)
          <>
            {showHint && questionHint && (
              <HintBox>{questionHint}</HintBox>
            )}

            {isDragCorrect ? (
              <NextButton onClick={handleTryAnother}>
                Try Another →
              </NextButton>
            ) : (
              <HintText>
                {showOutline
                  ? "Drag the colored shape to the green dashed outline"
                  : "Drag the shape to match the translation"}
              </HintText>
            )}
          </>
        ) : (
          // Type interaction (Levels 4-5)
          <>
            {!showAnswer && (
              <>
                {showHint && questionHint && (
                  <HintBox>{questionHint}</HintBox>
                )}

                {showHint && hint && <HintBox>{hint}</HintBox>}

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

                {secondQuestion && (
                  <SecondQuestionText>{renderQuestion(secondQuestion)}</SecondQuestionText>
                )}
              </>
            )}

            {showAnswer && explanation && (
              <ExplanationBox>
                <ExplanationText>{explanation}</ExplanationText>
                <TryAnotherButton onClick={handleTryAnother}>
                  Try Another →
                </TryAnotherButton>
              </ExplanationBox>
            )}
          </>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Translation;

// Styled Components - Lesson Development Checklist standard

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

const QuestionText = styled.div`
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

const QuestionLine = styled.p`
  margin: 8px 0;
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
  min-height: 60px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const NextButton = styled.button`
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 20px;
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
    font-size: 22px;
    padding: 16px 36px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 18px 40px;
  }
`;

const HintText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  font-style: italic;

  @media (min-width: 768px) {
    font-size: 18px;
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
  padding: 16px;
  margin-bottom: 20px;
  color: #2d3748;
  font-size: 16px;
  line-height: 1.6;
  border-radius: 4px;
  max-width: 600px;
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
  max-width: 500px;
`;

const SecondQuestionText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
  margin: 15px 0;
`;

const ExplanationBox = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 24px;
  max-width: 700px;
  width: 100%;
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #2d3748;
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
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #38A169;
    transform: translateY(-1px);
  }
`;
