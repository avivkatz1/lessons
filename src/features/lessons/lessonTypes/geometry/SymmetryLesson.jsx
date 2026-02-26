import React, { useState, useMemo, useEffect } from "react";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import styled from "styled-components";
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
  }, [currentQuestionIndex, level]);

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
      setIsComplete(true);
    } else {
      setCheckResult({
        correct: correct.size,
        total: expectedSet.size,
        wrong,
        missingCount,
      });
    }
  };

  const handleTryAnother = () => {
    setClickedCells(new Set());
    setCheckResult(null);
    setShowHint(false);
    setIsComplete(false);
    triggerNewProblem();
  };

  const handleReset = () => {
    setClickedCells(new Set());
    setCheckResult(null);
  };

  if (!currentProblem || !axis) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
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

        {!isComplete && !showAnswer && isPlottingLevel && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={() => setIsComplete(true)}
            onTryAnother={handleTryAnother}
            disabled={isComplete}
            placeholder="e.g. (7,2), (5,4)"
            onKeypadOpenChange={setKeypadOpen}
          />
        )}
      </InteractionSection>

      {/* Explanation Modal */}
      {isComplete && (
        <ExplanationModal
          explanation={explanation}
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
