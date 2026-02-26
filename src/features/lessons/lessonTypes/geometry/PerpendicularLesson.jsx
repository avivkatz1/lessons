import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Circle, Text as KonvaText, Rect, Group, Transformer } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== CONSTANTS ====================

const GRID_SIZE = 30; // pixels per grid unit
const SQUARE_SIZE = 40; // pixels for the test square

// ==================== HELPER FUNCTIONS ====================

// Convert math coordinates to canvas pixels
function mathToCanvas(mathX, mathY, gridSize, offsetX, offsetY) {
  return {
    x: offsetX + mathX * gridSize,
    y: offsetY - mathY * gridSize, // Flip Y
  };
}

// Calculate line intersection point
function getIntersection(line1, line2) {
  const { slope: m1, yIntercept: b1 } = line1;
  const { slope: m2, yIntercept: b2 } = line2;

  if (Math.abs(m1 - m2) < 0.01) return null; // Parallel lines

  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;

  return { x, y };
}

// Check if slopes are perpendicular (multiply to -1)
function arePerpendicular(slope1, slope2, tolerance = 0.1) {
  const product = slope1 * slope2;
  return Math.abs(product + 1) < tolerance;
}

// ==================== MAIN COMPONENT ====================

export default function PerpendicularLesson({ triggerNewProblem }) {
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

  const [squarePosition, setSquarePosition] = useState({ x: 0, y: 0 });
  const [squareRotation, setSquareRotation] = useState(0);
  const [isSquareSelected, setIsSquareSelected] = useState(false);
  const [selectedLines, setSelectedLines] = useState([]);
  const [adjustableSlope, setAdjustableSlope] = useState(0);
  const [selectedEquations, setSelectedEquations] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const squareRef = useRef();
  const transformerRef = useRef();

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    interactionType,
    lines = [],
    perpendicularPair = [],
    targetLine,
    correctSlope,
    startSlope = 0,
    givenLine,
    point,
    equations = [],
    labels = [],
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
  const hasRequiredData = level > 0;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setSquarePosition({ x: 0, y: 0 });
    setSquareRotation(0);
    setIsSquareSelected(false);
    setSelectedLines([]);
    setAdjustableSlope(startSlope || 0);
    setSelectedEquations([]);
    setUserAnswer('');
    setIsCorrect(null);
  }

  // Attach transformer to square when selected
  useEffect(() => {
    console.log('Selection changed:', isSquareSelected);
    console.log('transformerRef:', transformerRef.current);
    console.log('squareRef:', squareRef.current);

    if (isSquareSelected && transformerRef.current && squareRef.current) {
      console.log('Attaching transformer to square');
      transformerRef.current.nodes([squareRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSquareSelected]);

  // Check if square is correctly positioned and rotated
  const checkSquarePlacement = () => {
    if (perpendicularPair.length !== 2 || !squareRef.current) return;

    const node = squareRef.current;
    const pos = { x: node.x(), y: node.y() };
    const rotation = node.rotation();

    const line1 = lines[perpendicularPair[0]];
    const line2 = lines[perpendicularPair[1]];
    const intersection = getIntersection(line1, line2);

    if (!intersection) return;

    const canvasPos = mathToCanvas(intersection.x, intersection.y, GRID_SIZE, offsetX, offsetY);
    const dist = Math.sqrt(Math.pow(pos.x - canvasPos.x, 2) + Math.pow(pos.y - canvasPos.y, 2));

    // Calculate the correct angle for the square to align with line1
    // The square's sides should be parallel to the two perpendicular lines
    const angleRad = Math.atan(line1.slope);
    const angleDeg = angleRad * (180 / Math.PI);

    // Normalize angles to -180 to 180 range for easier comparison
    const normalizeAngle = (angle) => {
      angle = angle % 360;
      if (angle > 180) angle -= 360;
      if (angle < -180) angle += 360;
      return angle;
    };

    const normalizedRotation = normalizeAngle(rotation);
    const normalizedTarget = normalizeAngle(angleDeg);

    // Check if rotation is within 20 degrees of the target angle or any 90° multiple from it
    // (since the square has 4-fold rotational symmetry)
    const rotationMatches = [0, 90, 180, 270].some(offset => {
      const target = normalizeAngle(normalizedTarget + offset);
      const diff = Math.abs(normalizedRotation - target);
      return diff < 20;
    });

    // If both position and rotation are correct, snap into place
    if (dist < 40 && rotationMatches) {
      console.log('Correct placement! Snapping into position');
      console.log('Line1 slope:', line1.slope, 'Target angle:', angleDeg);

      // Snap to the exact angle that aligns with line1
      // Find which 90° multiple is closest to current rotation
      const snapAngles = [0, 90, 180, 270].map(offset => normalizeAngle(angleDeg + offset));
      const closestSnapAngle = snapAngles.reduce((closest, angle) => {
        const diff = Math.abs(normalizedRotation - angle);
        const closestDiff = Math.abs(normalizedRotation - closest);
        return diff < closestDiff ? angle : closest;
      });

      setSquarePosition(canvasPos);
      setSquareRotation(closestSnapAngle);
      setIsSquareSelected(false);
      setIsCorrect(true);
      revealAnswer();
    }
  };

  // Handle square drag and transform (L1)
  const handleSquareDragEnd = (e) => {
    const node = squareRef.current;
    const pos = { x: node.x(), y: node.y() };
    setSquarePosition(pos);
    checkSquarePlacement();
  };

  const handleSquareTransformEnd = () => {
    const node = squareRef.current;
    setSquareRotation(node.rotation());
    checkSquarePlacement();
  };

  const handleSquareClick = (e) => {
    e.cancelBubble = true; // Prevent stage click from firing
    console.log('Square clicked, setting selected to true');
    setIsSquareSelected(true);
  };

  const handleStageClick = (e) => {
    // Deselect if clicking on stage background
    if (e.target === e.target.getStage()) {
      console.log('Stage clicked, deselecting square');
      setIsSquareSelected(false);
    }
  };

  // Handle line click (L2)
  const handleLineClick = (lineIndex) => {
    if (interactionType !== 'click-pair') return;

    let newSelected = [...selectedLines];
    if (newSelected.includes(lineIndex)) {
      newSelected = newSelected.filter(i => i !== lineIndex);
    } else {
      newSelected.push(lineIndex);
      if (newSelected.length > 2) newSelected.shift();
    }
    setSelectedLines(newSelected);

    // Check if correct pair selected
    if (newSelected.length === 2) {
      const correct = (
        (newSelected.includes(perpendicularPair[0]) && newSelected.includes(perpendicularPair[1]))
      );
      setIsCorrect(correct);
      if (correct) {
        revealAnswer();
        setTimeout(() => {
          setSelectedLines([]);
          setIsCorrect(null);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    }
  };

  // Handle slope adjustment (L3)
  const handleSlopeChange = (e) => {
    const newSlope = parseFloat(e.target.value);
    setAdjustableSlope(newSlope);

    if (Math.abs(newSlope - correctSlope) < 0.1) {
      setIsCorrect(true);
      revealAnswer();
      setTimeout(() => {
        setAdjustableSlope(startSlope || 0);
        setIsCorrect(null);
        hideAnswer();
        triggerNewProblem();
      }, 2500);
    }
  };

  // Handle equation selection (L4)
  const handleEquationClick = (index) => {
    if (interactionType !== 'select-equations') return;

    let newSelected = [...selectedEquations];
    if (newSelected.includes(index)) {
      newSelected = newSelected.filter(i => i !== index);
    } else {
      newSelected.push(index);
      if (newSelected.length > 2) newSelected.shift();
    }
    setSelectedEquations(newSelected);

    // Check if correct pair selected
    if (newSelected.length === 2) {
      const correct = (
        (newSelected.includes(perpendicularPair[0]) && newSelected.includes(perpendicularPair[1]))
      );
      setIsCorrect(correct);
      if (correct) {
        revealAnswer();
        setTimeout(() => {
          setSelectedEquations([]);
          setIsCorrect(null);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    }
  };

  // Handle typed answer (L5)
  const handleCheckAnswer = () => {
    const cleanUser = userAnswer.trim().toLowerCase().replace(/\s/g, '');
    const cleanCorrect = correctAnswer[0]?.toLowerCase().replace(/\s/g, '') || '';

    const correct = cleanUser === cleanCorrect || cleanUser.includes(cleanCorrect);
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
    const gridLines = [];

    for (let i = 0; i <= numGridLines; i++) {
      const pos = i * GRID_SIZE;
      const isCenter = Math.abs(pos - offsetX) < GRID_SIZE / 2;

      // Horizontal
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, pos, canvasWidth, pos]}
          stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
          strokeWidth={isCenter ? 2.5 : 1}
          opacity={isCenter ? 0.6 : 0.3}
        />
      );

      // Vertical
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[pos, 0, pos, canvasHeight]}
          stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
          strokeWidth={isCenter ? 2.5 : 1}
          opacity={isCenter ? 0.6 : 0.3}
        />
      );
    }

    return gridLines;
  };

  // Render line from math coordinates
  const renderLine = (line, clickable = false, lineIndex = null) => {
    if (!line) return null;

    const p1 = mathToCanvas(line.x1, line.y1, GRID_SIZE, offsetX, offsetY);
    const p2 = mathToCanvas(line.x2, line.y2, GRID_SIZE, offsetX, offsetY);

    const isSelected = selectedLines.includes(lineIndex);

    return (
      <Line
        key={`line-${lineIndex}`}
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={line.color}
        strokeWidth={isSelected ? 5 : 3}
        onClick={clickable ? () => handleLineClick(lineIndex) : undefined}
        onTap={clickable ? () => handleLineClick(lineIndex) : undefined}
      />
    );
  };

  // Render draggable and rotatable square (L1)
  const renderSquareGroup = () => {
    return (
      <Group
        ref={squareRef}
        draggable
        x={squarePosition.x}
        y={squarePosition.y}
        rotation={squareRotation}
        offsetX={SQUARE_SIZE / 2}
        offsetY={SQUARE_SIZE / 2}
        onClick={handleSquareClick}
        onTap={handleSquareClick}
        onDragEnd={handleSquareDragEnd}
        onTransformEnd={handleSquareTransformEnd}
      >
        <Rect
          x={0}
          y={0}
          width={SQUARE_SIZE}
          height={SQUARE_SIZE}
          stroke={isCorrect ? "#10B981" : (isSquareSelected ? "#3B82F6" : "#F97316")}
          strokeWidth={isCorrect ? 5 : (isSquareSelected ? 4 : 3)}
          fill={isCorrect ? "rgba(16, 185, 129, 0.2)" : "rgba(249, 115, 22, 0.1)"}
          dash={isCorrect ? [] : [5, 3]}
        />
        {/* Right angle marks */}
        <Line points={[5, 5, 5, 15, 15, 15]} stroke="#F97316" strokeWidth={2} />
        <Line points={[SQUARE_SIZE - 15, 5, SQUARE_SIZE - 5, 5, SQUARE_SIZE - 5, 15]} stroke="#F97316" strokeWidth={2} />
        <Line points={[5, SQUARE_SIZE - 15, 5, SQUARE_SIZE - 5, 15, SQUARE_SIZE - 5]} stroke="#F97316" strokeWidth={2} />
        <Line points={[SQUARE_SIZE - 15, SQUARE_SIZE - 5, SQUARE_SIZE - 5, SQUARE_SIZE - 5, SQUARE_SIZE - 5, SQUARE_SIZE - 15]} stroke="#F97316" strokeWidth={2} />
      </Group>
    );
  };

  if (!hasRequiredData) {
    return (
      <Container>
        <Title>Perpendicular Lines - Level {level}</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Perpendicular Lines - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
      </QuestionSection>

      {/* Canvas */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight} onClick={handleStageClick} onTap={handleStageClick}>
          <Layer listening={false}>
            {/* Dark background */}
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Grid */}
            {renderGrid()}

            {/* Lines for L1, L2, L3 */}
            {(interactionType === 'drag-square' || interactionType === 'click-pair') &&
              lines.map((line, idx) => renderLine(line, interactionType === 'click-pair', idx))}

            {/* Target line for L3 */}
            {interactionType === 'adjust-slope' && targetLine && renderLine(targetLine)}

            {/* Line and point for L5 */}
            {interactionType === 'type-equation' && givenLine && (
              <>
                {renderLine(givenLine)}
                {point && (() => {
                  const p = mathToCanvas(point.x, point.y, GRID_SIZE, offsetX, offsetY);
                  return (
                    <>
                      <Circle x={p.x} y={p.y} radius={6} fill="#F97316" />
                      <KonvaText
                        x={p.x + 10}
                        y={p.y - 10}
                        text={`(${point.x}, ${point.y})`}
                        fontSize={14}
                        fill="#F97316"
                        fontStyle="bold"
                      />
                    </>
                  );
                })()}
              </>
            )}

            {/* Origin marker */}
            <Circle x={offsetX} y={offsetY} radius={4} fill="#F97316" opacity={0.6} />
          </Layer>

          {/* Draggable square layer (L1) */}
          {interactionType === 'drag-square' && (
            <Layer>
              {renderSquareGroup()}
              {isSquareSelected && (
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={true}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Prevent resizing - keep original size, only allow rotation
                    if (newBox.width < 20 || newBox.height < 20) {
                      return oldBox;
                    }
                    // Lock to original size
                    return {
                      ...newBox,
                      width: oldBox.width,
                      height: oldBox.height,
                    };
                  }}
                />
              )}
            </Layer>
          )}

          {/* Adjustable line layer (L3) */}
          {interactionType === 'adjust-slope' && (
            <Layer listening={false}>
              {(() => {
                const adjLine = {
                  ...targetLine,
                  slope: adjustableSlope,
                  color: isCorrect ? '#10B981' : '#3B82F6',
                  yIntercept: 0,
                  x1: -6,
                  x2: 6,
                  y1: adjustableSlope * -6,
                  y2: adjustableSlope * 6,
                };
                return renderLine(adjLine);
              })()}
            </Layer>
          )}
        </Stage>
      </CanvasContainer>

      {/* Instructions for rotation (L1) */}
      {interactionType === 'drag-square' && !isCorrect && (
        <InstructionText>
          Click the square to select it, then use the rotation handle to rotate. Drag to test intersections.
        </InstructionText>
      )}

      {/* Next Problem button (L1) */}
      {interactionType === 'drag-square' && isCorrect && (
        <ControlSection>
          <FeedbackText $correct={true}>✓ Correct! The square fits perfectly at the perpendicular intersection.</FeedbackText>
          <CheckButton onClick={() => {
            setSquarePosition({ x: 0, y: 0 });
            setSquareRotation(0);
            setIsSquareSelected(false);
            setIsCorrect(null);
            hideAnswer();
            triggerNewProblem();
          }}>
            Next Problem
          </CheckButton>
        </ControlSection>
      )}

      {/* Slope control (L3) */}
      {interactionType === 'adjust-slope' && !showAnswer && (
        <ControlSection>
          <SliderLabel>Adjust Slope: {adjustableSlope.toFixed(2)}</SliderLabel>
          <Slider
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={adjustableSlope}
            onChange={handleSlopeChange}
          />
        </ControlSection>
      )}

      {/* Equation selection (L4) */}
      {interactionType === 'select-equations' && !showAnswer && (
        <EquationGrid>
          {equations.map((eq, idx) => (
            <EquationCard
              key={idx}
              $selected={selectedEquations.includes(idx)}
              onClick={() => handleEquationClick(idx)}
            >
              <EquationLabel>{labels[idx]}</EquationLabel>
              <EquationText>{eq}</EquationText>
            </EquationCard>
          ))}
        </EquationGrid>
      )}

      {/* Answer input (L5) */}
      {interactionType === 'type-equation' && !showAnswer && (
        <AnswerSection>
          <AnswerInput
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onSubmit={handleCheckAnswer}
            placeholder="Enter equation (e.g., y = -2x + 3)"
            disabled={showAnswer}
            autoFocus
          />
          <CheckButton onClick={handleCheckAnswer} disabled={!userAnswer || showAnswer}>
            Check Answer
          </CheckButton>
        </AnswerSection>
      )}

      {/* Feedback */}
      {isCorrect === false && !showAnswer && (
        <FeedbackText $correct={false}>
          Not quite. Try again!
        </FeedbackText>
      )}
      {isCorrect === true && (
        <FeedbackText $correct={true}>
          ✓ Correct!
        </FeedbackText>
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

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0;
  padding: 16px;
  background: transparent;
  border-radius: 12px;
  overflow-x: auto;
`;

const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
`;

const SliderLabel = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
`;

const Slider = styled.input`
  width: 300px;
  height: 8px;
  cursor: pointer;
`;

const InstructionText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin: 16px 0;
  font-style: italic;
`;

const EquationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 24px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const EquationCard = styled.div`
  padding: 20px;
  background: ${props => props.$selected ? props.theme.colors.primary + '20' : props.theme.colors.cardBackground};
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const EquationLabel = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const EquationText = styled.div`
  font-size: 18px;
  font-family: 'Courier New', monospace;
  color: ${props => props.theme.colors.textPrimary};
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
  text-align: center;
  margin: 16px 0;
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
  white-space: pre-line;
`;
