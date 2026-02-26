import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { Stage, Layer, Rect, Circle, Line, Text, Group } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Find the Y-Intercept", instruction: "Look where the line crosses the y-axis." },
  2: { title: "Find the Slope", instruction: "Use the rise/run arrows to determine the slope." },
  3: { title: "Write the Equation", instruction: "Write the equation in slope-intercept form: y = mx + b" },
  4: { title: "Equations with Negatives", instruction: "The slope can be negative. Write y = mx + b" },
  5: { title: "Plot the Line", instruction: "Place two points on the grid that satisfy the equation." },
};

// ==================== HELPERS ====================

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

// ==================== MAIN COMPONENT ====================

const GraphingLines = ({ triggerNewProblem }) => {
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
  const [showHint, setShowHint] = useState(false);

  // L5 interactive state
  const [placedPoints, setPlacedPoints] = useState([]);
  const [plotFeedback, setPlotFeedback] = useState(null); // "correct" | "incorrect" | null

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    rise = 1,
    run = 1,
    yIntercept = 0,
    originGridX = 10,
    originGridY = 10,
    gridSize = 20,
    showRiseRunArrows = false,
    equationText = null,
    mode = "identify",
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (currentProblem?.answer) return currentProblem.answer;
    return ["0"];
  }, [currentProblem]);

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPlacedPoints([]);
    setPlotFeedback(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // Canvas sizing
  const canvasSize = Math.min(width - 40, 600);
  const spacing = canvasSize / gridSize;

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Reset placed points when problem changes
  const problemKey = `${rise}-${run}-${yIntercept}-${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPlacedPoints([]);
    setPlotFeedback(null);
  }

  if (!currentProblem || !visualData.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Line endpoints for L1-L4 (and for L5 answer reveal)
  const linePoints = getLineEndpoints(rise, run, yIntercept, originGridX, originGridY, gridSize, spacing);

  // Y-intercept pixel position
  const yIntPxX = originGridX * spacing;
  const yIntPxY = (originGridY - yIntercept) * spacing;

  // Rise/run arrow reference point (for L2): start from y-intercept
  const arrowStartX = 0; // math x
  const arrowStartY = yIntercept; // math y
  const arrowEndX = run; // math x after moving run right
  const arrowEndY = yIntercept + rise; // math y after rising

  // L5: handle canvas click to place points
  const handleCanvasClick = (e) => {
    if (mode !== "plot" || showAnswer || plotFeedback === "correct") return;
    if (placedPoints.length >= 2) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const snapped = snapToGrid(pos.x, pos.y, originGridX, originGridY, spacing, gridSize);

    // Don't place duplicate points
    if (placedPoints.some(p => p.mathX === snapped.mathX && p.mathY === snapped.mathY)) return;

    setPlacedPoints(prev => [...prev, snapped]);
    setPlotFeedback(null);
  };

  // L5: check if placed points satisfy the equation
  const handleCheckPlot = () => {
    if (placedPoints.length !== 2) return;
    const slope = rise / run;
    const allCorrect = placedPoints.every(p => {
      const expectedY = slope * p.mathX + yIntercept;
      return Math.abs(expectedY - p.mathY) < 0.001;
    });

    if (allCorrect) {
      setPlotFeedback("correct");
      revealAnswer();
    } else {
      setPlotFeedback("incorrect");
      // Reset after brief delay
      setTimeout(() => {
        setPlacedPoints([]);
        setPlotFeedback(null);
      }, 1500);
    }
  };

  // L5: compute line through placed points for rendering
  let placedLinePoints = null;
  if (placedPoints.length === 2) {
    const p1 = placedPoints[0];
    const p2 = placedPoints[1];
    if (p1.mathX !== p2.mathX) {
      const placedSlope = (p2.mathY - p1.mathY) / (p2.mathX - p1.mathX);
      const placedIntercept = p1.mathY - placedSlope * p1.mathX;
      // Approximate rise/run as integers for display
      placedLinePoints = getLineEndpoints(
        p2.mathY - p1.mathY,
        p2.mathX - p1.mathX,
        placedIntercept,
        originGridX, originGridY, gridSize, spacing
      );
    } else {
      // Vertical line — just connect the two points extended
      placedLinePoints = [p1.pixelX, 0, p1.pixelX, canvasSize];
    }
  }

  // Determine answer type for AnswerInput
  const getAnswerType = () => {
    if (level === 1) return "number";
    return "array";
  };

  const getPlaceholder = () => {
    if (level === 1) return "e.g. 3";
    if (level === 2) return "e.g. 2/3";
    return "e.g. y = 2/3x + 1";
  };

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !showHint && hint && plotFeedback !== "correct" && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question text / Equation for L5 */}
      {mode === "plot" && equationText ? (
        <EquationDisplay>{equationText}</EquationDisplay>
      ) : (
        <QuestionTextStyled>{questionText}</QuestionTextStyled>
      )}

      {/* Grid visualization */}
      <VisualSection>
        <Stage
          width={canvasSize}
          height={canvasSize}
          onClick={handleCanvasClick}
          onTap={handleCanvasClick}
        >
          <Layer>
            {/* Background */}
            <Rect x={0} y={0} width={canvasSize} height={canvasSize} fill={konvaTheme.canvasBackground} />

            {/* Horizontal grid lines */}
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

            {/* Vertical grid lines */}
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

            {/* Axis number labels (show every other for readability) */}
            {[...Array(gridSize)].map((_, i) => {
              const xValue = i - originGridX;
              if (xValue === 0) return null;
              if (i % 2 !== 0) return null;
              if (i < 1 || i > gridSize - 2) return null;
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
              if (yValue === 0) return null;
              if (i % 2 !== 0) return null;
              if (i < 1 || i > gridSize - 2) return null;
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

            {/* Origin "0" label */}
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

          {/* Line + annotations layer */}
          <Layer>
            {/* The line for L1-L4 (always shown) */}
            {mode === "identify" && (
              <Line
                points={linePoints}
                stroke={konvaTheme.info || "#3B82F6"}
                strokeWidth={3}
                lineCap="round"
              />
            )}

            {/* Y-intercept dot for L1-L4 */}
            {mode === "identify" && (
              <Circle
                x={yIntPxX}
                y={yIntPxY}
                radius={8}
                fill={konvaTheme.point || "#EF4444"}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={1.5}
              />
            )}

            {/* Rise/run arrows for L2 */}
            {showRiseRunArrows && (
              <Group>
                {/* Horizontal arrow (run) */}
                <Line
                  points={[
                    (originGridX + arrowStartX) * spacing,
                    (originGridY - arrowStartY) * spacing,
                    (originGridX + arrowEndX) * spacing,
                    (originGridY - arrowStartY) * spacing,
                  ]}
                  stroke={konvaTheme.warning || "#F59E0B"}
                  strokeWidth={2.5}
                  dash={[6, 4]}
                />
                {/* Run label */}
                <Text
                  x={(originGridX + arrowStartX + run / 2) * spacing - 12}
                  y={(originGridY - arrowStartY) * spacing + 6}
                  text={`run: ${run}`}
                  fontSize={Math.max(11, Math.round(spacing * 0.4))}
                  fontStyle="bold"
                  fill={konvaTheme.warning || "#F59E0B"}
                />
                {/* Vertical arrow (rise) */}
                <Line
                  points={[
                    (originGridX + arrowEndX) * spacing,
                    (originGridY - arrowStartY) * spacing,
                    (originGridX + arrowEndX) * spacing,
                    (originGridY - arrowEndY) * spacing,
                  ]}
                  stroke={konvaTheme.success || "#10B981"}
                  strokeWidth={2.5}
                  dash={[6, 4]}
                />
                {/* Rise label */}
                <Text
                  x={(originGridX + arrowEndX) * spacing + 6}
                  y={(originGridY - (arrowStartY + arrowEndY) / 2) * spacing - 6}
                  text={`rise: ${rise}`}
                  fontSize={Math.max(11, Math.round(spacing * 0.4))}
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

            {/* L5: Placed points */}
            {mode === "plot" && placedPoints.map((pt, i) => (
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

            {/* L5: Line through placed points */}
            {mode === "plot" && placedLinePoints && (
              <Line
                points={placedLinePoints}
                stroke={plotFeedback === "correct" ? (konvaTheme.success || "#10B981") : (konvaTheme.info || "#3B82F6")}
                strokeWidth={3}
                lineCap="round"
              />
            )}

            {/* Answer reveal: show correct line and equation for L5 */}
            {showAnswer && mode === "plot" && plotFeedback === "correct" && (
              <Line
                points={linePoints}
                stroke={konvaTheme.success || "#10B981"}
                strokeWidth={3}
                lineCap="round"
              />
            )}

            {/* Answer reveal: equation label for L1-L4 */}
            {showAnswer && mode === "identify" && (
              <Text
                x={yIntPxX + 14}
                y={yIntPxY - 20}
                text={correctAnswer[0]}
                fontSize={Math.round(spacing * 0.5)}
                fontStyle="bold"
                fill={konvaTheme.labelText}
              />
            )}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && showHint && plotFeedback !== "correct" && <HintBox>{hint}</HintBox>}

        {/* L1-L4: Answer input */}
        {mode === "identify" && !showAnswer && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType={getAnswerType()}
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder={getPlaceholder()}
          />
        )}

        {/* L5: Plot controls */}
        {mode === "plot" && !showAnswer && (
          <>
            <PlotStatus>
              {placedPoints.length === 0 && "Tap two points on the grid that satisfy the equation"}
              {placedPoints.length === 1 && "Place one more point"}
              {placedPoints.length === 2 && plotFeedback === null && "Ready to check!"}
              {plotFeedback === "incorrect" && "Those points don't satisfy the equation. Try again!"}
            </PlotStatus>
            <ButtonRow>
              {placedPoints.length === 2 && plotFeedback === null && (
                <CheckButton onClick={handleCheckPlot}>Check Answer</CheckButton>
              )}
              {placedPoints.length > 0 && plotFeedback === null && (
                <ResetButton onClick={() => setPlacedPoints([])}>Clear Points</ResetButton>
              )}
            </ButtonRow>
          </>
        )}
      </InteractionSection>

      {/* Explanation */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
};

export default GraphingLines;

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

const QuestionTextStyled = styled.p`
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

const VisualSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
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
  gap: 15px;
  margin-bottom: 20px;
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
`;

const PlotStatus = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const CheckButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;

  &:hover {
    opacity: 0.9;
  }
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
`;

const ExplanationTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  text-align: center;
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
  touch-action: manipulation;

  &:hover {
    opacity: 0.9;
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
  touch-action: manipulation;

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
