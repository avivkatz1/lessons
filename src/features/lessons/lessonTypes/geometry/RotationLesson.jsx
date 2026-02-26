import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line, Circle, Text } from 'react-konva';
import { useSelector } from 'react-redux';
import { useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../shared/components';
import { useInputOverlay } from './hooks/useInputOverlay';
import GridBackground from './components/areaPerimeter/GridBackground';
import ExplanationModal from './ExplanationModal';

// ==================== HELPER FUNCTIONS ====================

/**
 * Rotate a point (px, py) around center (cx, cy) by angleDegrees
 */
function rotatePoint(px, py, cx, cy, angleDegrees) {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Translate to origin
  const dx = px - cx;
  const dy = py - cy;

  // Rotate
  const rotatedX = dx * cos - dy * sin;
  const rotatedY = dx * sin + dy * cos;

  // Translate back
  return {
    x: rotatedX + cx,
    y: rotatedY + cy
  };
}

/**
 * Rotate an entire shape (array of points) around a center
 */
function rotateShape(shape, center, angleDegrees) {
  return shape.map(point =>
    rotatePoint(point.x, point.y, center.x, center.y, angleDegrees)
  );
}

/**
 * Convert grid coordinates to canvas pixels
 * Grid: (0,0) at center, positive X right, positive Y up
 * Canvas: (0,0) at top-left, positive X right, positive Y down
 */
function gridToCanvas(gridX, gridY, cellSize, canvasWidth, canvasHeight, gridSize) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  return {
    x: centerX + gridX * cellSize,
    y: centerY - gridY * cellSize // Flip Y axis
  };
}

/**
 * Convert canvas pixel coordinates to grid coordinates
 * Canvas: (0,0) at top-left, positive X right, positive Y down
 * Grid: (0,0) at center, positive X right, positive Y up
 */
function canvasToGrid(canvasX, canvasY, cellSize, canvasWidth, canvasHeight) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const gridX = Math.round((canvasX - centerX) / cellSize);
  const gridY = Math.round((centerY - canvasY) / cellSize); // Flip Y axis
  return { x: gridX, y: gridY };
}

// ==================== LESSON DATA GENERATORS ====================

function generateLevel1Data(questionIndex) {
  // Level 1: Origin rotation, 90° CW only
  const shapes = [
    [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 3 }], // Triangle
    [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }], // Square
  ];

  const shape = shapes[questionIndex % shapes.length];
  const center = { x: 0, y: 0 };
  const targetAngle = 90;

  return {
    level: 1,
    shape,
    centerOfRotation: center,
    targetAngle,
    showCenter: true,
    showAngleArc: true,
    showGrid: true,
    interactionMode: 'buttons',
    hint: 'Rotation turns the shape around a point. Click "Rotate 90° CW" to rotate clockwise.',
    explanation: `A 90° clockwise rotation turns the shape a quarter-turn to the right around the origin (0, 0).`
  };
}

function generateLevel2Data(questionIndex) {
  // Level 2: User-placed anchor point, multiple angles
  const shapes = [
    [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 3 }], // Triangle
    [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }], // Square
    [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 1 }], // Diamond
  ];

  const angles = [90, 180, 270];
  const centers = [
    { x: 2, y: 2 },
    { x: 1, y: 1 },
    { x: 3, y: 2 },
    { x: 2, y: 1 },
    { x: 1, y: 2 }
  ];

  const shape = shapes[questionIndex % shapes.length];
  const targetAngle = angles[questionIndex % angles.length];
  const center = centers[questionIndex % centers.length];

  return {
    level: 2,
    shape,
    centerOfRotation: center,
    targetAngle,
    showCenter: false, // Hide target center - student must find it
    showAngleArc: false,
    showGrid: true,
    interactionMode: 'buttons',
    hint: `Click on the grid to place your anchor point (the center of rotation). Then use the rotation buttons. The anchor turns orange at first, then green when you place it correctly. If you move the anchor, the shape will reset.`,
    explanation: `The shape rotates ${targetAngle}° clockwise around the point (${center.x}, ${center.y}). Finding the center of rotation is key!`
  };
}

