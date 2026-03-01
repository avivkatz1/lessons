import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Stage, Layer, Rect, Circle, Line, Text, Group, Arrow } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { InputOverlayPanel, UnifiedMathKeypad, TwoFieldScreen, EnterAnswerButton } from "../../../../shared/components";

// Import useInputOverlay from geometry hooks (reusable)
import { useInputOverlay } from "../geometry/hooks/useInputOverlay";
// Import ExplanationModal for iPad optimization
import ExplanationModal from "../geometry/ExplanationModal";

// ==================== LEVEL CONFIG ====================

/**
 * BACKEND DATA REQUIREMENTS:
 *
 * IMPORTANT: See GRAPHING_LINES_DATA_PLAN.md for complete distribution strategy
 *
 * Level 1 (Y-Intercept Sign) - Per 10 Problems:
 * - 4 problems with POSITIVE y-intercepts (varied slopes: positive, negative, zero)
 * - 4 problems with NEGATIVE y-intercepts (varied slopes: positive, negative, zero)
 * - 2 problems with ZERO y-intercepts (slopes: positive or negative, NOT zero)
 * - Lines must have VARIED SLOPES to prevent pattern recognition
 *
 * Level 2 (Slope Sign) - Per 10 Problems:
 * - 3 problems with POSITIVE slopes (varied y-intercepts)
 * - 3 problems with NEGATIVE slopes (varied y-intercepts)
 * - 2 problems with ZERO slopes (horizontal lines: rise=0, run=1, one +yInt, one -yInt)
 * - 2 problems with UNDEFINED slopes (vertical lines: rise≠0, run=0, use xIntercept)
 *
 * Vertical Lines (Undefined Slope):
 * - Backend must provide: { rise: 1, run: 0, xIntercept: <value>, yIntercept: null }
 * - Frontend detects run===0 and renders vertical line at xIntercept
 * - X-intercept range: -8 to +8 (visible on grid)
 *
 * General Constraints:
 * - Y-intercepts: -8 to +8
 * - Rise/Run: -6 to +6 (excluding 0 for regular lines)
 * - Shuffle problem order (don't cluster by type)
 */

const LEVEL_INFO = {
  1: { title: "Y-Intercept Sign", instruction: "Is the y-intercept positive, negative, or zero?" },
  2: { title: "Slope Sign", instruction: "Is the slope positive, negative, zero, or undefined?" },
  3: { title: "Count Rise & Run", instruction: "Count the rise and run. What is the slope?" },
  4: { title: "Identify Y-Intercept", instruction: "What is the y-intercept?" },
  5: { title: "Write Slope as Fraction", instruction: "Write the slope as a fraction." },
  6: { title: "Match the Equation", instruction: "Which line matches the given equation?" },
  7: { title: "Plot the Line", instruction: "Place two points on the grid that satisfy the equation." },
};

// ==================== ANIMATIONS ====================

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

// ==================== HELPER FUNCTIONS ====================

/**
 * Compute the two edge points where a line exits the visible grid area.
 * Line: y = (rise/run) * x + yIntercept
 * Returns pixel coordinates clipped to canvas bounds.
 */
function getLineEndpoints(rise, run, yIntercept, originGridX, originGridY, gridSize, spacing) {
  const slope = rise / run;
  const xMin = -originGridX;
  const xMax = gridSize - 1 - originGridX;
  const yMin = originGridY - (gridSize - 1);
  const yMax = originGridY;

  const points = [];

  // Check intersection with left edge (x = xMin)
  const yAtLeft = slope * xMin + yIntercept;
  if (yAtLeft >= yMin && yAtLeft <= yMax) {
    points.push({ x: xMin, y: yAtLeft });
  }

  // Check intersection with right edge (x = xMax)
  const yAtRight = slope * xMax + yIntercept;
  if (yAtRight >= yMin && yAtRight <= yMax) {
    points.push({ x: xMax, y: yAtRight });
  }

  // Check intersection with top edge (y = yMax)
  if (slope !== 0) {
    const xAtTop = (yMax - yIntercept) / slope;
    if (xAtTop >= xMin && xAtTop <= xMax) {
      points.push({ x: xAtTop, y: yMax });
    }
  }

  // Check intersection with bottom edge (y = yMin)
  if (slope !== 0) {
    const xAtBottom = (yMin - yIntercept) / slope;
    if (xAtBottom >= xMin && xAtBottom <= xMax) {
      points.push({ x: xAtBottom, y: yMin });
    }
  }

  // Deduplicate close points and take the two furthest apart
  if (points.length < 2) {
    // Fallback: use large x range
    points.push({ x: xMin, y: slope * xMin + yIntercept });
    points.push({ x: xMax, y: slope * xMax + yIntercept });
  }

  // Convert to pixel coordinates
  const toPixel = (pt) => ({
    px: (originGridX + pt.x) * spacing,
    py: (originGridY - pt.y) * spacing,
  });

  const p1 = toPixel(points[0]);
  const p2 = toPixel(points[1]);
  return [p1.px, p1.py, p2.px, p2.py];
}

/**
 * Snap a pixel position to the nearest grid intersection.
 */
function snapToGrid(px, py, originGridX, originGridY, spacing, gridSize) {
  const gridX = Math.round(px / spacing);
  const gridY = Math.round(py / spacing);
  // Clamp to grid bounds
  const clampedX = Math.max(0, Math.min(gridSize - 1, gridX));
  const clampedY = Math.max(0, Math.min(gridSize - 1, gridY));
  // Convert to math coordinates
  const mathX = clampedX - originGridX;
  const mathY = originGridY - clampedY;
  return { mathX, mathY, pixelX: clampedX * spacing, pixelY: clampedY * spacing };
}

