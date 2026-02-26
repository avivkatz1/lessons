import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line, Text as KonvaText, Circle } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== CONSTANTS ====================

const CELL_SIZE = 40;

// ==================== MAIN COMPONENT ====================

export default function AreaPerimeterLesson({ triggerNewProblem }) {
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

  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    shapeType,
    length,
    width: rectWidth,
    side,
    base,
    height,
    area,
    perimeter,
    showGrid = false,
    showDimensions = false,
    givenDimension,
    unknownDimension,
    context,
  } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';
  const correctAnswer = currentProblem?.answer || [];

  // Canvas sizing
  const canvasWidth = Math.min(width - 40, 600);
  const canvasHeight = 450;

  // Check if we have required data
  const hasRequiredData = shapeType && level;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setUserAnswer('');
    setIsCorrect(null);
  }

  const handleCheck = () => {
    // For answers with multiple parts (area and perimeter)
    if (Array.isArray(correctAnswer) && correctAnswer.length > 1) {
      const parts = userAnswer.split(',').map(s => s.trim());
      const correct = parts.length === correctAnswer.length &&
        parts.every((part, i) => {
          const cleanPart = part.replace(/[^0-9.]/g, '');
          const cleanAnswer = correctAnswer[i].replace(/[^0-9.]/g, '');
          return cleanPart === cleanAnswer;
        });
      setIsCorrect(correct);
      if (correct) {
        revealAnswer();
        setTimeout(() => {
          setUserAnswer('');
          setIsCorrect(null);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    } else {
      // Single answer
      const cleanUserAnswer = userAnswer.replace(/[^0-9.]/g, '');
      const cleanCorrect = correctAnswer[0]?.replace(/[^0-9.]/g, '') || '';
      const correct = cleanUserAnswer === cleanCorrect;
      setIsCorrect(correct);
      if (correct) {
        revealAnswer();
        setTimeout(() => {
          setUserAnswer('');
          setIsCorrect(null);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    }
  };

  // Render shape visualization
  const renderShape = () => {
    const shapes = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    if (shapeType === 'rectangle') {
      const rectLength = length || 0;
      const rectW = rectWidth || 0;
      const pixelWidth = showGrid ? rectLength * CELL_SIZE : Math.min(rectLength * 25, 300);
      const pixelHeight = showGrid ? rectW * CELL_SIZE : Math.min(rectW * 25, 250);
      const x = centerX - pixelWidth / 2;
      const y = centerY - pixelHeight / 2;

      // Draw grid if Level 1
      if (showGrid) {
        // Grid cells
        for (let r = 0; r < rectW; r++) {
          for (let c = 0; c < rectLength; c++) {
            shapes.push(
              <Rect
                key={`cell-${r}-${c}`}
                x={x + c * CELL_SIZE}
                y={y + r * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="#3B82F6"
                opacity={0.3}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1}
              />
            );
          }
        }
      } else {
        // Solid rectangle
        shapes.push(
          <Rect
            key="rect"
            x={x}
            y={y}
            width={pixelWidth}
            height={pixelHeight}
            fill="#3B82F6"
            opacity={0.5}
            stroke={konvaTheme.shapeStroke}
            strokeWidth={3}
          />
        );
      }

      // Show dimensions
      if (showDimensions || level === 2) {
        // Top label (length)
        if (!unknownDimension || unknownDimension !== 'length') {
          shapes.push(
            <KonvaText
              key="length-label"
              x={x}
              y={y - 30}
              width={pixelWidth}
              text={`${rectLength} cm`}
              fontSize={18}
              fill={konvaTheme.labelText || '#F97316'}
              align="center"
              fontStyle="bold"
            />
          );
          // Top dimension line
          shapes.push(
            <Line
              key="length-line"
              points={[x, y - 15, x + pixelWidth, y - 15]}
              stroke={konvaTheme.labelText || '#F97316'}
              strokeWidth={2}
            />,
            <Circle key="length-c1" x={x} y={y - 15} radius={4} fill={konvaTheme.labelText || '#F97316'} />,
            <Circle key="length-c2" x={x + pixelWidth} y={y - 15} radius={4} fill={konvaTheme.labelText || '#F97316'} />
          );
        } else {
          shapes.push(
            <KonvaText
              key="length-unknown"
              x={x}
              y={y - 30}
              width={pixelWidth}
              text="? cm"
              fontSize={18}
              fill="#EF4444"
              align="center"
              fontStyle="bold"
            />
          );
        }

        // Right label (width)
        if (!unknownDimension || unknownDimension !== 'width') {
          shapes.push(
            <KonvaText
              key="width-label"
              x={x + pixelWidth + 15}
              y={y + pixelHeight / 2 - 10}
              text={`${rectW} cm`}
              fontSize={18}
              fill={konvaTheme.labelText || '#F97316'}
              fontStyle="bold"
            />
          );
          // Right dimension line
          shapes.push(
            <Line
              key="width-line"
              points={[x + pixelWidth + 10, y, x + pixelWidth + 10, y + pixelHeight]}
              stroke={konvaTheme.labelText || '#F97316'}
              strokeWidth={2}
            />,
            <Circle key="width-c1" x={x + pixelWidth + 10} y={y} radius={4} fill={konvaTheme.labelText || '#F97316'} />,
            <Circle key="width-c2" x={x + pixelWidth + 10} y={y + pixelHeight} radius={4} fill={konvaTheme.labelText || '#F97316'} />
          );
        } else {
          shapes.push(
            <KonvaText
              key="width-unknown"
              x={x + pixelWidth + 15}
              y={y + pixelHeight / 2 - 10}
              text="? cm"
              fontSize={18}
              fill="#EF4444"
              fontStyle="bold"
            />
          );
        }
      }

      // Show area label if given
      if (givenDimension && area) {
        shapes.push(
          <KonvaText
            key="area-label"
            x={x}
            y={y + pixelHeight / 2 - 12}
            width={pixelWidth}
            text={`Area = ${area} cm²`}
            fontSize={16}
            fill="#FFFFFF"
            align="center"
            fontStyle="bold"
          />
        );
      }
    } else if (shapeType === 'square') {
      const pixelSide = showGrid ? side * CELL_SIZE : Math.min(side * 25, 300);
      const x = centerX - pixelSide / 2;
      const y = centerY - pixelSide / 2;

      // Draw grid if Level 1
      if (showGrid) {
        for (let r = 0; r < side; r++) {
          for (let c = 0; c < side; c++) {
            shapes.push(
              <Rect
                key={`cell-${r}-${c}`}
                x={x + c * CELL_SIZE}
                y={y + r * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="#3B82F6"
                opacity={0.3}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1}
              />
            );
          }
        }
      } else {
        shapes.push(
          <Rect
            key="square"
            x={x}
            y={y}
            width={pixelSide}
            height={pixelSide}
            fill="#10B981"
            opacity={0.5}
            stroke={konvaTheme.shapeStroke}
            strokeWidth={3}
          />
        );
      }

      // Show dimension
      if (showDimensions || level === 2) {
        if (!unknownDimension) {
          shapes.push(
            <KonvaText
              key="side-label"
              x={x}
              y={y - 30}
              width={pixelSide}
              text={`${side} cm`}
              fontSize={18}
              fill={konvaTheme.labelText || '#F97316'}
              align="center"
              fontStyle="bold"
            />
          );
        } else {
          shapes.push(
            <KonvaText
              key="side-unknown"
              x={x}
              y={y - 30}
              width={pixelSide}
              text="? cm"
              fontSize={18}
              fill="#EF4444"
              align="center"
              fontStyle="bold"
            />
          );
        }
      }

      if (unknownDimension && area) {
        shapes.push(
          <KonvaText
            key="area-label"
            x={x}
            y={y + pixelSide / 2 - 12}
            width={pixelSide}
            text={`Area = ${area} cm²`}
            fontSize={16}
            fill="#FFFFFF"
            align="center"
            fontStyle="bold"
          />
        );
      }
    } else if (shapeType === 'triangle') {
      const pixelBase = Math.min(base * 20, 300);
      const pixelHeight = Math.min(height * 20, 250);
      const x1 = centerX - pixelBase / 2;
      const y1 = centerY + pixelHeight / 2;
      const x2 = centerX + pixelBase / 2;
      const y2 = y1;
      const x3 = centerX;
      const y3 = centerY - pixelHeight / 2;

      shapes.push(
        <Line
          key="triangle"
          points={[x1, y1, x2, y2, x3, y3]}
          fill="#8B5CF6"
          opacity={0.5}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={3}
          closed
        />
      );

      // Height line (dashed)
      shapes.push(
        <Line
          key="height-line"
          points={[x3, y3, x3, y1]}
          stroke="#EF4444"
          strokeWidth={2}
          dash={[5, 3]}
        />
      );

      // Labels
      if (showDimensions) {
        shapes.push(
          <KonvaText
            key="base-label"
            x={x1}
            y={y1 + 15}
            width={pixelBase}
            text={`base = ${base} cm`}
            fontSize={16}
            fill={konvaTheme.labelText || '#F97316'}
            align="center"
            fontStyle="bold"
          />
        );
        shapes.push(
          <KonvaText
            key="height-label"
            x={x3 + 10}
            y={y3 + pixelHeight / 2 - 10}
            text={`h = ${height} cm`}
            fontSize={16}
            fill="#EF4444"
            fontStyle="bold"
          />
        );
      }
    }

    return shapes;
  };

  if (!hasRequiredData) {
    return (
      <Container>
        <Title>Area & Perimeter - Level {level}</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Area & Perimeter - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
        {level >= 3 && level <= 5 && !Array.isArray(correctAnswer[0]) && (
          <Subtext>
            {level === 3 && 'Find the missing dimension'}
            {level === 4 && 'Calculate both area and perimeter'}
            {level === 5 && context && `Context: ${context}`}
          </Subtext>
        )}
      </QuestionSection>

      {/* Canvas Visualization */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer listening={false}>
            {/* Dark background */}
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Shape */}
            {renderShape()}
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Answer Input */}
      {!showAnswer && (
        <AnswerSection>
          <AnswerInput
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onSubmit={handleCheck}
            placeholder={
              Array.isArray(correctAnswer) && correctAnswer.length > 1
                ? "Enter area, perimeter (e.g., 24, 20)"
                : "Enter your answer"
            }
            disabled={showAnswer}
            autoFocus
          />
          <CheckButton onClick={handleCheck} disabled={!userAnswer || showAnswer}>
            Check Answer
          </CheckButton>
          {isCorrect === false && (
            <FeedbackText $correct={false}>
              Not quite. Try again!
            </FeedbackText>
          )}
          {isCorrect === true && (
            <FeedbackText $correct={true}>
              ✓ Correct!
            </FeedbackText>
          )}
        </AnswerSection>
      )}

      {/* Hint Section */}
      {!showAnswer && hint && (
        <HintSection>
          <HintTitle>💡 Hint:</HintTitle>
          <HintText>{hint}</HintText>
        </HintSection>
      )}

      {/* Explanation */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {isCorrect ? '✓ Excellent!' : 'Solution'}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
        </ExplanationSection>
      )}
    </Container>
  );
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  color: ${props => props.theme.colors.textPrimary};
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textPrimary};
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border-left: 4px solid ${props => props.theme.colors.primary || '#3B82F6'};
`;

const Question = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
`;

const Subtext = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 8px;
  font-style: italic;
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0;
  padding: 16px;
  background: transparent;
  border-radius: 12px;
  overflow-x: auto;
`;

const AnswerSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
`;

const CheckButton = styled.button`
  padding: 14px 32px;
  background: ${props => props.theme.colors.primary || '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$correct ? '#10B981' : '#EF4444'};
  margin: 0;
`;

const HintSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.inputBackground || '#f1efef'};
  border-left: 4px solid ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 8px;
`;

const HintTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.textPrimary};
`;

const HintText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ExplanationSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  border-radius: 8px;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.textPrimary};
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
`;