function generateLevel3Data(questionIndex) {
  // Level 3: Arbitrary center, 90° CW only
  const shapes = [
    [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 3 }], // Triangle
    [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 1, y: 2 }], // Rectangle
  ];

  const centers = [
    { x: 2, y: 2 },
    { x: 1, y: 1 },
    { x: 3, y: 2 },
    { x: 2, y: 1 },
    { x: 1, y: 2 }
  ];

  const shape = shapes[questionIndex % shapes.length];
  const center = centers[questionIndex % centers.length];
  const targetAngle = 90;

  // Progressive scaffolding: show center for Q1-3, hide for Q4-5
  const showCenter = questionIndex < 3;

  return {
    level: 3,
    shape,
    centerOfRotation: center,
    targetAngle,
    showCenter,
    showAngleArc: false,
    showGrid: true,
    interactionMode: 'buttons',
    hint: showCenter
      ? `The orange point shows the center of rotation. The shape rotates around that point.`
      : `Find the center of rotation by observing which point stays fixed when rotating.`,
    explanation: `The shape rotates 90° clockwise around the point (${center.x}, ${center.y}).`
  };
}

function generateLevel4Data(questionIndex) {
  // Level 4: Arbitrary center, input angle
  const shapes = [
    [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 2 }], // Pentagon
    [{ x: 0, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 0 }], // Irregular quad
  ];

  const centers = [
    { x: 2, y: 1 },
    { x: 1, y: 2 },
    { x: 3, y: 1 },
    { x: 2, y: 2 },
    { x: 1, y: 1 }
  ];

  const angles = [90, 180, 270];

  const shape = shapes[questionIndex % shapes.length];
  const center = centers[questionIndex % centers.length];
  const targetAngle = angles[questionIndex % angles.length];

  return {
    level: 4,
    shape,
    centerOfRotation: center,
    targetAngle,
    showCenter: false,
    showAngleArc: false,
    showGrid: false, // Reduce scaffolding
    interactionMode: 'input',
    hint: `Compare the original and target shapes. How many degrees did it rotate?`,
    explanation: `The shape rotated ${targetAngle}° clockwise around (${center.x}, ${center.y}).`
  };
}

function generateLevel5Data(questionIndex) {
  // Level 5: Complex shapes, input mode
  const shapes = [
    [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 2 }], // Complex pentagon
    [{ x: 1, y: 1 }, { x: 2, y: 0 }, { x: 4, y: 1 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 2 }], // Hexagon
  ];

  const centers = [
    { x: 2, y: 2 },
    { x: 3, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 }
  ];

  const angles = [90, 180, 270];

  const shape = shapes[questionIndex % shapes.length];
  const center = centers[questionIndex % centers.length];
  const targetAngle = angles[questionIndex % angles.length];

  return {
    level: 5,
    shape,
    centerOfRotation: center,
    targetAngle,
    showCenter: false,
    showAngleArc: false,
    showGrid: false,
    interactionMode: 'input',
    hint: `Carefully observe the original and target positions. Calculate the rotation angle.`,
    explanation: `A ${targetAngle}° clockwise rotation around (${center.x}, ${center.y}) transforms the shape to match the target.`
  };
}

// ==================== MAIN COMPONENT ====================

