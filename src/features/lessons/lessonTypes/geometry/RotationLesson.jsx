import React, { useState } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Circle, Text as KonvaText, Rect } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';

// ==================== HELPER FUNCTIONS ====================

// Convert grid coordinates to canvas pixels
// Grid coordinates: origin at (0,0), positive X right, positive Y up
// Canvas coordinates: origin at top-left, positive X right, positive Y down
function gridToCanvas(gridX, gridY, gridSize, offsetX, offsetY) {
  return {
    x: offsetX + gridX * gridSize,
    y: offsetY - gridY * gridSize, // Flip Y axis (canvas Y goes down, grid Y goes up)
  };
}

// ==================== MAIN COMPONENT ====================

export default function RotationLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const windowDimensions = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [currentRotation, setCurrentRotation] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    rotationAngle,
    centerOfRotation = { x: 0, y: 0 },
    originalShape = [],
    rotated90 = [],
    rotated180 = [],
    rotated270 = [],
  } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';

  // Check if we have the required data to render
  const hasRequiredData = originalShape.length > 0 && rotationAngle !== undefined;

  // Canvas configuration - match SymmetryLesson
  const gridSize = 30; // Size of each grid cell in pixels
  const canvasWidth = Math.min(windowDimensions.width - 40, 600);
  const canvasHeight = 600; // Square canvas like SymmetryLesson
  const offsetX = canvasWidth / 2; // Center of canvas horizontally
  const offsetY = canvasHeight / 2; // Center of canvas vertically
  const numGridLines = Math.ceil(canvasWidth / gridSize);

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setCurrentRotation(0);
    setIsCorrect(null);
  }

  // Get current shape based on rotation
  const getCurrentShape = () => {
    if (currentRotation === 0) return originalShape;
    if (currentRotation === 90) return rotated90.length > 0 ? rotated90 : originalShape;
    if (currentRotation === 180) return rotated180.length > 0 ? rotated180 : originalShape;
    if (currentRotation === 270) return rotated270.length > 0 ? rotated270 : originalShape;
    return originalShape;
  };

  const currentShape = getCurrentShape();

  const handleRotate = (angle) => {
    const newRotation = (currentRotation + angle) % 360;
    setCurrentRotation(newRotation);
  };

  const handleCheck = () => {
    // Check if current rotation matches the required rotation
    const correct = currentRotation === rotationAngle;
    setIsCorrect(correct);

    if (correct) {
      revealAnswer();
      setTimeout(() => {
        setCurrentRotation(0);
        setIsCorrect(null);
        hideAnswer();
        triggerNewProblem();
      }, 2000);
    }
  };

  const handleReset = () => {
    setCurrentRotation(0);
    setIsCorrect(null);
  };

  const handleTryAnother = () => {
    setCurrentRotation(0);
    setIsCorrect(null);
    hideAnswer();
    triggerNewProblem();
  };

  // Render grid - match SymmetryLesson theme
  const renderGrid = () => {
    const lines = [];

    // Grid lines
    for (let i = 0; i <= numGridLines; i++) {
      const pos = i * gridSize;
      const isCenter = Math.abs(pos - offsetX) < gridSize / 2;

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

  // Render shape
  const renderShape = (shape, color, opacity = 0.6) => {
    if (!shape || shape.length === 0) return null;

    const canvasPoints = shape.map(p => gridToCanvas(p.x, p.y, gridSize, offsetX, offsetY));
    const linePoints = canvasPoints.flatMap(p => [p.x, p.y]);
    linePoints.push(canvasPoints[0].x, canvasPoints[0].y); // Close the shape

    return (
      <>
        <Line
          points={linePoints}
          stroke={color}
          strokeWidth={2}
          fill={color}
          opacity={opacity}
          closed
        />
        {/* Vertices */}
        {canvasPoints.map((p, idx) => (
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

  // Render center of rotation
  const renderCenter = () => {
    const { x, y } = gridToCanvas(centerOfRotation.x, centerOfRotation.y, gridSize, offsetX, offsetY);
    const labelText = centerOfRotation.x === 0 && centerOfRotation.y === 0 ? "Origin" : `(${centerOfRotation.x}, ${centerOfRotation.y})`;

    return (
      <>
        <Circle
          x={x}
          y={y}
          radius={6}
          fill="#F97316"
          stroke={konvaTheme.shapeStroke}
          strokeWidth={2}
        />
        <KonvaText
          x={x + 10}
          y={y - 10}
          text={labelText}
          fontSize={14}
          fill="#F97316"
          fontStyle="italic"
        />
      </>
    );
  };

  if (!hasRequiredData) {
    return (
      <Container>
        <Title>Rotation - Level {level}</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Rotation - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
      </QuestionSection>

      {/* Canvas */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer listening={false}>
            {/* Dark background */}
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Grid */}
            {renderGrid()}

            {/* Original shape (blue, semi-transparent) */}
            {renderShape(originalShape, '#3B82F6', 0.4)}

            {/* Current rotated shape */}
            {renderShape(currentShape, isCorrect === true ? '#10B981' : isCorrect === false ? '#EF4444' : '#EF4444', 0.6)}

            {/* Center of rotation */}
            {renderCenter()}
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Controls */}
      <ControlsSection>
        <ControlButton onClick={() => handleRotate(90)} disabled={showAnswer}>
          Rotate 90°
        </ControlButton>
        <ControlButton onClick={() => handleRotate(180)} disabled={showAnswer}>
          Rotate 180°
        </ControlButton>
        <ControlButton onClick={() => handleRotate(270)} disabled={showAnswer}>
          Rotate 270°
        </ControlButton>
        <ControlButton onClick={handleReset} disabled={showAnswer} $secondary>
          Reset
        </ControlButton>
      </ControlsSection>

      <CheckSection>
        <CheckButton onClick={handleCheck} disabled={showAnswer || currentRotation === 0} $primary>
          Check Answer
        </CheckButton>
        {isCorrect !== null && (
          <ResultText $correct={isCorrect}>
            {isCorrect ? '✓ Correct!' : '✗ Try again'}
          </ResultText>
        )}
      </CheckSection>

      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {isCorrect ? '✓ Excellent!' : 'Keep practicing!'}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          {!isCorrect && (
            <TryAgainButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAgainButton>
          )}
        </ExplanationSection>
      )}

      {!showAnswer && hint && (
        <HintSection>
          <HintTitle>💡 Hint:</HintTitle>
          <HintText>{hint}</HintText>
        </HintSection>
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

const ControlsSection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 24px 0;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.$secondary
    ? props.theme.colors.buttonSecondary || '#6B7280'
    : props.theme.colors.primary || '#3B82F6'
  };
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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

const CheckSection = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
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

const ResultText = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.$correct ? '#10B981' : '#EF4444'};
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
  margin-bottom: 16px;
`;

const TryAgainButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary || '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
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
`;
