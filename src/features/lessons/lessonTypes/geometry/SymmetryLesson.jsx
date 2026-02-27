/**
 * SymmetryLesson - Multi-level reflection lesson with interactive grid
 *
 * LEVELS:
 *   L1-3: Click cells to build reflections (10×10 grid)
 *   L4: Enter coordinate pairs for reflected points (11×11 grid)
 *   L5: Diagonal reflection (10×10 grid)
 *
 * COORDINATE SYSTEM (Level 4 only):
 *   Grid Coordinates (backend/rendering):
 *     - Origin (0,0) at top-left
 *     - 11×11 grid: cols/rows 0-10
 *     - Used by backend and Konva rendering
 *
 *   Mathematical Coordinates (user input):
 *     - Origin (0,0) at center (grid position 5,5)
 *     - Range: x ∈ [-5,5], y ∈ [-5,5]
 *     - Students enter these coordinates
 *
 *   Transformation:
 *     gridCol = mathX + 5
 *     gridRow = 5 - mathY
 *
 *   Example: User enters (2, -2) → Transforms to grid (7, 7)
 *
 * REFLECTION FORMULAS:
 *   10×10 grid (L1-3,5): rc = 2*linePos - 1 - col  (line between cells)
 *   11×11 grid (L4):     rc = 2*linePos - col      (line on cell)
 *
 * DOCUMENTATION:
 *   Full guide: frontends/lessons/docs/guides/COORDINATE_GRID_SYSTEM.md
 *   Quick ref: frontends/lessons/docs/guides/COORDINATE_GRID_QUICK_REF.md
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import InputOverlayPanel from "../../../../shared/components/InputOverlayPanel";
import SlimMathKeypad from "../../../../shared/components/SlimMathKeypad";
import EnterAnswerButton from "../../../../shared/components/EnterAnswerButton";
import { useInputOverlay } from "./hooks/useInputOverlay";
import styled, { css } from "styled-components";
import { Stage, Layer, Rect, Line, Text, Circle } from "react-konva";
import ExplanationModal from "./ExplanationModal";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Vertical Reflection", instruction: "Click cells on the right to reflect the shape across the vertical line." },
  2: { title: "Horizontal Reflection", instruction: "Click cells below to reflect the shape across the horizontal line." },
  3: { title: "Combined Reflection", instruction: "Reflect the shape across the line of symmetry." },
  4: { title: "Plotting Reflections", instruction: "Find the reflected coordinates for each labeled point." },
  5: { title: "Diagonal Reflection", instruction: "Reflect the shape across the diagonal line (y = x)." },
};

// ==================== HELPERS ====================

function cellKey(r, c) {
  return `${r},${c}`;
}

function parseCellKey(key) {
  const [r, c] = key.split(",").map(Number);
  return [r, c];
}

function isOnReflectionSide(r, c, axis, linePosition, gridSize) {
  if (axis === "vertical") return c >= linePosition;
  if (axis === "horizontal") return r >= linePosition;
  if (axis === "diagonal") return r < c; // upper-right triangle
  return false;
}

/**
 * Transform mathematical coordinates to grid coordinates
 * Math coordinate system: origin (0,0) at center of 11×11 grid
 * Grid coordinate system: (0,0) at upper-left corner
 *
 * @param {number} mathX - Mathematical x-coordinate [-5, 5]
 * @param {number} mathY - Mathematical y-coordinate [-5, 5]
 * @returns {{ gridCol: number, gridRow: number }}
 */
function mathToGrid(mathX, mathY) {
  return {
    gridCol: mathX + 5,      // x=-5 → col=0, x=5 → col=10
    gridRow: 5 - mathY       // y=5 → row=0, y=-5 → row=10
  };
}

/**
 * Transform grid coordinates to mathematical coordinates
 * Inverse of mathToGrid - useful for debugging/display
 *
 * @param {number} gridCol - Grid column [0, 10]
 * @param {number} gridRow - Grid row [0, 10]
 * @returns {{ mathX: number, mathY: number }}
 */
function gridToMath(gridCol, gridRow) {
  return {
    mathX: gridCol - 5,      // col=0 → x=-5, col=10 → x=5
    mathY: 5 - gridRow       // row=0 → y=5, row=10 → y=-5
  };
}