function RotationLesson({ triggerNewProblem }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Get lesson data from Redux
  const lessonProps = useSelector((state) => state.lesson.lessonProps);
  const { levelNum = 1, visualData, hint, explanation } = lessonProps;
  const level = parseInt(levelNum) || 1;

  // For batch mode (question array)
  const questionAnswerArray = useSelector((state) => state.lesson.questionAnswerArray);
  const currentQuestionIndex = useSelector((state) => state.lesson.currentQuestionIndex);

  // Use current question from array if available, otherwise use lessonProps
  const currentProblem = questionAnswerArray && questionAnswerArray.length > 0
    ? questionAnswerArray[currentQuestionIndex]
    : lessonProps;

  const questionIndex = currentQuestionIndex || 0;

  // Calculate progress
  const totalQuestions = questionAnswerArray?.length || 10;
  const progressPercentage = ((questionIndex + 1) / totalQuestions) * 100;

  // State
  const [currentRotation, setCurrentRotation] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Level 2: User-placed anchor point
  const [userAnchor, setUserAnchor] = useState(null); // {x, y} in grid coordinates
  const [anchorPlaced, setAnchorPlaced] = useState(false);

  // Input overlay for Levels 4-5
  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll
  } = useInputOverlay();

  // Get data from current problem (from backend) or generate fallback
  const propsVisualData = currentProblem?.visualData || {};
  const propsHint = currentProblem?.hint || hint || '';
  const propsExplanation = currentProblem?.explanation || explanation || '';

  // Normalize backend data format to component format
  const normalizedData = useMemo(() => {
    // If data comes from backend, normalize it
    if (propsVisualData.originalShape) {
      return {
        shape: propsVisualData.originalShape,
        centerOfRotation: propsVisualData.centerOfRotation || { x: 0, y: 0 },
        targetAngle: propsVisualData.rotationAngle || 90,
        showCenter: level <= 3, // Show center for levels 1-3 (now combined)
        showGrid: true, // Always show grid for button mode
        interactionMode: level <= 3 ? 'buttons' : 'input',
        hint: propsHint,
        explanation: propsExplanation
      };
    }

    // Fallback: generate data if none provided
    // Levels 1-3 are now combined into one button-based level
    if (level <= 3) return generateLevel1Data(questionIndex);
    if (level === 4) return generateLevel4Data(questionIndex);
    if (level === 5) return generateLevel5Data(questionIndex);
    return generateLevel1Data(questionIndex);
  }, [level, questionIndex, propsVisualData, propsHint, propsExplanation]);

  const {
    shape,
    centerOfRotation,
    targetAngle,
    showCenter,
    showGrid,
    interactionMode,
    hint: normalizedHint,
    explanation: normalizedExplanation
  } = normalizedData;

  const gridSize = 12; // 12x12 grid (even number - origin falls between center cells)
  const cellSize = 40; // Grid cells 25% smaller (52 * 0.75 ≈ 39, using 40 for cleaner math)
  const canvasHeight = 480; // Height adjusted for even grid alignment (12 * 40)

  // Canvas width - make it square for proper grid alignment
  const canvasWidth = useMemo(() => {
    const idealWidth = gridSize * cellSize; // 480px for square grid
    const padding = 40;
    const maxWidth = Math.min(windowWidth - padding, idealWidth);
    return maxWidth;
  }, [windowWidth, gridSize, cellSize]);

  // Effective center of rotation
  // Level 2: Use user-placed anchor if available, otherwise use centerOfRotation
  // Other levels: Use centerOfRotation from data
  const effectiveCenter = useMemo(() => {
    if (level === 2 && userAnchor) {
      return userAnchor;
    }
    return centerOfRotation;
  }, [level, userAnchor, centerOfRotation]);

  // Calculate rotated shape
  const currentShape = useMemo(() => {
    return rotateShape(shape, effectiveCenter, currentRotation);
  }, [shape, effectiveCenter, currentRotation]);

  const targetShape = useMemo(() => {
    return rotateShape(shape, centerOfRotation, targetAngle);
  }, [shape, centerOfRotation, targetAngle]);

  // Check if current rotation is correct
  const isCorrect = useMemo(() => {
    if (interactionMode === 'buttons') {
      // Level 2: Check both anchor position and rotation
      if (level === 2) {
        if (!userAnchor) return false;

        // Check anchor position matches target center
        const anchorMatches = userAnchor.x === centerOfRotation.x && userAnchor.y === centerOfRotation.y;
        if (!anchorMatches) return false;

        // Check rotation angle
        const normalizedCurrent = ((currentRotation % 360) + 360) % 360;
        const normalizedTarget = ((targetAngle % 360) + 360) % 360;
        return normalizedCurrent === normalizedTarget;
      }

      // Level 1, 3: Just check rotation
      // Accept any multiple of 90 degrees (90, 180, 270, 360, 450, -90, -180, etc.)
      // Normalize both angles to 0-359 range for comparison
      const normalizedCurrent = ((currentRotation % 360) + 360) % 360;
      const normalizedTarget = ((targetAngle % 360) + 360) % 360;
      return normalizedCurrent === normalizedTarget;
    } else {
      // Input mode
      if (submitted && inputValue.trim() !== '') {
        const enteredAngle = parseInt(inputValue);
        // Accept any multiple of 90 degrees by normalizing
        const normalizedEntered = ((enteredAngle % 360) + 360) % 360;
        const normalizedTarget = ((targetAngle % 360) + 360) % 360;
        return normalizedEntered === normalizedTarget;
      }
      return false;
    }
  }, [interactionMode, currentRotation, targetAngle, submitted, inputValue, level, userAnchor, centerOfRotation]);

  // Reset on problem change
  useEffect(() => {
    setCurrentRotation(0);
    setFeedback(null);
    setIsComplete(false);
    setShowHint(false);
    setUserAnchor(null);
    setAnchorPlaced(false);
    resetAll();
  }, [questionIndex, level, resetAll]);

  // Debug: Log shape data
  useEffect(() => {
    console.log('=== ROTATION LESSON DEBUG ===');
    console.log('Level:', level);
    console.log('Target Angle:', targetAngle);
    console.log('Center of Rotation:', centerOfRotation);
    console.log('Original Shape:', shape);
    console.log('Target Shape (should be rotated):', targetShape);
    console.log('Current Shape:', currentShape);
    console.log('Current Rotation:', currentRotation);
    console.log('=============================');
  }, [level, targetAngle, centerOfRotation, shape, targetShape, currentShape, currentRotation]);

  // Reset shape when anchor moves (Level 2)
  useEffect(() => {
    if (level === 2 && userAnchor) {
      setCurrentRotation(0);
      setFeedback(null);
    }
  }, [userAnchor, level]);

  // Handle button-based rotation
  const handleRotate = (angleDelta) => {
    const newRotation = currentRotation + angleDelta;
    setCurrentRotation(newRotation);
    setFeedback(null);
  };

  const handleReset = () => {
    setCurrentRotation(0);
    setFeedback(null);
    setShowHint(false);
  };

  const handleCheckAnswer = () => {
    if (isCorrect) {
      setFeedback({ correct: true });
      setIsComplete(true);
    } else {
      setFeedback({ correct: false });
    }
  };

  // Handle input-based submission
  const handleSubmit = () => {
    if (inputValue.trim() === '') return;

    const enteredAngle = parseInt(inputValue);
    const validAngles = [
      targetAngle,
      targetAngle - 360,
      targetAngle + 360
    ].filter(a => Math.abs(a) <= 360);

    const correct = validAngles.includes(enteredAngle);
    setSubmitted(true);

    if (correct) {
      setCurrentRotation(targetAngle); // Apply rotation visually
      setIsComplete(true);
      // Close panel and show modal after delay
    }
    // If wrong, panel stays open for retry
  };

  // Success flow: close panel → delay → modal
  useEffect(() => {
    if (isComplete && interactionMode === 'input' && submitted) {
      closePanel();
    }
  }, [isComplete, interactionMode, submitted, closePanel]);

  const handleTryAnother = () => {
    setCurrentRotation(0);
    setFeedback(null);
    setIsComplete(false);
    setUserAnchor(null);
    setAnchorPlaced(false);
    resetAll();
    if (triggerNewProblem) {
      triggerNewProblem();
    }
  };

  // Handle canvas click (Level 2 - place anchor point)
  const handleCanvasClick = (e) => {
    if (level !== 2 || isComplete) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert canvas coordinates to grid coordinates
    const gridPos = canvasToGrid(pointerPos.x, pointerPos.y, cellSize, canvasWidth, canvasHeight);

    // Place/move anchor
    setUserAnchor(gridPos);
    setAnchorPlaced(true);
  };

  // Render shape on canvas
  const renderShape = (shapePoints, color, opacity) => {
    const canvasPoints = shapePoints.map(p =>
      gridToCanvas(p.x, p.y, cellSize, canvasWidth, canvasHeight, gridSize)
    );

    const flatPoints = canvasPoints.flatMap(p => [p.x, p.y]);

    return (
      <Line
        points={flatPoints}
        closed
        fill={color}
        opacity={opacity}
        stroke={konvaTheme.shapeStroke}
        strokeWidth={opacity > 0.4 ? 3 : 2}
        listening={false}
      />
    );
  };

  // Render center marker
  const renderCenterMarker = () => {
    if (!showCenter) return null;

    const centerCanvas = gridToCanvas(
      centerOfRotation.x,
      centerOfRotation.y,
      cellSize,
      canvasWidth,
      canvasHeight,
      gridSize
    );

    const labelText = centerOfRotation.x === 0 && centerOfRotation.y === 0
      ? 'Origin'
      : `(${centerOfRotation.x}, ${centerOfRotation.y})`;

    const fontSize = 14;
    // Move label down by its height (14px) from the original position
    const labelY = centerCanvas.y - 10 + fontSize;

    return (
      <>
        <Circle
          x={centerCanvas.x}
          y={centerCanvas.y}
          radius={6}
          fill="#F97316"
          stroke={konvaTheme.shapeStroke}
          strokeWidth={2}
          listening={false}
        />
        <Text
          x={centerCanvas.x + 10}
          y={labelY}
          text={labelText}
          fontSize={fontSize}
          fill="#F97316"
          fontStyle="italic"
          listening={false}
        />
      </>
    );
  };

  // Render user-placed anchor point (Level 2)
  const renderUserAnchor = () => {
    if (level !== 2 || !userAnchor) return null;

    const anchorCanvas = gridToCanvas(
      userAnchor.x,
      userAnchor.y,
      cellSize,
      canvasWidth,
      canvasHeight,
      gridSize
    );

    const isCorrectAnchor = userAnchor.x === centerOfRotation.x && userAnchor.y === centerOfRotation.y;
    const anchorColor = isCorrectAnchor ? '#10B981' : '#F97316'; // Green if correct, orange if not

    return (
      <>
        {/* Outer ring */}
        <Circle
          x={anchorCanvas.x}
          y={anchorCanvas.y}
          radius={10}
          stroke={anchorColor}
          strokeWidth={3}
          listening={false}
        />
        {/* Inner dot */}
        <Circle
          x={anchorCanvas.x}
          y={anchorCanvas.y}
          radius={4}
          fill={anchorColor}
          listening={false}
        />
        {/* Label */}
        <Text
          x={anchorCanvas.x + 12}
          y={anchorCanvas.y - 7}
          text={`Anchor (${userAnchor.x}, ${userAnchor.y})`}
          fontSize={13}
          fill={anchorColor}
          fontStyle="italic"
          listening={false}
        />
      </>
    );
  };

  return (
    <Container>
      {/* Hint button - top right corner */}
      {!isComplete && !showHint && normalizedHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Thin visual separator bar */}
      <SeparatorBar />

      {/* Enter Answer Button (Levels 4-5 only) */}
      {interactionMode === 'input' && !panelOpen && !isComplete && (
        <EnterAnswerButton onClick={openPanel} disabled={isComplete} />
      )}

      {/* Canvas */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight} onClick={handleCanvasClick}>
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
              listening={level === 2} // Only listen for clicks in Level 2
            />

            {/* Grid */}
            {showGrid && (
              <>
                <GridBackground
                  width={canvasWidth}
                  height={canvasHeight}
                  gridSize={gridSize}
                  cellSize={cellSize}
                  konvaTheme={konvaTheme}
                />

                {/* Bold axis lines through origin (aligned with grid) */}
                {/* With 12x12 grid, center is at cell 6, position 6 * cellSize */}
                <Line
                  points={[(gridSize / 2) * cellSize, 0, (gridSize / 2) * cellSize, canvasHeight]}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2.5}
                  opacity={0.6}
                  listening={false}
                />
                <Line
                  points={[0, (gridSize / 2) * cellSize, canvasWidth, (gridSize / 2) * cellSize]}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2.5}
                  opacity={0.6}
                  listening={false}
                />
              </>
            )}

            {/* Ghost shape (original unrotated position) - very faint, never moves */}
            {renderShape(shape, '#808080', 0.2)}

            {/* Target shape (where it should end up) - blue, semi-transparent */}
            {renderShape(targetShape, '#3B82F6', 0.3)}

            {/* Current shape (student's rotation) - red or green */}
            {renderShape(
              currentShape,
              isCorrect && (feedback?.correct || (submitted && isComplete)) ? '#10B981' : '#EF4444',
              0.6
            )}

            {/* Center of rotation marker */}
            {renderCenterMarker()}

            {/* User-placed anchor point (Level 2) */}
            {renderUserAnchor()}
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Hint box (shown when button clicked) */}
      {!isComplete && normalizedHint && showHint && (
        <HintBox>{normalizedHint}</HintBox>
      )}

      {/* Button controls (Levels 1-3) */}
      {interactionMode === 'buttons' && !isComplete && (
        <>
          {/* All controls in one row */}
          <ButtonRow>
            <ResetButton onClick={handleReset}>
              Reset
            </ResetButton>
            <RotateButton
              onClick={() => handleRotate(-90)}
              $isClockwise={false}
              disabled={level === 2 && !anchorPlaced}
            >
              Rotate 90° CCW
            </RotateButton>
            <RotationDisplay>
              Current Rotation: {currentRotation}° CW
            </RotationDisplay>
            <RotateButton
              onClick={() => handleRotate(90)}
              $isClockwise={true}
              disabled={level === 2 && !anchorPlaced}
            >
              Rotate 90° CW
            </RotateButton>
            <CheckButton
              onClick={handleCheckAnswer}
              disabled={level === 2 && !anchorPlaced}
            >
              Check Answer
            </CheckButton>
          </ButtonRow>

          {feedback && (
            <FeedbackText $isCorrect={feedback.correct}>
              {feedback.correct ? '✓ Correct!' : '✗ Try again'}
            </FeedbackText>
          )}
        </>
      )}

      {/* Input Overlay Panel (Levels 4-5) */}
      {interactionMode === 'input' && (
        <InputOverlayPanel
          visible={panelOpen}
          onClose={closePanel}
          title="Calculate Rotation Angle"
        >
          <InputLabel>Rotation angle (degrees):</InputLabel>

          <SlimMathKeypad
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
          />

          {submitted && (
            <FeedbackSection $isCorrect={isCorrect}>
              {isCorrect ? (
                <FeedbackText>
                  ✓ Correct! The shape rotated {targetAngle}° clockwise.
                </FeedbackText>
              ) : (
                <FeedbackText>
                  Not quite. Compare the original and target positions carefully.
                </FeedbackText>
              )}
            </FeedbackSection>
          )}

          <PanelButtonRow>
            <ClearButton onClick={() => { setInputValue(''); setSubmitted(false); }}>
              Clear
            </ClearButton>
            {submitted && isCorrect && (
              <NextButton onClick={handleTryAnother}>
                Next Problem
              </NextButton>
            )}
          </PanelButtonRow>
        </InputOverlayPanel>
      )}

      {/* Explanation Modal */}
      {isComplete && (
        <ExplanationModal
          explanation={normalizedExplanation}
          onTryAnother={handleTryAnother}
        />
      )}

      {/* Simple thin progress bar */}
      <ProgressBarContainer>
        <ProgressBarFill $progress={progressPercentage} />
      </ProgressBarContainer>
    </Container>
  );
}