/**
 * Simplify a fraction (e.g., 4/2 -> 2/1, 2/4 -> 1/2)
 */
function simplifyFraction(numerator, denominator) {
  const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  const num = numerator / divisor;
  const den = denominator / divisor;
  if (den === 1) return String(num);
  return `${num}/${den}`;
}

// ==================== MAIN COMPONENT ====================

const GraphingLinesLesson = ({ triggerNewProblem }) => {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    rise = 1,
    run = 1,
    yIntercept = 0,
    xIntercept = null, // For vertical lines (undefined slope): run=0, use xIntercept instead
    originGridX = 10,
    originGridY = 10,
    gridSize = 20,
    mode = "identify", // "identify" or "plot"
    equationText = null,
    // For Level 6: multiple lines
    lines = null,
  } = visualData;

  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  // ==================== STATE MANAGEMENT ====================

  // Phase-based state for L1-2 (binary choice levels)
  const [phase, setPhase] = useState("interact"); // "interact" | "complete"
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  // Modal state for iPad optimization (replaces inline explanation)
  const [showModal, setShowModal] = useState(false);

  // Input overlay state for L3-5
  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll,
    keepOpen,
    setKeepOpen,
  } = useInputOverlay();

  // Level 3: Multi-input state (rise & run)
  const [riseInput, setRiseInput] = useState("");
  const [runInput, setRunInput] = useState("");
  const [activeField, setActiveField] = useState("rise"); // "rise" | "run"

  // Level 6: Line selection state
  const [selectedLine, setSelectedLine] = useState(null);
  const [flashLine, setFlashLine] = useState(null);

  // Level 8: Canvas plotting state
  const [placedPoints, setPlacedPoints] = useState([]);
  const [plotFeedback, setPlotFeedback] = useState(null); // "correct" | "incorrect" | null

  // Canvas sizing
  const canvasSize = Math.min(windowWidth - 40, 600);
  const spacing = canvasSize / gridSize;

  // Slide distance for InputOverlayPanel (for L3-5)
  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0;
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75;
  }, [windowWidth]);

  // ==================== RESET LOGIC ====================

  const problemKey = `${rise}-${run}-${yIntercept}-${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);

  useEffect(() => {
    if (problemKey !== lastProblemKey) {
      setLastProblemKey(problemKey);
      // Reset all state
      setPhase("interact");
      setWrongAttempts(0);
      setShakingIdx(null);
      setShowModal(false);
      setRiseInput("");
      setRunInput("");
      setActiveField("rise");
      setSelectedLine(null);
      setFlashLine(null);
      setPlacedPoints([]);
      setPlotFeedback(null);

      // Reset input overlay
      if (!keepOpen) {
        resetAll();
      } else {
        setInputValue("");
        setSubmitted(false);
      }
    }
  }, [problemKey, lastProblemKey, keepOpen, resetAll, setInputValue, setSubmitted]);

  // ==================== HANDLERS ====================

  const handleTryAnother = useCallback(() => {
    setPhase("interact");
    setWrongAttempts(0);
    setPlacedPoints([]);
    setPlotFeedback(null);
    setShowModal(false);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // Level 1 & 2: Binary choice handlers
  const handleChoiceClick = (choice, index, correctChoice) => {
    if (phase !== "interact" || shakingIdx !== null) return;

    if (choice === correctChoice) {
      setTimeout(() => {
        setPhase("complete");
        setShowModal(true);
        revealAnswer();
      }, 800);
    } else {
      setShakingIdx(index);
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setShakingIdx(null), 600);
    }
  };

  // Input change handlers - reset submitted state to allow re-submission
  const handleRiseChange = (value) => {
    setRiseInput(value);
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleRunChange = (value) => {
    setRunInput(value);
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleYInterceptChange = (value) => {
    setInputValue(value);
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSlopeChange = (value) => {
    setInputValue(value);
    if (submitted) {
      setSubmitted(false);
    }
  };

  // Level 3: Simple rise/run submit (inline, no panel)
  const handleLevel3Submit = () => {
    setSubmitted(true);
    const riseCorrect = parseInt(riseInput) === rise;
    const runCorrect = parseInt(runInput) === run;

    if (riseCorrect && runCorrect) {
      setTimeout(() => {
        if (keepOpen) {
          setRiseInput('');
          setRunInput('');
          setSubmitted(false);
          triggerNewProblem();
        } else {
          closePanel();
          setShowModal(true);
          revealAnswer();
        }
      }, 1000);
    }
  };

  // Level 4: Y-intercept input submit
  const handleLevel4Submit = () => {
    if (inputValue.trim() === "") return;
    setSubmitted(true);

    const isCorrect = parseInt(inputValue) === yIntercept;
    if (isCorrect) {
      setTimeout(() => {
        if (keepOpen) {
          setInputValue('');
          setSubmitted(false);
          triggerNewProblem();
        } else {
          closePanel();
          setTimeout(() => {
            setShowModal(true);
            revealAnswer();
          }, 500);
        }
      }, 1000);
    }
  };

  // Level 5: Slope fraction submit
  const handleLevel5Submit = () => {
    if (inputValue.trim() === "") return;
    setSubmitted(true);

    // Check if input matches slope (accept multiple formats)
    const expectedSlope = `${rise}/${run}`;
    const simplifiedSlope = simplifyFraction(rise, run);
    const decimalSlope = (rise / run).toString();
    const acceptedAnswers = [expectedSlope, simplifiedSlope, decimalSlope];
    const isCorrect = acceptedAnswers.some(ans => inputValue.trim() === ans);

    if (isCorrect) {
      setTimeout(() => {
        if (keepOpen) {
          setInputValue('');
          setSubmitted(false);
          triggerNewProblem();
        } else {
          closePanel();
          setTimeout(() => {
            setShowModal(true);
            revealAnswer();
          }, 500);
        }
      }, 1000);
    }
  };

  // Level 6: Line selection
  const handleLineClick = (lineIndex) => {
    if (phase !== "interact" || flashLine !== null) return;

    const line = lines[lineIndex];
    if (line.correct) {
      setSelectedLine(lineIndex);
      setTimeout(() => {
        setPhase("complete");
        setShowModal(true);
        revealAnswer();
      }, 800);
    } else {
      setFlashLine(lineIndex);
      setWrongAttempts(prev => prev + 1);
      setTimeout(() => setFlashLine(null), 500);
    }
  };

  // Level 8: Canvas click to place points
  const handleCanvasClick = (e) => {
    if (mode !== "plot" || showAnswer || plotFeedback === "correct") return;
    if (placedPoints.length >= 2) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const snapped = snapToGrid(pos.x, pos.y, originGridX, originGridY, spacing, gridSize);

    // Don't place duplicates
    if (placedPoints.some(p => p.mathX === snapped.mathX && p.mathY === snapped.mathY)) return;

    const newPoints = [...placedPoints, snapped];
    setPlacedPoints(newPoints);

    // Check if 2 points placed
    if (newPoints.length === 2) {
      const slope = rise / run;
      const valid = newPoints.every(pt => {
        const expectedY = slope * pt.mathX + yIntercept;
        return Math.abs(pt.mathY - expectedY) < 0.01;
      });

      if (valid) {
        setPlotFeedback("correct");
        setTimeout(() => revealAnswer(), 800);
      } else {
        setPlotFeedback("incorrect");
        setTimeout(() => {
          setPlacedPoints([]);
          setPlotFeedback(null);
        }, 1500);
      }
    }
  };

  // ==================== COMPUTED VALUES ====================

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Check if this is a vertical line (undefined slope)
  const isVerticalLine = run === 0;

  // Line endpoints for visualization
  let linePoints;
  if (isVerticalLine && xIntercept !== null) {
    // Vertical line: constant x-value, spans entire grid height
    const xPixel = (originGridX + xIntercept) * spacing;
    linePoints = [xPixel, 0, xPixel, canvasSize];
  } else {
    // Regular line: use slope-intercept form
    linePoints = getLineEndpoints(rise, run, yIntercept, originGridX, originGridY, gridSize, spacing);
  }

  // Y-intercept pixel position
  const yIntPxX = originGridX * spacing;
  const yIntPxY = (originGridY - yIntercept) * spacing;

  // Rise/run endpoints for arrows (L2-3)
  const arrowStartX = 0; // Start at y-axis
  const arrowStartY = yIntercept;
  const arrowEndX = run;
  const arrowEndY = yIntercept + rise;

  // Level 3: Check correctness
  const riseCorrect = parseInt(riseInput) === rise;
  const runCorrect = parseInt(runInput) === run;
  const level3Correct = riseCorrect && runCorrect;

  // Level 4: Check correctness
  const level4Correct = parseInt(inputValue) === yIntercept;

  // Level 5: Check correctness
  const expectedSlope = `${rise}/${run}`;
  const simplifiedSlope = simplifyFraction(rise, run);
  const level5Correct = [expectedSlope, simplifiedSlope, (rise/run).toString()].some(
    ans => inputValue.trim() === ans
  );

  // Level 8: Line through placed points
  let placedLinePoints = null;
  if (placedPoints.length === 2) {
    const p1 = placedPoints[0];
    const p2 = placedPoints[1];
    if (p1.mathX !== p2.mathX) {
      const placedSlope = (p2.mathY - p1.mathY) / (p2.mathX - p1.mathX);
      const placedIntercept = p1.mathY - placedSlope * p1.mathX;
      placedLinePoints = getLineEndpoints(
        p2.mathY - p1.mathY,
        p2.mathX - p1.mathX,
        placedIntercept,
        originGridX, originGridY, gridSize, spacing
      );
    } else {
      placedLinePoints = [p1.pixelX, 0, p1.pixelX, canvasSize];
    }
  }

  // ==================== RENDERING ====================

  if (!currentProblem || !visualData.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Determine correct choices for L1-2
  const yInterceptSign = yIntercept > 0 ? "positive" : yIntercept < 0 ? "negative" : "zero";

  // Slope sign calculation (handles all 4 cases)
  let slopeSign = "zero";
  if (run === 0) {
    // Vertical line: undefined slope
    slopeSign = "undefined";
  } else if (rise === 0) {
    // Horizontal line: zero slope
    slopeSign = "zero";
  } else {
    // Regular line: calculate sign from rise/run
    const slopeVal = rise / run;
    if (slopeVal > 0) slopeSign = "positive";
    else if (slopeVal < 0) slopeSign = "negative";
    else slopeSign = "zero"; // Fallback (shouldn't reach here if rise !== 0)
  }

  return (
    <Wrapper>
      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question text / Equation for L6 & L7 */}
      {(level === 6 || mode === "plot") && equationText ? (
        <EquationDisplay>{equationText}</EquationDisplay>
      ) : (
        <QuestionText>{questionText}</QuestionText>
      )}

      {/* Canvas wrapper (slides for L3-5) */}
      <CanvasWrapper $panelOpen={panelOpen && (level >= 3 && level <= 5)} $slideDistance={slideDistance}>
        {/* L6: Side-by-side layout for canvas and buttons */}
        {level === 6 ? (
          <Level6Container>
            <VisualSection>
              <Stage width={canvasSize} height={canvasSize}>
            <Layer>
              {/* Background */}
              <Rect x={0} y={0} width={canvasSize} height={canvasSize} fill={konvaTheme.canvasBackground} />

              {/* Grid lines */}
              {[...Array(gridSize)].map((_, i) => {
                const isOriginRow = i === originGridY;
                return (
                  <Line
                    key={`h${i}`}
                    points={[0, i * spacing, canvasSize, i * spacing]}
                    stroke={isOriginRow ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
                    strokeWidth={isOriginRow ? 2.5 : 0.5}
                  />
                );
              })}

              {[...Array(gridSize)].map((_, i) => {
                const isOriginCol = i === originGridX;
                return (
                  <Line
                    key={`v${i}`}
                    points={[i * spacing, 0, i * spacing, canvasSize]}
                    stroke={isOriginCol ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
                    strokeWidth={isOriginCol ? 2.5 : 0.5}
                  />
                );
              })}

              {/* Axis labels */}
              {[...Array(gridSize)].map((_, i) => {
                const xValue = i - originGridX;
                if (xValue === 0 || i % 2 !== 0 || i < 1 || i > gridSize - 2) return null;
                const labelFontSize = Math.max(9, Math.round(spacing * 0.35));
                return (
                  <Text
                    key={`xl${i}`}
                    x={i * spacing - labelFontSize * 0.3 * String(xValue).length}
                    y={originGridY * spacing + 4}
                    text={String(xValue)}
                    fontSize={labelFontSize}
                    fill={konvaTheme.coordinateText || konvaTheme.labelText}
                  />
                );
              })}

              {[...Array(gridSize)].map((_, i) => {
                const yValue = originGridY - i;
                if (yValue === 0 || i % 2 !== 0 || i < 1 || i > gridSize - 2) return null;
                const labelFontSize = Math.max(9, Math.round(spacing * 0.35));
                return (
                  <Text
                    key={`yl${i}`}
                    x={originGridX * spacing + 4}
                    y={i * spacing - labelFontSize * 0.45}
                    text={String(yValue)}
                    fontSize={labelFontSize}
                    fill={konvaTheme.coordinateText || konvaTheme.labelText}
                  />
                );
              })}

              {/* Origin label */}
              <Text
                x={originGridX * spacing + 4}
                y={originGridY * spacing + 4}
                text="0"
                fontSize={Math.max(9, Math.round(spacing * 0.35))}
                fill={konvaTheme.coordinateText || konvaTheme.labelText}
              />

              {/* Origin dot */}
              <Circle
                x={originGridX * spacing}
                y={originGridY * spacing}
                radius={4}
                fill={konvaTheme.shapeStroke}
              />
            </Layer>

            {/* Content layer */}
            <Layer>
              {/* L1-5, L7: Single line */}
              {mode === "identify" && level !== 6 && (
                <>
                  <Line
                    points={linePoints}
                    stroke={konvaTheme.info || "#3B82F6"}
                    strokeWidth={3}
                    lineCap="round"
                  />
                  {/* Y-intercept dot (L1, L4) */}
                  {(level === 1 || level === 4) && (
                    <Circle
                      x={yIntPxX}
                      y={yIntPxY}
                      radius={8}
                      fill={konvaTheme.point || "#EF4444"}
                      stroke={konvaTheme.shapeStroke}
                      strokeWidth={1.5}
                    />
                  )}
                </>
              )}

              {/* L2-3: Rise/run arrows (skip for vertical/horizontal lines) */}
              {(level === 2 || level === 3) && !isVerticalLine && rise !== 0 && (
                <Group>
                  {/* Horizontal arrow (run) */}
                  <Arrow
                    points={[
                      (originGridX + arrowStartX) * spacing,
                      (originGridY - arrowStartY) * spacing,
                      (originGridX + arrowEndX) * spacing,
                      (originGridY - arrowStartY) * spacing,
                    ]}
                    stroke={konvaTheme.warning || "#F59E0B"}
                    strokeWidth={3}
                    fill={konvaTheme.warning || "#F59E0B"}
                    pointerLength={8}
                    pointerWidth={8}
                  />
                  <Text
                    x={(originGridX + arrowStartX + run / 2) * spacing - 20}
                    y={(originGridY - arrowStartY) * spacing + 10}
                    text={`run: ${Math.abs(run)}`}
                    fontSize={Math.max(12, Math.round(spacing * 0.45))}
                    fontStyle="bold"
                    fill={konvaTheme.warning || "#F59E0B"}
                  />

                  {/* Vertical arrow (rise) */}
                  <Arrow
                    points={[
                      (originGridX + arrowEndX) * spacing,
                      (originGridY - arrowStartY) * spacing,
                      (originGridX + arrowEndX) * spacing,
                      (originGridY - arrowEndY) * spacing,
                    ]}
                    stroke={konvaTheme.success || "#10B981"}
                    strokeWidth={3}
                    fill={konvaTheme.success || "#10B981"}
                    pointerLength={8}
                    pointerWidth={8}
                  />
                  <Text
                    x={(originGridX + arrowEndX) * spacing + 10}
                    y={(originGridY - (arrowStartY + arrowEndY) / 2) * spacing - 10}
                    text={`rise: ${rise}`}
                    fontSize={Math.max(12, Math.round(spacing * 0.45))}
                    fontStyle="bold"
                    fill={konvaTheme.success || "#10B981"}
                  />

                  {/* Second point dot */}
                  <Circle
                    x={(originGridX + arrowEndX) * spacing}
                    y={(originGridY - arrowEndY) * spacing}
                    radius={7}
                    fill={konvaTheme.info || "#3B82F6"}
                    stroke={konvaTheme.shapeStroke}
                    strokeWidth={1.5}
                  />
                </Group>
              )}

              {/* L6: Multiple lines */}
              {level === 6 && lines && lines.map((line, idx) => {
                const lPoints = getLineEndpoints(
                  line.rise, line.run, line.yIntercept,
                  originGridX, originGridY, gridSize, spacing
                );
                return (
                  <Group key={idx}>
                    <Line
                      points={lPoints}
                      stroke={line.color}
                      strokeWidth={selectedLine === idx ? 6 : 4}
                      opacity={selectedLine === idx ? 1 : 0.7}
                      listening={false}
                    />
                    <Text
                      x={lPoints[2] + 10}
                      y={lPoints[3] - 20}
                      text={line.label}
                      fontSize={20}
                      fill={line.color}
                      fontStyle="bold"
                    />
                  </Group>
                );
              })}

              {/* L7: Placed points */}
              {level === 7 && mode === "plot" && placedPoints.map((pt, i) => (
                <Circle
                  key={`placed-${i}`}
                  x={pt.pixelX}
                  y={pt.pixelY}
                  radius={9}
                  fill={plotFeedback === "correct" ? (konvaTheme.success || "#10B981") : (konvaTheme.point || "#EF4444")}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={1.5}
                />
              ))}

              {/* L7: Line through placed points */}
              {level === 7 && mode === "plot" && placedLinePoints && (
                <Line
                  points={placedLinePoints}
                  stroke={plotFeedback === "correct" ? (konvaTheme.success || "#10B981") : (konvaTheme.info || "#3B82F6")}
                  strokeWidth={3}
                  lineCap="round"
                />
              )}

              {/* Answer reveal for L8 */}
              {showAnswer && level === 7 && mode === "plot" && plotFeedback === "correct" && (
                <Line
                  points={linePoints}
                  stroke={konvaTheme.success || "#10B981"}
                  strokeWidth={3}
                  lineCap="round"
                />
              )}
            </Layer>
          </Stage>
        </VisualSection>

            {/* L6: Line selection buttons (right side) */}
            {!showAnswer && lines && (
              <Level6ButtonColumn>
                {lines.map((line, idx) => (
                  <ChoiceButton
                    key={idx}
                    onClick={() => handleLineClick(idx)}
                    disabled={phase === "complete"}
                    $shake={flashLine === idx}
                    $borderColor={line.color}
                    $selected={selectedLine === idx}
                  >
                    Line {line.label}
                  </ChoiceButton>
                ))}
              </Level6ButtonColumn>
            )}
          </Level6Container>
        ) : (
          <VisualSection>
            <Stage
              width={canvasSize}
              height={canvasSize}
              onClick={level === 7 ? handleCanvasClick : undefined}
              onTap={level === 7 ? handleCanvasClick : undefined}
            >
            <Layer>
              {/* Background */}
              <Rect x={0} y={0} width={canvasSize} height={canvasSize} fill={konvaTheme.canvasBackground} />

              {/* Grid lines */}
              {[...Array(gridSize)].map((_, i) => {
                const isOriginRow = i === originGridY;
                return (
                  <Line
                    key={`h${i}`}
                    points={[0, i * spacing, canvasSize, i * spacing]}
                    stroke={isOriginRow ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
                    strokeWidth={isOriginRow ? 2.5 : 0.5}
                  />
                );
              })}

              {[...Array(gridSize)].map((_, i) => {
                const isOriginCol = i === originGridX;
                return (
                  <Line
                    key={`v${i}`}
                    points={[i * spacing, 0, i * spacing, canvasSize]}
                    stroke={isOriginCol ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
                    strokeWidth={isOriginCol ? 2.5 : 0.5}
                  />
                );
              })}

              {/* Axis labels */}
              {[...Array(gridSize)].map((_, i) => {
                const xValue = i - originGridX;
                if (xValue === 0 || i % 2 !== 0 || i < 1 || i > gridSize - 2) return null;
                const labelFontSize = Math.max(9, Math.round(spacing * 0.35));
                return (
                  <Text
                    key={`xl${i}`}
                    x={i * spacing - labelFontSize * 0.3 * String(xValue).length}
                    y={originGridY * spacing + 4}
                    text={String(xValue)}
                    fontSize={labelFontSize}
                    fill={konvaTheme.coordinateText || konvaTheme.labelText}
                  />
                );
              })}

              {[...Array(gridSize)].map((_, i) => {
                const yValue = originGridY - i;
                if (yValue === 0 || i % 2 !== 0 || i < 1 || i > gridSize - 2) return null;
                const labelFontSize = Math.max(9, Math.round(spacing * 0.35));
                return (
                  <Text
                    key={`yl${i}`}
                    x={originGridX * spacing + 4}
                    y={i * spacing - labelFontSize * 0.45}
                    text={String(yValue)}
                    fontSize={labelFontSize}
                    fill={konvaTheme.coordinateText || konvaTheme.labelText}
                  />
                );
              })}

              {/* Origin label */}
              <Text
                x={originGridX * spacing + 4}
                y={originGridY * spacing + 4}
                text="0"
                fontSize={Math.max(9, Math.round(spacing * 0.35))}
                fill={konvaTheme.coordinateText || konvaTheme.labelText}
              />

              {/* Origin dot */}
              <Circle
                x={originGridX * spacing}
                y={originGridY * spacing}
                radius={4}
                fill={konvaTheme.shapeStroke}
              />
            </Layer>

            {/* Content layer */}
            <Layer>
              {/* L1-5, L7: Single line */}
              {mode === "identify" && level !== 6 && (
                <>
                  <Line
                    points={linePoints}
                    stroke={konvaTheme.info || "#3B82F6"}
                    strokeWidth={3}
                    lineCap="round"
                  />
                  {/* Y-intercept dot (L1, L4) */}
                  {(level === 1 || level === 4) && (
                    <Circle
                      x={yIntPxX}
                      y={yIntPxY}
                      radius={8}
                      fill={konvaTheme.point || "#EF4444"}
                      stroke={konvaTheme.shapeStroke}
                      strokeWidth={1.5}
                    />
                  )}
                </>
              )}

              {/* L2-3: Rise/run arrows (skip for vertical/horizontal lines) */}
              {(level === 2 || level === 3) && !isVerticalLine && rise !== 0 && (
                <Group>
                  {/* Horizontal arrow (run) */}
                  <Arrow
                    points={[
                      (originGridX + arrowStartX) * spacing,
                      (originGridY - arrowStartY) * spacing,
                      (originGridX + arrowEndX) * spacing,
                      (originGridY - arrowStartY) * spacing,
                    ]}
                    stroke={konvaTheme.warning || "#F59E0B"}
                    strokeWidth={3}
                    fill={konvaTheme.warning || "#F59E0B"}
                    pointerLength={8}
                    pointerWidth={8}
                  />
                  <Text
                    x={(originGridX + arrowStartX + run / 2) * spacing - 20}
                    y={(originGridY - arrowStartY) * spacing + 10}
                    text={`run: ${Math.abs(run)}`}
                    fontSize={Math.max(12, Math.round(spacing * 0.45))}
                    fontStyle="bold"
                    fill={konvaTheme.warning || "#F59E0B"}
                  />

                  {/* Vertical arrow (rise) */}
                  <Arrow
                    points={[
                      (originGridX + arrowEndX) * spacing,
                      (originGridY - arrowStartY) * spacing,
                      (originGridX + arrowEndX) * spacing,
                      (originGridY - arrowEndY) * spacing,
                    ]}
                    stroke={konvaTheme.success || "#10B981"}
                    strokeWidth={3}
                    fill={konvaTheme.success || "#10B981"}
                    pointerLength={8}
                    pointerWidth={8}
                  />
                  <Text
                    x={(originGridX + arrowEndX) * spacing + 10}
                    y={(originGridY - (arrowStartY + arrowEndY) / 2) * spacing - 10}
                    text={`rise: ${rise}`}
                    fontSize={Math.max(12, Math.round(spacing * 0.45))}
                    fontStyle="bold"
                    fill={konvaTheme.success || "#10B981"}
                  />

                  {/* Second point dot */}
                  <Circle
                    x={(originGridX + arrowEndX) * spacing}
                    y={(originGridY - arrowEndY) * spacing}
                    radius={7}
                    fill={konvaTheme.info || "#3B82F6"}
                    stroke={konvaTheme.shapeStroke}
                    strokeWidth={1.5}
                  />
                </Group>
              )}

              {/* L7: Placed points */}
              {level === 7 && mode === "plot" && placedPoints.map((pt, i) => (
                <Circle
                  key={`placed-${i}`}
                  x={pt.pixelX}
                  y={pt.pixelY}
                  radius={9}
                  fill={plotFeedback === "correct" ? (konvaTheme.success || "#10B981") : (konvaTheme.point || "#EF4444")}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={1.5}
                />
              ))}

              {/* L7: Line through placed points */}
              {level === 7 && mode === "plot" && placedLinePoints && (
                <Line
                  points={placedLinePoints}
                  stroke={plotFeedback === "correct" ? (konvaTheme.success || "#10B981") : (konvaTheme.info || "#3B82F6")}
                  strokeWidth={3}
                  lineCap="round"
                />
              )}

              {/* Answer reveal for L7 */}
              {showAnswer && level === 7 && mode === "plot" && plotFeedback === "correct" && (
                <Line
                  points={linePoints}
                  stroke={konvaTheme.success || "#10B981"}
                  strokeWidth={3}
                  lineCap="round"
                />
              )}
            </Layer>
            </Stage>
          </VisualSection>
        )}

        {/* Level-specific interaction UI */}
        <InteractionSection>
          {/* L1: Y-intercept sign (3 buttons) */}
          {level === 1 && !showAnswer && (
            <ChoiceButtonRow>
              <ChoiceButton
                onClick={() => handleChoiceClick("positive", 0, yInterceptSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 0}
                $borderColor="#10B981"
              >
                Positive
              </ChoiceButton>
              <ChoiceButton
                onClick={() => handleChoiceClick("negative", 1, yInterceptSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 1}
                $borderColor="#EF4444"
              >
                Negative
              </ChoiceButton>
              <ChoiceButton
                onClick={() => handleChoiceClick("zero", 2, yInterceptSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 2}
                $borderColor="#6B7280"
              >
                Zero
              </ChoiceButton>
            </ChoiceButtonRow>
          )}

          {/* L2: Slope sign (4 buttons in one row) */}
          {level === 2 && !showAnswer && (
            <ChoiceButtonRow>
              <ChoiceButton
                onClick={() => handleChoiceClick("positive", 0, slopeSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 0}
                $borderColor="#10B981"
              >
                Positive
              </ChoiceButton>
              <ChoiceButton
                onClick={() => handleChoiceClick("negative", 1, slopeSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 1}
                $borderColor="#EF4444"
              >
                Negative
              </ChoiceButton>
              <ChoiceButton
                onClick={() => handleChoiceClick("zero", 2, slopeSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 2}
                $borderColor="#6B7280"
              >
                Zero
              </ChoiceButton>
              <ChoiceButton
                onClick={() => handleChoiceClick("undefined", 3, slopeSign)}
                disabled={phase === "complete"}
                $shake={shakingIdx === 3}
                $borderColor="#8B5CF6"
              >
                Undefined
              </ChoiceButton>
            </ChoiceButtonRow>
          )}

          {/* L3-5: Enter answer button */}
          {(level === 3 || level === 4 || level === 5) && !panelOpen && !showAnswer && (
            <EnterAnswerButton
              onClick={openPanel}
              disabled={submitted && (
                level === 3 ? level3Correct :
                level === 4 ? level4Correct :
                level5Correct
              )}
              variant="static"
            />
          )}


          {/* L7: Plot controls */}
          {level === 7 && mode === "plot" && !showAnswer && (
            <>
              <PlotStatus>
                {placedPoints.length === 0 && "Tap two points on the grid that satisfy the equation"}
                {placedPoints.length === 1 && "Place one more point"}
                {placedPoints.length === 2 && plotFeedback === null && "Checking..."}
                {plotFeedback === "incorrect" && "Those points don't satisfy the equation. Try again!"}
              </PlotStatus>
              {placedPoints.length > 0 && plotFeedback !== "correct" && (
                <ResetButton onClick={() => setPlacedPoints([])}>Clear Points</ResetButton>
              )}
            </>
          )}

          {/* Wrong attempts display */}
          {(level === 1 || level === 2 || level === 6) && wrongAttempts > 0 && !showAnswer && (
            <WrongAttemptsText>
              {wrongAttempts === 1 ? "1 incorrect attempt" : `${wrongAttempts} incorrect attempts`}
            </WrongAttemptsText>
          )}
        </InteractionSection>
      </CanvasWrapper>

      {/* L3: Rise & Run panel - Conditional OK since level doesn't change within level */}
      {level === 3 && (
        <InputOverlayPanel
          visible={panelOpen}
          onClose={closePanel}
          title="Count Rise & Run"
        >
          {/* Unified Math Keypad with TwoFieldScreen */}
          <UnifiedMathKeypad
            value={activeField === "rise" ? riseInput : runInput}
            onChange={(val) => {
              if (activeField === "rise") {
                handleRiseChange(val);
              } else {
                handleRunChange(val);
              }
            }}
            layout="inline"
            buttonSet="basic"
            screen={
              <TwoFieldScreen
                fields={[
                  { name: 'rise', label: 'Rise:', value: riseInput },
                  { name: 'run', label: 'Run:', value: runInput }
                ]}
                activeField={activeField}
                onFieldSwitch={setActiveField}
                dividerColor="#EF4444"
              />
            }
            showKeepOpen={true}
            keepOpen={keepOpen}
            onKeepOpenChange={setKeepOpen}
          />

          <PanelSubmitButton
            onClick={handleLevel3Submit}
            disabled={!riseInput || !runInput || (submitted && level3Correct)}
          >
            Submit
          </PanelSubmitButton>

          {submitted && (
            <FeedbackSection $isCorrect={level3Correct}>
              {level3Correct ? (
                <FeedbackText>✓ Correct! Rise = {rise}, Run = {run}</FeedbackText>
              ) : (
                <FeedbackText>Not quite. Try again!</FeedbackText>
              )}
            </FeedbackSection>
          )}

          <HintText>Tap a field to enter its value. Count vertical change (rise) and horizontal change (run)</HintText>
        </InputOverlayPanel>
      )}

      {/* L4: Y-intercept panel - Conditional OK since level doesn't change within level */}
      {level === 4 && (
        <InputOverlayPanel
          visible={panelOpen}
          onClose={closePanel}
          title="Enter Y-Intercept"
        >
          <PanelInputLabel>Y-intercept:</PanelInputLabel>
          <UnifiedMathKeypad
            value={inputValue}
            onChange={handleYInterceptChange}
            layout="inline"
            buttonSet="basic"
            showKeepOpen={true}
            keepOpen={keepOpen}
            onKeepOpenChange={setKeepOpen}
          />

          <PanelSubmitButton
            onClick={handleLevel4Submit}
            disabled={!inputValue.trim() || (submitted && level4Correct)}
          >
            Submit
          </PanelSubmitButton>

          {submitted && (
            <FeedbackSection $isCorrect={level4Correct}>
              {level4Correct ? (
                <FeedbackText>✓ Correct! Y-intercept = {yIntercept}</FeedbackText>
              ) : (
                <FeedbackText>Not quite. Try again!</FeedbackText>
              )}
            </FeedbackSection>
          )}

          <HintText>Where does the line cross the y-axis?</HintText>
        </InputOverlayPanel>
      )}

      {/* L5: Slope equation panel - Conditional OK since level doesn't change within level */}
      {level === 5 && (
        <InputOverlayPanel
          visible={panelOpen}
          onClose={closePanel}
          title="Enter Slope Equation"
        >
          <PanelInputLabel>Write the slope (y = mx + b format or fraction):</PanelInputLabel>
          <UnifiedMathKeypad
            value={inputValue}
            onChange={handleSlopeChange}
            layout="inline"
            buttonSet="basic"
            extraButtons={["/", "x", "y", "="]}
            showKeepOpen={true}
            keepOpen={keepOpen}
            onKeepOpenChange={setKeepOpen}
          />

          <PanelSubmitButton
            onClick={handleLevel5Submit}
            disabled={!inputValue.trim() || (submitted && level5Correct)}
          >
            Submit
          </PanelSubmitButton>

          {submitted && (
            <FeedbackSection $isCorrect={level5Correct}>
              {level5Correct ? (
                <FeedbackText>✓ Correct! Slope = {rise}/{run}</FeedbackText>
              ) : (
                <FeedbackText>Not quite. Try again!</FeedbackText>
              )}
            </FeedbackSection>
          )}

          <HintText>Examples: 2/3, -1/2, y=2x+3, or y = (3/4)x - 2</HintText>
        </InputOverlayPanel>
      )}

      {/* Explanation Modal - iPad optimized (no scrolling) */}
      {(showModal || showAnswer) && (
        <ExplanationModal
          explanation={explanation}
          onClose={() => setShowModal(false)}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
};

export default GraphingLinesLesson;

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
`;