/**
 * Parse coordinate string into {x, y} object
 * IMPORTANT: Uses MATHEMATICAL coordinate system
 * - Origin (0,0) at center of 11×11 grid
 * - Valid x range: [-5, 5]
 * - Valid y range: [-5, 5]
 *
 * Accepts: "2,3" | "(2,3)" | "( 2, 3 )" | "(-3, 4)"
 */
function parseCoordinate(input) {
  if (!input || input.trim() === '') {
    return { x: null, y: null, valid: false, error: 'Empty input' };
  }

  // Remove all spaces and parentheses
  const cleaned = input.replace(/[\s()]/g, '');

  // Match: optional minus + digits, comma, optional minus + digits
  const match = cleaned.match(/^(-?\d+),(-?\d+)$/);

  if (!match) {
    return { x: null, y: null, valid: false, error: 'Invalid format. Use: x,y' };
  }

  const x = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);

  // Validate MATHEMATICAL coordinate bounds (11×11 grid, origin at center)
  if (x < -5 || x > 5) {
    return {
      x,
      y,
      valid: false,
      error: 'x out of bounds. Valid range: -5 to 5'
    };
  }

  if (y < -5 || y > 5) {
    return {
      x,
      y,
      valid: false,
      error: 'y out of bounds. Valid range: -5 to 5'
    };
  }

  return { x, y, valid: true, error: '' };
}

/**
 * Format display string for coordinate input
 * @param {string} value - Raw input value (e.g., "7", "7,2", "(7,2)")
 */
function formatCoordinateDisplay(value) {
  if (!value || value.trim() === '') return '( __, __ )';

  const parsed = parseCoordinate(value);

  if (!parsed.valid) {
    // Show what user typed if invalid
    return `( ${value} )`;
  }

  // Pad numbers for visual consistency
  const xStr = String(parsed.x).padStart(2, ' ');
  const yStr = String(parsed.y).padStart(2, ' ');
  return `( ${xStr}, ${yStr} )`;
}

// ==================== MAIN COMPONENT ====================

function SymmetryLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [clickedCells, setClickedCells] = useState(new Set());
  const [checkResult, setCheckResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  // InputOverlay state (for Level 4 only)
  const {
    panelOpen,
    openPanel,
    closePanel,
    resetAll: resetPanel,
  } = useInputOverlay();

  // Level 4: Multi-input state for 4 coordinate pairs
  const [coordinates, setCoordinates] = useState({
    "A": { value: '', submitted: false, isCorrect: false },
    "B": { value: '', submitted: false, isCorrect: false },
    "C": { value: '', submitted: false, isCorrect: false },
  });
  const [focusedPoint, setFocusedPoint] = useState("A");
  const [allSubmitted, setAllSubmitted] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level,
    gridSize = 10,
    axis,
    linePosition,
    originalCells = [],
    reflectedCells = [],
    labeledPoints,
    reflectedPoints,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";

  const isPlottingLevel = level === 4;
  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Clear selections when problem or level changes
  useEffect(() => {
    setClickedCells(new Set());
    setCheckResult(null);
    setShowHint(false);
    setIsComplete(false);
    setModalClosedWithX(false);
    resetPanel(); // Reset panel state for Level 4
    // Reset Level 4 coordinates
    setCoordinates({
      "A": { value: '', submitted: false, isCorrect: false },
      "B": { value: '', submitted: false, isCorrect: false },
      "C": { value: '', submitted: false, isCorrect: false },
    });
    setFocusedPoint("A");
    setAllSubmitted(false);
  }, [currentQuestionIndex, level, resetPanel]);

  // Build sets for quick lookup
  const originalSet = useMemo(() => {
    const s = new Set();
    originalCells.forEach(([r, c]) => s.add(cellKey(r, c)));
    return s;
  }, [originalCells]);

  // For L4: accepted answers
  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || "")];
  }, [currentProblem]);

  // Calculate slide distance (60% for flexible content) - Level 4 only
  const slideDistance = useMemo(() => {
    if (width <= 768) return 0; // Mobile: no slide
    const panelWidth = Math.min(Math.max(width * 0.4, 360), 480);
    return panelWidth * 0.6; // 60% for flexible layout
  }, [width]);

  // Canvas sizing - reduce on iPad, shrink more when keypad is open
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(width - 40, 500);

    // Level 4 with keypad open: shrink significantly to fit
    if (isPlottingLevel && keypadOpen && width <= 1024) {
      return Math.min(baseMax, 320);
    }

    // iPad optimization: reduce canvas size
    if (width <= 1024) {
      return Math.min(baseMax, 400);
    }

    return baseMax;
  }, [width, isPlottingLevel, keypadOpen]);

  const cellSize = canvasWidth / gridSize;
  const canvasHeight = canvasWidth; // Square grid

  // Handle cell click (no useCallback — Konva needs fresh references each render)
  const handleCellClick = (r, c) => {
    if (isComplete) return;

    setCheckResult(null); // Clear previous check result
    setClickedCells((prev) => {
      const next = new Set(prev);
      const key = cellKey(r, c);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Handle stage click - determine which cell was clicked
  const handleStageClick = (e) => {
    if (isPlottingLevel) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const col = Math.floor(pos.x / cellSize);
    const row = Math.floor(pos.y / cellSize);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      handleCellClick(row, col);
    }
  };

  // Check answer for grid levels
  const handleCheckAnswer = () => {
    // Build expected set fresh from reflectedCells to avoid stale closure
    const expectedSet = new Set();
    reflectedCells.forEach(([r, c]) => expectedSet.add(cellKey(r, c)));

    const correct = new Set();
    const wrong = new Set();

    // Check which clicked cells are correct
    for (const key of clickedCells) {
      if (expectedSet.has(key)) {
        correct.add(key);
      } else {
        wrong.add(key);
      }
    }

    // Check which reflected cells are missing
    let missingCount = 0;
    for (const key of expectedSet) {
      if (!clickedCells.has(key)) {
        missingCount++;
      }
    }

    if (wrong.size === 0 && missingCount === 0) {
      setCheckResult({ correct: correct.size, total: expectedSet.size, wrong: new Set(), missingCount: 0 });
      if (!modalClosedWithX) {
        setIsComplete(true);
      }
    } else {
      setCheckResult({
        correct: correct.size,
        total: expectedSet.size,
        wrong,
        missingCount,
      });
    }
  };

  const handleClose = () => {
    setIsComplete(false);
    setModalClosedWithX(true);
  };

  const handleTryAnother = () => {
    setClickedCells(new Set());
    setCheckResult(null);
    setShowHint(false);
    setIsComplete(false);
    setModalClosedWithX(false);
    triggerNewProblem();
  };

  const handleReset = () => {
    setClickedCells(new Set());
    setCheckResult(null);
  };

  // Handle panel submission (Level 4 only)
  // Level 4: Handle keypad input change
  const handleKeypadChange = useCallback((value) => {
    // Store raw input value (e.g., "7", "7,", "7,2")
    // Reset submitted flag to allow re-submission if user edits
    setCoordinates(prev => ({
      ...prev,
      [focusedPoint]: {
        ...prev[focusedPoint],
        value,
        error: '',
        submitted: false,
        isCorrect: false,
      }
    }));
  }, [focusedPoint]);

  // Level 4: Submit individual coordinate
  const handleSubmitCoordinate = useCallback((point) => {
    const coord = coordinates[point];
    const parsed = parseCoordinate(coord.value);

    if (!parsed.valid) {
      setCoordinates(prev => ({
        ...prev,
        [point]: { ...prev[point], error: parsed.error }
      }));
      return;
    }

    // Validate against expected answer
    // Transform MATHEMATICAL coordinates to GRID coordinates for comparison
    // User enters math coords [-5,5], backend stores grid coords [0,10]
    const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);

    const expected = reflectedPoints?.find(p => p.label === `${point}'`);
    const isCorrectCoord = expected && expected.col === gridCol && expected.row === gridRow;

    setCoordinates(prev => ({
      ...prev,
      [point]: {
        ...prev[point],
        submitted: true,
        isCorrect: isCorrectCoord,
        error: '',
      }
    }));

    setAllSubmitted(true);

    // Auto-advance to next empty input
    const nextPoint = ["A", "B", "C"].find(
      p => p !== point && !coordinates[p].submitted
    );
    if (nextPoint) {
      setFocusedPoint(nextPoint);
    }
  }, [coordinates, reflectedPoints]);

  // Level 4: Calculate user-entered points with transformation to grid coords
  const userEnteredPoints = useMemo(() => {
    if (!isPlottingLevel) return [];

    const points = [];

    Object.entries(coordinates).forEach(([label, coord]) => {
      const parsed = parseCoordinate(coord.value);

      // Show points immediately when valid (live rendering)
      if (parsed.valid) {
        // Transform MATHEMATICAL coordinates to GRID coordinates for rendering
        const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);

        points.push({
          label: `${label}'`,
          x: gridCol,      // Grid column for Konva rendering (0-10)
          y: gridRow,      // Grid row for Konva rendering (0-10)
          isCorrect: coord.isCorrect,
          submitted: coord.submitted,  // Track submission status for coloring
        });
      }
    });

    return points;
  }, [coordinates, isPlottingLevel]);

  // Level 4: Check if all 4 are correct
  const allCorrect = useMemo(() => {
    if (!isPlottingLevel) return false;

    return ["A", "B", "C"].every(label => {
      const coord = coordinates[label];
      return coord.submitted && coord.isCorrect;
    });
  }, [coordinates, isPlottingLevel]);

  // Level 4: Auto-trigger modal when all correct
  useEffect(() => {
    if (allCorrect && !modalClosedWithX) {
      closePanel();
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allCorrect, modalClosedWithX, closePanel]);

  // Level 4: Reset all coordinates
  const handleResetCoordinates = useCallback(() => {
    setCoordinates({
      "A": { value: '', submitted: false, isCorrect: false },
      "B": { value: '', submitted: false, isCorrect: false },
      "C": { value: '', submitted: false, isCorrect: false },
    });
    setFocusedPoint("A");
    setAllSubmitted(false);
  }, []);

  if (!currentProblem || !axis) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <ContentWrapper $panelOpen={isPlottingLevel && panelOpen} $slideDistance={slideDistance}>
      {/* Hint button */}
      {!isComplete && !showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText
        dangerouslySetInnerHTML={{
          __html: level === 3 && currentProblem?.question?.[0]?.text
            ? currentProblem.question[0].text
            : info.instruction
        }}
      />

      {/* Konva grid */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer listening={false}>
            {/* Background */}
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Grid lines */}
            {Array.from({ length: gridSize + 1 }).map((_, i) => {
              const isCenter = i === Math.floor(gridSize / 2);
              return (
                <React.Fragment key={`grid-${i}`}>
                  {/* Horizontal line */}
                  <Line
                    points={[0, i * cellSize, canvasWidth, i * cellSize]}
                    stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
                    strokeWidth={isCenter ? 2.5 : 1}
                    opacity={isCenter ? 0.6 : 0.3}
                  />
                  {/* Vertical line */}
                  <Line
                    points={[i * cellSize, 0, i * cellSize, canvasHeight]}
                    stroke={isCenter ? konvaTheme.shapeStroke : konvaTheme.gridRegular}
                    strokeWidth={isCenter ? 2.5 : 1}
                    opacity={isCenter ? 0.6 : 0.3}
                  />
                </React.Fragment>
              );
            })}

            {/* Original shape cells (blue) */}
            {originalCells.map(([r, c]) => (
              <Rect
                key={`orig-${r}-${c}`}
                x={c * cellSize + 1}
                y={r * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fill="#3B82F6"
                opacity={0.6}
                cornerRadius={2}
              />
            ))}

            {/* Clicked cells (green or red based on check result) */}
            {Array.from(clickedCells).map((key) => {
              const [r, c] = parseCellKey(key);
              const isWrong = checkResult?.wrong?.has(key);
              return (
                <Rect
                  key={`click-${key}`}
                  x={c * cellSize + 1}
                  y={r * cellSize + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={isWrong ? "#EF4444" : "#10B981"}
                  opacity={isWrong ? 0.6 : 0.5}
                  cornerRadius={2}
                />
              );
            })}

            {/* Show correct answer on reveal */}
            {isComplete && reflectedCells.map(([r, c]) => {
              const key = cellKey(r, c);
              if (clickedCells.has(key)) return null;
              return (
                <Rect
                  key={`answer-${r}-${c}`}
                  x={c * cellSize + 1}
                  y={r * cellSize + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill="#10B981"
                  opacity={0.3}
                  stroke="#10B981"
                  strokeWidth={2}
                  dash={[4, 3]}
                  cornerRadius={2}
                />
              );
            })}

            {/* Line of symmetry - Hide for Level 3 */}
            {level !== 3 && axis === "vertical" && (
              <Line
                points={[linePosition * cellSize, 0, linePosition * cellSize, canvasHeight]}
                stroke="#F97316"
                strokeWidth={3}
                dash={[8, 4]}
              />
            )}
            {level !== 3 && axis === "horizontal" && (
              <Line
                points={[0, linePosition * cellSize, canvasWidth, linePosition * cellSize]}
                stroke="#F97316"
                strokeWidth={3}
                dash={[8, 4]}
              />
            )}
            {level !== 3 && axis === "diagonal" && (
              <Line
                points={[0, 0, canvasWidth, canvasHeight]}
                stroke="#F97316"
                strokeWidth={3}
                dash={[8, 4]}
              />
            )}

            {/* L4: Labeled points (snapped to grid intersections) */}
            {isPlottingLevel && labeledPoints && labeledPoints.map((pt) => (
              <React.Fragment key={`pt-${pt.label}`}>
                <Circle
                  x={pt.col * cellSize}
                  y={pt.row * cellSize}
                  radius={cellSize * 0.25}
                  fill="#3B82F6"
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={1.5}
                />
                <Text
                  x={pt.col * cellSize + cellSize * 0.3}
                  y={pt.row * cellSize - cellSize * 0.45}
                  text={pt.label}
                  fontSize={Math.max(12, cellSize * 0.35)}
                  fontStyle="bold"
                  fill={konvaTheme.labelText}
                />
              </React.Fragment>
            ))}

            {/* L4: Show reflected points on reveal (snapped to grid intersections) */}
            {isPlottingLevel && (isComplete || showAnswer) && reflectedPoints && reflectedPoints.map((pt) => (
              <React.Fragment key={`rpt-${pt.label}`}>
                <Circle
                  x={pt.col * cellSize}
                  y={pt.row * cellSize}
                  radius={cellSize * 0.25}
                  fill="#10B981"
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={1.5}
                />
                <Text
                  x={pt.col * cellSize + cellSize * 0.3}
                  y={pt.row * cellSize - cellSize * 0.45}
                  text={pt.label}
                  fontSize={Math.max(12, cellSize * 0.35)}
                  fontStyle="bold"
                  fill="#10B981"
                />
              </React.Fragment>
            ))}

            {/* L4: User-entered points (live validation feedback) */}
            {isPlottingLevel && userEnteredPoints.map((pt) => {
              // Determine color based on submission status
              const pointColor = !pt.submitted
                ? '#3B82F6'  // Blue for not-yet-submitted (preview)
                : pt.isCorrect
                  ? '#10B981'  // Green for correct
                  : '#EF4444';  // Red for incorrect

              return (
                <React.Fragment key={`user-${pt.label}`}>
                  <Circle
                    x={pt.x * cellSize}
                    y={pt.y * cellSize}
                    radius={cellSize * 0.3}
                    fill={pointColor}
                    stroke={konvaTheme.shapeStroke}
                    strokeWidth={2}
                    opacity={pt.submitted ? 0.9 : 0.6}  // Fainter for preview
                  />
                  <Text
                    x={pt.x * cellSize + cellSize * 0.35}
                    y={pt.y * cellSize - cellSize * 0.5}
                    text={pt.label}
                    fontSize={Math.max(12, cellSize * 0.35)}
                    fontStyle="bold"
                    fill={pointColor}
                  />
                </React.Fragment>
              );
            })}

            {/* Axis label */}
            <Text
              x={4}
              y={canvasHeight - 18}
              text={axis === "diagonal" ? "y = x" : `${axis} line`}
              fontSize={12}
              fill="#F97316"
              fontStyle="italic"
            />
          </Layer>

          {/* Transparent click overlay — catches all clicks on top of everything */}
          {!isPlottingLevel && (
            <Layer>
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill="transparent"
                onClick={handleStageClick}
                onTap={handleStageClick}
              />
            </Layer>
          )}
        </Stage>
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {!isComplete && !showAnswer && showHint && <HintBox>{hint}</HintBox>}

        {!isComplete && !isPlottingLevel && (
          <>
            {checkResult && (checkResult.wrong.size > 0 || checkResult.missingCount > 0) && (
              <FeedbackText $isWrong>
                {checkResult.correct} of {checkResult.total} cells correct.
                {checkResult.wrong.size > 0 && " Some cells are wrong (shown in red)."}
                {checkResult.missingCount > 0 && ` ${checkResult.missingCount} cell${checkResult.missingCount > 1 ? "s" : ""} still missing.`}
              </FeedbackText>
            )}
            <ButtonRow>
              <CheckButton onClick={handleCheckAnswer} disabled={clickedCells.size === 0}>
                Check Answer
              </CheckButton>
              <ResetButton onClick={handleReset} disabled={clickedCells.size === 0}>
                Reset
              </ResetButton>
            </ButtonRow>
          </>
        )}

        {!isComplete && !showAnswer && isPlottingLevel && !panelOpen && (
          <ButtonContainer>
            <EnterAnswerButton
              onClick={openPanel}
              disabled={allCorrect}
              variant="static"
            />
          </ButtonContainer>
        )}
      </InteractionSection>
      </ContentWrapper>

      {/* InputOverlayPanel (Level 4 only) - Multi-Input */}
      {isPlottingLevel && (
        <InputOverlayPanel
          visible={panelOpen}
          onClose={closePanel}
          title="Enter Reflected Points"
        >
          {/* 4 Stacked Coordinate Inputs */}
          {["A", "B", "C"].map(point => (
            <CoordinateInputSection key={point}>
              <CoordinateLabel>
                Point {point}':
                {coordinates[point].submitted && (
                  <FeedbackIcon $isCorrect={coordinates[point].isCorrect}>
                    {coordinates[point].isCorrect ? ' ✓' : ' ✗'}
                  </FeedbackIcon>
                )}
              </CoordinateLabel>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CoordinateDisplay
                  $focused={focusedPoint === point}
                  $hasValue={coordinates[point].value}
                  onClick={() => setFocusedPoint(point)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Enter coordinate for point ${point} prime`}
                  style={{ flex: 1 }}
                >
                  {formatCoordinateDisplay(coordinates[point].value)}
                </CoordinateDisplay>

                <button
                  onClick={() => handleSubmitCoordinate(point)}
                  disabled={!coordinates[point].value || (coordinates[point].submitted && coordinates[point].isCorrect)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: coordinates[point].submitted && coordinates[point].isCorrect
                      ? '#10B981'  // Green when correct
                      : coordinates[point].submitted && !coordinates[point].isCorrect
                        ? '#EF4444'  // Red when incorrect
                        : '#3B82F6',  // Blue when not submitted
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (coordinates[point].submitted && coordinates[point].isCorrect) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    minWidth: '80px',
                    opacity: !coordinates[point].value ? 0.5 : 1,
                  }}
                >
                  {coordinates[point].submitted && coordinates[point].isCorrect
                    ? '✓ Done'
                    : coordinates[point].submitted && !coordinates[point].isCorrect
                      ? 'Retry'
                      : 'Submit'}
                </button>
              </div>

              {coordinates[point].error && (
                <ErrorText>{coordinates[point].error}</ErrorText>
              )}
            </CoordinateInputSection>
          ))}

          {/* Shared Keypad */}
          <SlimMathKeypad
            value={coordinates[focusedPoint].value}
            onChange={handleKeypadChange}
            onSubmit={() => handleSubmitCoordinate(focusedPoint)}
            extraButtons={["(", ",", ")"]}
          />

          {/* Success Message */}
          {allCorrect && (
            <SuccessSection>
              <SuccessText>✓ All coordinates correct!</SuccessText>
              <TryAnotherButton onClick={handleTryAnother}>
                Try Another Problem
              </TryAnotherButton>
            </SuccessSection>
          )}

          {/* Action Buttons */}
          {!allCorrect && (
            <PanelButtonRow>
              <ResetButton onClick={handleResetCoordinates}>
                Clear All
              </ResetButton>
            </PanelButtonRow>
          )}
        </InputOverlayPanel>
      )}

      {/* Explanation Modal */}
      {isComplete && (
        <ExplanationModal
          explanation={explanation}
          onClose={handleClose}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
}

export default SymmetryLesson;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }

  /* iPad optimization: reduce padding */
  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;

  /* iPad optimization: tighter spacing */
  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 3px;
  }
`;

const LevelBadge = styled.span`
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;

  /* iPad optimization: smaller badge */
  @media (max-width: 1024px) {
    padding: 2px 10px;
    font-size: 12px;
  }
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }

  /* iPad optimization: slightly smaller title */
  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 12px 0;
  max-width: 700px;

  /* iPad optimization: compact text */
  @media (max-width: 1024px) {
    font-size: 14px;
    margin: 0 0 8px 0;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: crosshair;
  transition: all 0.3s ease-in-out;

  /* iPad optimization: reduce padding and margin */
  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  /* iPad optimization: tighter gaps */
  @media (max-width: 1024px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 650px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};

  /* iPad optimization: compact hint box */
  @media (max-width: 1024px) {
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const FeedbackText = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => (props.$isWrong ? "#EF4444" : props.theme.colors.buttonSuccess)};
  margin: 0;
  text-align: center;

  /* iPad optimization: slightly smaller feedback */
  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  /* iPad optimization: tighter button spacing */
  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const CheckButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  /* iPad optimization: compact button */
  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  background-color: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  transition: all 0.2s;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
  }

  /* iPad optimization: compact button */
  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  /* iPad optimization: compact explanation */
  @media (max-width: 1024px) {
    padding: 16px 20px;
    margin-top: 0px;
    gap: 8px;
  }
`;

const ExplanationTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;

  /* iPad optimization: smaller title */
  @media (max-width: 1024px) {
    font-size: 17px;
  }
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  text-align: center;

  /* iPad optimization: compact text */
  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.5;
  }
`;

const TryAnotherButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  /* iPad optimization: compact button */
  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
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

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  transition: transform 0.3s ease-in-out;

  /* Desktop + iPad: Slide left and scale when panel opens (Level 4 only) */
  @media (min-width: 769px) {
    ${props => props.$panelOpen ? css`
      transform: translateX(-${props.$slideDistance}px) scale(0.95);
      transform-origin: left center;
    ` : css`
      transform: translateX(0) scale(1);
      transform-origin: center center;
    `}
  }

  @media (max-width: 768px) {
    transform: translateX(0);
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 16px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin-bottom: 10px;
  }
`;

const FeedbackSection = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;

  ${props => props.$isWrong && css`
    background-color: ${props.theme.colors.danger || '#E53E3E'}15;
    color: ${props.theme.colors.danger || '#E53E3E'};
    border: 1px solid ${props.theme.colors.danger || '#E53E3E'};
  `}

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 10px 14px;
  }
`;

const PanelButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  width: 100%;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  touch-action: manipulation;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 12px 20px;
    font-size: 15px;
  }
`;

const HelpText = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 8px 0 0 0;
  text-align: center;
  font-style: italic;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

// Level 4 Multi-Input Components
const CoordinateInputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const CoordinateLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  display: flex;
  align-items: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const CoordinateDisplay = styled.div`
  padding: 14px 20px;
  font-size: 20px;
  font-family: 'Courier New', 'Monaco', monospace;
  background-color: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.$focused
    ? props.theme.colors.info || '#3B82F6'
    : props.theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$hasValue
    ? props.theme.colors.textPrimary
    : props.theme.colors.textSecondary};
  font-weight: ${props => props.$hasValue ? 600 : 400};
  user-select: none;

  ${props => props.$focused && css`
    background-color: ${props.theme.colors.info}10;
    box-shadow: 0 0 0 3px ${props.theme.colors.info}30;
  `}

  &:hover {
    background-color: ${props => props.$focused
      ? props.theme.colors.info + '10'
      : props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    padding: 12px 16px;
    font-size: 18px;
  }
`;

const FeedbackIcon = styled.span`
  font-size: 20px;
  font-weight: bold;
  margin-left: 8px;
  color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.buttonDanger || '#f87171'};

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.buttonDanger || '#f87171'};
  margin-top: 4px;
  font-weight: 500;

  @media (max-width: 1024px) {
    font-size: 12px;
  }
`;

const SuccessSection = styled.div`
  padding: 16px;
  background-color: ${props => (props.theme.colors.buttonSuccess || '#4ade80') + '20'};
  border: 2px solid ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  border-radius: 8px;
  margin-top: 12px;
  text-align: center;
`;

const SuccessText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;