export default RotationLesson;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 16px;

  @media (max-width: 1024px) {
    padding: 12px;
    gap: 12px;
  }
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 3px;
  }
`;

const LevelBadge = styled.span`
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: 1024px) {
    padding: 2px 10px;
    font-size: 12px;
  }
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const SeparatorBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 3px;
  background-color: ${props => props.theme.colors.border};
  border-radius: 2px;
  margin: 8px 0;

  @media (max-width: 1024px) {
    height: 2px;
    margin: 6px 0;
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
  }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 650px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.warning || '#F59E0B'};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const RotationDisplay = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  padding: 12px 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  border: 3px solid #10B981;
  text-align: center;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  min-height: 44px;
  display: flex;
  align-items: center;
  white-space: nowrap;

  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 10px 16px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const RotateButton = styled.button`
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid ${props => props.$isClockwise ? '#10B981' : '#EF4444'};
  cursor: pointer;
  background-color: transparent;
  color: ${props => props.$isClockwise ? '#10B981' : '#EF4444'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    background-color: ${props => props.$isClockwise ? '#10B981' : '#EF4444'};
    color: white;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 1024px) {
    padding: 12px 20px;
    font-size: 15px;
  }
`;

const ResetButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;

const CheckButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.theme.colors.cardBackground};
  color: #10B981;
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;

const FeedbackText = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isCorrect ? '#10B981' : '#EF4444'};
  margin: 0;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const InputLabel = styled.label`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: -8px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const FeedbackSection = styled.div`
  padding: 16px 24px;
  background-color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess + '20'
    : props.theme.colors.buttonDanger + '20'
  };
  border-radius: 8px;
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonDanger
  };

  @media (max-width: 1024px) {
    padding: 12px 20px;
  }
`;

const PanelButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const ClearButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const NextButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 28px;
    font-size: 15px;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: #D1D5DB;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 20px;

  @media (max-width: 1024px) {
    height: 3px;
    margin-top: 16px;
  }
`;

const ProgressBarFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: #10B981;
  transition: width 0.3s ease-in-out;
  border-radius: 2px;
`;
