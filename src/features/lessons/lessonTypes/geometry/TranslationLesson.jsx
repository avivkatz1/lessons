import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line, Text as KonvaText, Circle } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== CONSTANTS ====================

const GRID_SIZE = 30; // pixels per grid unit

// ==================== HELPER FUNCTIONS ====================

// Convert grid coordinates to canvas pixels
function gridToCanvas(gridX, gridY, gridSize, offsetX, offsetY) {
  return {
    x: offsetX + gridX * gridSize,
    y: offsetY - gridY * gridSize, // Flip Y axis
  };
}

// Convert canvas pixels to grid coordinates
function canvasToGrid(canvasX, canvasY, gridSize, offsetX, offsetY) {
  return {
    x: Math.round((canvasX - offsetX) / gridSize),
    y: Math.round((offsetY - canvasY) / gridSize),
  };
}

// ==================== MAIN COMPONENT ====================

export default function TranslationLesson({ triggerNewProblem }) {
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
  const layerRef = useRef(null);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCorrect, setIsCorrect] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    interactionType = 'drag',
    showTargetOutline = false,
    showBothShapes = false,
    showNotation = false,
    showPartialNotation = false,
    notation = '',
    partialNotation = '',
    shapeType,
    originalShape = [],
    translatedShape = [],
    dx = 0,
    dy = 0,
  } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';
  const correctAnswer = currentProblem?.answer || [];

  // Canvas sizing
  const canvasWidth = Math.min(width - 40, 600);
  const canvasHeight = 600;
  const offsetX = canvasWidth / 2;
  const offsetY = canvasHeight / 2;
  const numGridLines = Math.ceil(canvasWidth / GRID_SIZE);

  // Check if we have required data
  const hasRequiredData = originalShape.length > 0;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setDragOffset({ x: 0, y: 0 });
    setIsCorrect(null);
    setUserAnswer('');
  }

  // Check if drag is correct
  const checkDragPosition = () => {
    const tolerance = 0.5; // Half a grid square
    const dragGridX = dragOffset.x / GRID_SIZE;
    const dragGridY = -dragOffset.y / GRID_SIZE; // Flip Y

    const distX = Math.abs(dragGridX - dx);
    const distY = Math.abs(dragGridY - dy);

    return distX < tolerance && distY < tolerance;
  };

  // Handle drag end for L1-L3
  const handleDragEnd = (e) => {
    const layer = e.target;
    const pos = layer.position();

    // Snap to grid
    const snappedX = Math.round(pos.x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(pos.y / GRID_SIZE) * GRID_SIZE;
    layer.position({ x: snappedX, y: snappedY });

    setDragOffset({ x: snappedX, y: snappedY });

    const correct = checkDragPosition();
    setIsCorrect(correct);

    if (correct) {
      revealAnswer();
      setTimeout(() => {
        setDragOffset({ x: 0, y: 0 });
        setIsCorrect(null);
        hideAnswer();
        triggerNewProblem();
      }, 2500);
    }
  };

  // Handle typed answer for L4-L5
  const handleCheckAnswer = () => {
    if (interactionType !== 'type') return;

    // Parse user input - expect "dx, dy" format
    const parts = userAnswer.split(',').map(s => s.trim().replace(/[^-0-9]/g, ''));

    if (parts.length !== 2) {
      setIsCorrect(false);
      return;
    }

    const userDx = parts[0];
    const userDy = parts[1];
    const correctDx = correctAnswer[0]?.replace(/[^-0-9]/g, '') || '';
    const correctDy = correctAnswer[1]?.replace(/[^-0-9]/g, '') || '';

    const correct = userDx === correctDx && userDy === correctDy;
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
  };

  // Render grid
  const renderGrid = () => {
    const lines = [];

    for (let i = 0; i <= numGridLines; i++) {
      const pos = i * GRID_SIZE;
      const isCenter = Math.abs(pos - offsetX) < GRID_SIZE / 2;

      // Horizontal line
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, pos, canvasWidth, pos]}
          stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
          strokeWidth={isCenter ? 2.5 : 1}
          opacity={isCenter ? 0.6 : 0.3}
        />
      );

      // Vertical line
      lines.push(
        <Line
          key={`v-${i}`}
          points={[pos, 0, pos, canvasHeight]}
          stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
          strokeWidth={isCenter ? 2.5 : 1}
          opacity={isCenter ? 0.6 : 0.3}
        />
      );
    }

    return lines;
  };

  // Render shape from grid coordinates
  const renderShape = (shape, color, opacity = 0.6, outline = false, dashed = false) => {
    if (!shape || shape.length === 0) return null;

    const canvasPoints = shape.map(p => gridToCanvas(p.x, p.y, GRID_SIZE, offsetX, offsetY));
    const linePoints = canvasPoints.flatMap(p => [p.x, p.y]);
    linePoints.push(canvasPoints[0].x, canvasPoints[0].y);

    return (
      <>
        <Line
          points={linePoints}
          stroke={color}
          strokeWidth={outline ? 3 : 2}
          fill={outline ? 'transparent' : color}
          opacity={opacity}
          closed
          dash={dashed ? [8, 4] : undefined}
        />
        {!outline && canvasPoints.map((p, idx) => (
          <Circle
            key={idx}
            x={p.x}
            y={p.y}
            radius={4}
            fill={color}
            stroke={konvaTheme.shapeStroke}
            strokeWidth={1.5}
          />
        ))}
      </>
    );
  };

  if (!hasRequiredData) {
    return (
      <Container>
        <Title>Translation - Level {level}</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Translation - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
        {showNotation && (
          <NotationText>{notation}</NotationText>
        )}
        {showPartialNotation && (
          <NotationText>{partialNotation}</NotationText>
        )}
      </QuestionSection>

      {/* Canvas */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer listening={false}>
            {/* Dark background */}
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Grid */}
            {renderGrid()}

            {/* Target outline (L1 only) */}
            {showTargetOutline && renderShape(translatedShape, '#10B981', 0.3, true, true)}

            {/* Both shapes visible (L4-L5) */}
            {showBothShapes && (
              <>
                {/* Original shape - blue */}
                {renderShape(originalShape, '#3B82F6', 0.5)}
                {/* Translated shape - red */}
                {renderShape(translatedShape, '#EF4444', 0.5)}
              </>
            )}

            {/* Origin marker */}
            <Circle
              x={offsetX}
              y={offsetY}
              radius={4}
              fill="#F97316"
              opacity={0.6}
            />
            <KonvaText
              x={offsetX + 8}
              y={offsetY - 15}
              text="(0,0)"
              fontSize={12}
              fill="#F97316"
              fontStyle="italic"
            />
          </Layer>

          {/* Draggable layer for L1-L3 */}
          {interactionType === 'drag' && !showBothShapes && (
            <Layer
              ref={layerRef}
              draggable
              onDragEnd={handleDragEnd}
              x={dragOffset.x}
              y={dragOffset.y}
            >
              {/* Original shape - draggable */}
              {renderShape(originalShape, isCorrect === true ? '#10B981' : isCorrect === false ? '#EF4444' : '#3B82F6', 0.7)}
            </Layer>
          )}
        </Stage>
      </CanvasContainer>

      {/* Instructions for drag levels */}
      {interactionType === 'drag' && !showAnswer && (
        <InstructionText>
          {level === 1 ? 'Drag the blue shape to match the green dashed outline' : 'Drag the blue shape to the correct position'}
        </InstructionText>
      )}

      {/* Answer Input for L4-L5 */}
      {interactionType === 'type' && !showAnswer && (
        <AnswerSection>
          <AnswerInput
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onSubmit={handleCheckAnswer}
            placeholder="Enter dx, dy (e.g., 5, -3)"
            disabled={showAnswer}
            autoFocus
          />
          <CheckButton onClick={handleCheckAnswer} disabled={!userAnswer || showAnswer}>
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

      {/* Feedback for drag levels */}
      {interactionType === 'drag' && isCorrect === false && !showAnswer && (
        <FeedbackSection>
          <FeedbackText $correct={false}>
            Not quite. Try dragging the shape to a different position.
          </FeedbackText>
        </FeedbackSection>
      )}

      {/* Hint */}
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

const NotationText = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: #F97316;
  margin-top: 12px;
  font-family: 'Courier New', monospace;
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

const InstructionText = styled.p`
  text-align: center;
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
  margin: 16px 0;
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

const FeedbackSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0;
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