const LevelBadge = styled.span`
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 8px 0;
  max-width: 700px;
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 4px 0 12px 0;
  max-width: 700px;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const EquationDisplay = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.info || "#3B82F6"};
  text-align: center;
  margin: 8px 0 16px 0;
  padding: 12px 24px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.info || "#3B82F6"};
  border-radius: 12px;
  font-family: "Georgia", serif;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const CanvasWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease-in-out;

  @media (min-width: 769px) {
    transform: translateX(${props => props.$panelOpen ? `-${props.$slideDistance}px` : '0'});
  }

  @media (max-width: 768px) {
    transform: translateX(0);
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ChoiceButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 800px;

  @media (max-width: 768px) {
    gap: 8px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const ChoiceButton = styled.button`
  flex: 1;
  min-width: 140px;
  min-height: 56px;
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid ${props => props.$borderColor};
  background-color: ${props => props.$selected ? props.$borderColor : 'transparent'};
  color: ${props => props.$selected ? 'white' : props.$borderColor};
  cursor: pointer;
  transition: all 0.2s;
  animation: ${props => props.$shake ? shakeAnim : 'none'} 0.6s;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:hover:not(:disabled) {
    background-color: ${props => props.$borderColor};
    color: white;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  @media (max-width: 1024px) {
    min-width: 120px;
    padding: 12px 24px;
    font-size: 17px;
  }

  @media (max-width: 768px) {
    min-height: 48px;
    font-size: 16px;
    min-width: 100px;
    padding: 12px 20px;
  }

  @media (max-width: 480px) {
    min-width: 80px;
    padding: 10px 16px;
    font-size: 15px;
  }
`;

const TapInstructionText = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin: 8px 0;
`;

const WrongAttemptsText = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.buttonError || '#EF4444'};
  text-align: center;
  min-height: 20px;
`;

const PlotStatus = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textSecondary};
  transition: opacity 0.2s;
  touch-action: manipulation;

  &:hover {
    opacity: 0.8;
  }
`;

// Level 3: Multi-input field components (fraction-style layout)
const MultiInputColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;  /* 1/4 inch spacing (~20-24px) */
  width: 100%;
  margin-bottom: 20px;
`;

const HorizontalDivider = styled.div`
  width: 100%;
  height: 3px;
  background-color: #EF4444;  /* Red fraction bar */
  margin: 0;
`;

const InputFieldBox = styled.div`
  flex: 1;
  padding: 16px;
  background-color: ${props => props.theme.colors.pageBackground};
  border: 2px solid ${props => props.$active
    ? props.theme.colors.info || '#3B82F6'
    : props.theme.colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.theme.colors.info || '#3B82F6'};
    background-color: ${props => props.$active
      ? props.theme.colors.pageBackground
      : props.theme.colors.cardBackground};
  }

  ${props => props.$active && `
    box-shadow: 0 0 0 3px ${props.theme.colors.info}20;
  `}
`;

const FieldLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  min-width: 40px;
  text-align: center;
`;

// Panel components for Levels 3-5
const FeedbackSection = styled.div`
  padding: 16px 24px;
  background-color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess + '20'
    : props.theme.colors.buttonError + '20'
  };
  border-radius: 8px;
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonError || '#EF4444'
  };
  margin-top: 12px;
`;

const FeedbackText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
`;

const HintText = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin-top: 12px;
  font-style: italic;
`;

// Panel components for Levels 3-5
const PanelInputLabel = styled.label`
  font-size: 17px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 12px;
  text-align: center;
  display: block;
`;

const PanelSubmitButton = styled.button`
  width: 100%;
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.info || '#3B82F6'};
  color: white;
  transition: all 0.2s;
  min-height: 48px;
  margin-top: 12px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Level 6: Side-by-side layout for canvas and buttons
const Level6Container = styled.div`
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Level6ButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 160px;

  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: unset;
    width: 100%;
  }
`;
