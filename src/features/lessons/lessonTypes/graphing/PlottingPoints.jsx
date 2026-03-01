/**
 * PlottingPoints - Interactive coordinate plotting lesson with progressive scaffolding
 *
 * LEVELS:
 *   L1-2: Read coordinates (InputOverlayPanel + SlimMathKeypad)
 *   L3: Verify point location (binary YES/NO choice)
 *   L4-5: Plot points (click-to-place on grid)
 *   L6: Plot multiple labeled points (click-to-place with labels)
 *   L7: Enter reflected coordinates (InputOverlayPanel + coordinate entry)
 *   L8: Word problems (click-to-place with real-world context)
 *
 * INTERACTION MODES:
 *   - 'read': Student enters coordinates of pre-placed point via keypad
 *   - 'verify': Student answers YES/NO if point matches target coordinate
 *   - 'plot': Student clicks grid to place point at target coordinate
 *   - 'multiplot': Student clicks grid to place multiple labeled points
 *   - 'reflect': Student enters coordinates of reflected point via keypad
 *   - 'wordproblem': Student clicks grid based on word problem description
 *
 * DOCUMENTATION:
 *   - Full guide: frontends/lessons/docs/guides/COORDINATE_GRID_SYSTEM.md
 *   - Input panel: frontends/lessons/docs/guides/INPUT_OVERLAY_PANEL_SYSTEM.md
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import InputOverlayPanel from "../../../../shared/components/InputOverlayPanel";
import { UnifiedMathKeypad } from "../../../../shared/components";
import EnterAnswerButton from "../../../../shared/components/EnterAnswerButton";
import ExplanationModal from "../geometry/ExplanationModal";
import { useInputOverlay } from "../geometry/hooks/useInputOverlay";
import useCoordinateTransform from "./hooks/useCoordinateTransform";
import useGridInteraction from "./hooks/useGridInteraction";
import styled, { css } from "styled-components";
import { Stage, Layer, Rect, Circle, Line, Text, Group } from "react-konva";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Reading Coordinates", instruction: "Find the coordinates of the red dot. Count from the origin." },
  2: { title: "Verify Location", instruction: "Is the red dot at the shown coordinates? Click YES or NO." },
  3: { title: "Plot Points (Quadrant I)", instruction: "Click on the grid to plot a point at the given coordinates." },
  4: { title: "Plot Points (All Quadrants)", instruction: "Click to plot the point. Watch for negative coordinates!" },
  5: { title: "Plot Multiple Points", instruction: "Click to plot each labeled point at the correct coordinates." },
  6: { title: "Reflection Coordinates", instruction: "Reflect the point across the axis and enter the new coordinates." },
  7: { title: "Word Problems", instruction: "Read the problem and click to plot the answer on the grid." },
};

// ==================== HELPER: PARSE COORDINATE INPUT ====================

function parseCoordinate(input) {
  if (!input || input.trim() === '') {
    return { x: null, y: null, valid: false, error: 'Please enter a coordinate' };
  }

  // Remove spaces and parentheses
  const cleaned = input.replace(/\s/g, '').replace(/[()]/g, '');

  // Match pattern: number,number
  const match = cleaned.match(/^(-?\d+),(-?\d+)$/);

  if (!match) {
    return {
      x: null,
      y: null,
      valid: false,
      error: 'Invalid format. Use: x,y (e.g., 3,4 or -2,5)'
    };
  }

  const x = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);

  return { x, y, valid: true };
}

// ==================== MAIN COMPONENT ====================

const PlottingPoints = ({ triggerNewProblem }) => {
  const {
    lessonProps,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};

  const {
    level = 1,
    mode = 'read',
    gridSize = 11,
    originGridX = 5,
    originGridY = 5,

    // For read/plot modes
    pointX,
    pointY,
    targetX,
    targetY,

    // For verify mode
    actualX,
    actualY,
    isCorrect: verifyIsCorrect,

    // For multiplot mode
    points,

    // For reflect mode
    originalPoint,
    expectedReflection,
    axis,
    linePosition,
  } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || "";
  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // ==================== STATE ====================

  const [showHint, setShowHint] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // For InputOverlayPanel modes (read, reflect)
  const {
    panelOpen,
    inputValue,
    setInputValue,
    openPanel,
    closePanel,
    keepOpen,
    setKeepOpen,
  } = useInputOverlay();

  const [submitted, setSubmitted] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);

  // For plot/multiplot modes (click-to-place)
  const [placedPoint, setPlacedPoint] = useState(null); // { col, row }
  const [placedPoints, setPlacedPoints] = useState({}); // For multiplot: { "A": {col, row}, ...}
  const [pointSubmitted, setPointSubmitted] = useState(false);

  // For verify mode
  const [verifyAnswer, setVerifyAnswer] = useState(null); // "Yes" or "No"

  // ==================== COORDINATE TRANSFORMATION ====================

  const { mathToGrid, gridToMath } = useCoordinateTransform(gridSize, originGridX, originGridY);

  // ==================== CANVAS SIZING ====================

  const needsKeypad = mode === 'read' || mode === 'reflect';

  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(windowWidth - 40, 500);

    // With keypad on iPad: shrink to 320px
    if (needsKeypad && panelOpen && windowWidth <= 1024) {
      return Math.min(baseMax, 320);
    }

    // iPad general: 400px
    if (windowWidth <= 1024) {
      return Math.min(baseMax, 400);
    }

    return baseMax;
  }, [windowWidth, needsKeypad, panelOpen]);

  const cellSize = canvasWidth / gridSize;

  // Canvas slide animation for InputOverlayPanel
  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0;
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75;
  }, [windowWidth]);

  // ==================== GRID INTERACTION (for plot modes) ====================

  const handleCellClick = useCallback((row, col) => {
    if (mode === 'plot' || mode === 'wordproblem') {
      setPlacedPoint({ col, row });
      setPointSubmitted(false);
    } else if (mode === 'multiplot') {
      // Determine which point to place (first unfilled)
      const labels = points?.map(p => p.label) || ["A", "B", "C"];
      const nextLabel = labels.find(label => !placedPoints[label]);
      if (nextLabel) {
        setPlacedPoints(prev => ({
          ...prev,
          [nextLabel]: { col, row }
        }));
      }
      setPointSubmitted(false);
    }
  }, [mode, points, placedPoints]);

  const { handleStageClick } = useGridInteraction(canvasWidth, gridSize, handleCellClick);

  // ==================== RESET ON PROBLEM CHANGE ====================

  useEffect(() => {
    setShowHint(false);
    setSubmitted(false);
    setAnswerCorrect(false);
    setPlacedPoint(null);
    setPlacedPoints({});
    setPointSubmitted(false);
    setVerifyAnswer(null);
    if (!keepOpen) {
      // Normal mode: close panel and reset everything
      closePanel();
      setInputValue('');
    } else {
      // Keep Open mode: just reset input, keep panel open
      setInputValue('');
    }
    setIsComplete(false);
    setModalClosedWithX(false);
  }, [currentQuestionIndex, level, keepOpen, closePanel, setInputValue]);

  // ==================== HANDLERS: READ/REFLECT MODES ====================

  const handleSubmitCoordinate = useCallback(() => {
    const parsed = parseCoordinate(inputValue);

    if (!parsed.valid) {
      return; // Show error in panel
    }

    const { x, y } = parsed;

    let correct = false;

    if (mode === 'read') {
      // Check against pre-placed point
      correct = x === pointX && y === pointY;
    } else if (mode === 'reflect') {
      // Check against expected reflection
      correct = x === expectedReflection?.x && y === expectedReflection?.y;
    }

    setSubmitted(true);
    setAnswerCorrect(correct);

    if (correct) {
      // Handle keepOpen mode
      if (keepOpen) {
        // Keep panel open, clear input, auto-advance after 1 second
        setTimeout(() => {
          setInputValue('');
          setSubmitted(false);
          triggerNewProblem();
        }, 1000);
      } else {
        // Normal mode: close panel and show modal
        setTimeout(() => {
          setIsComplete(true);
          closePanel();
        }, 800);
      }
    }
  }, [inputValue, mode, pointX, pointY, expectedReflection, closePanel, keepOpen, setInputValue, triggerNewProblem]);

  // ==================== HANDLERS: VERIFY MODE ====================

  const handleVerifyAnswer = useCallback((answer) => {
    setVerifyAnswer(answer);
    const correct = (answer === "Yes" && verifyIsCorrect) || (answer === "No" && !verifyIsCorrect);
    setAnswerCorrect(correct);
    setSubmitted(true);

    if (correct) {
      setTimeout(() => setIsComplete(true), 800);
    }
  }, [verifyIsCorrect]);

  // ==================== HANDLERS: PLOT/MULTIPLOT MODES ====================

  const handleSubmitPlot = useCallback(() => {
    if (mode === 'plot' || mode === 'wordproblem') {
      if (!placedPoint) return;

      const { mathX, mathY } = gridToMath(placedPoint.col, placedPoint.row);
      const correct = mathX === targetX && mathY === targetY;

      setPointSubmitted(true);
      setAnswerCorrect(correct);

      if (correct) {
        setTimeout(() => setIsComplete(true), 800);
      }
    } else if (mode === 'multiplot') {
      // Check all points
      const labels = points?.map(p => p.label) || [];
      const allPlaced = labels.every(label => placedPoints[label]);
      if (!allPlaced) return;

      const allCorrect = labels.every(label => {
        const placed = placedPoints[label];
        const expected = points.find(p => p.label === label);
        if (!placed || !expected) return false;

        const { mathX, mathY } = gridToMath(placed.col, placed.row);
        return mathX === expected.x && mathY === expected.y;
      });

      setPointSubmitted(true);
      setAnswerCorrect(allCorrect);

      if (allCorrect) {
        setTimeout(() => setIsComplete(true), 800);
      }
    }
  }, [mode, placedPoint, placedPoints, points, targetX, targetY, gridToMath]);

  // ==================== HANDLERS: DRAG (MULTIPLOT) ====================

  const handleDragEnd = useCallback((label, e) => {
    const node = e.target;
    const cellSize = canvasWidth / gridSize;

    // Get the new pixel position
    const x = node.x();
    const y = node.y();

    // Convert to grid cell
    const col = Math.round(x / cellSize);
    const row = Math.round(y / cellSize);

    // Validate bounds
    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      setPlacedPoints(prev => ({
        ...prev,
        [label]: { col, row }
      }));
    } else {
      // Snap back to previous position if out of bounds
      const prevPos = placedPoints[label];
      if (prevPos) {
        node.x(prevPos.col * cellSize);
        node.y(prevPos.row * cellSize);
      }
    }
  }, [canvasWidth, gridSize, placedPoints]);

  const handleDragMove = useCallback((e) => {
    const node = e.target;
    const cellSize = canvasWidth / gridSize;
    const maxPos = (gridSize - 1) * cellSize;

    // Constrain to grid bounds
    node.x(Math.max(0, Math.min(maxPos, node.x())));
    node.y(Math.max(0, Math.min(maxPos, node.y())));
  }, [canvasWidth, gridSize]);

  // ==================== HANDLERS: TRY ANOTHER ====================

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setIsComplete(false);
    setModalClosedWithX(false);
    setInputValue('');
    closePanel();
    triggerNewProblem();
  }, [setInputValue, closePanel, triggerNewProblem]);

  // ==================== RENDERING: GRID ====================

  const renderGrid = () => (
    <Stage width={canvasWidth} height={canvasWidth} onClick={mode.includes('plot') || mode === 'wordproblem' ? handleStageClick : undefined}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasWidth} fill={konvaTheme.canvasBackground} />

        {/* Horizontal grid lines */}
        {[...Array(gridSize + 1)].map((_, i) => {
          const isOriginRow = i === originGridY;
          return (
            <Line
              key={`h${i}`}
              points={[0, i * cellSize, canvasWidth, i * cellSize]}
              stroke={isOriginRow ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
              strokeWidth={isOriginRow ? 2.5 : 0.5}
            />
          );
        })}

        {/* Vertical grid lines */}
        {[...Array(gridSize + 1)].map((_, i) => {
          const isOriginCol = i === originGridX;
          return (
            <Line
              key={`v${i}`}
              points={[i * cellSize, 0, i * cellSize, canvasWidth]}
              stroke={isOriginCol ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
              strokeWidth={isOriginCol ? 2.5 : 0.5}
            />
          );
        })}

        {/* Axis labels */}
        {[...Array(gridSize)].map((_, i) => {
          const { mathX } = gridToMath(i, originGridY);
          const { mathY } = gridToMath(originGridX, i);

          const labelFontSize = Math.max(9, Math.round(cellSize * 0.35));

          return (
            <React.Fragment key={`labels${i}`}>
              {/* X-axis labels */}
              {mathX !== 0 && i > 0 && i < gridSize - 1 && (
                <Text
                  x={i * cellSize - labelFontSize * 0.3}
                  y={originGridY * cellSize + 4}
                  text={String(mathX)}
                  fontSize={labelFontSize}
                  fill={konvaTheme.coordinateText || konvaTheme.labelText}
                />
              )}

              {/* Y-axis labels */}
              {mathY !== 0 && i > 0 && i < gridSize - 1 && (
                <Text
                  x={originGridX * cellSize + 4}
                  y={i * cellSize - labelFontSize * 0.45}
                  text={String(mathY)}
                  fontSize={labelFontSize}
                  fill={konvaTheme.coordinateText || konvaTheme.labelText}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Origin "0" label */}
        <Text
          x={originGridX * cellSize + 4}
          y={originGridY * cellSize + 4}
          text="0"
          fontSize={Math.max(9, Math.round(cellSize * 0.35))}
          fill={konvaTheme.coordinateText || konvaTheme.labelText}
        />

        {/* Origin dot */}
        <Circle
          x={originGridX * cellSize}
          y={originGridY * cellSize}
          radius={4}
          fill={konvaTheme.shapeStroke}
        />

        {/* Reflection line for L7 */}
        {mode === 'reflect' && axis && (
          <Line
            points={
              axis === 'vertical'
                ? [originGridX * cellSize, 0, originGridX * cellSize, canvasWidth]
                : [0, originGridY * cellSize, canvasWidth, originGridY * cellSize]
            }
            stroke="#F59E0B"
            strokeWidth={2.5}
            dash={[8, 4]}
          />
        )}
      </Layer>

      {/* Points layer */}
      <Layer>
        {/* READ/VERIFY MODE: Pre-placed red dot */}
        {mode === 'read' && pointX !== undefined && pointY !== undefined && (
          <>
            <Circle
              x={(originGridX + pointX) * cellSize}
              y={(originGridY - pointY) * cellSize}
              radius={cellSize * 0.3}
              fill={konvaTheme.point || "#EF4444"}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={1.5}
            />
          </>
        )}
        {mode === 'verify' && actualX !== undefined && actualY !== undefined && (
          <>
            <Circle
              x={(originGridX + actualX) * cellSize}
              y={(originGridY - actualY) * cellSize}
              radius={cellSize * 0.3}
              fill={konvaTheme.point || "#EF4444"}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={1.5}
            />
          </>
        )}

        {/* REFLECT MODE: Original point */}
        {mode === 'reflect' && originalPoint && (
          <>
            <Circle
              x={(originGridX + originalPoint.x) * cellSize}
              y={(originGridY - originalPoint.y) * cellSize}
              radius={cellSize * 0.3}
              fill="#3B82F6"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <Text
              x={(originGridX + originalPoint.x) * cellSize + cellSize * 0.35}
              y={(originGridY - originalPoint.y) * cellSize - cellSize * 0.5}
              text={originalPoint.label}
              fontSize={Math.max(12, cellSize * 0.35)}
              fontStyle="bold"
              fill="#3B82F6"
            />
          </>
        )}

        {/* REFLECT MODE: User-entered reflected point */}
        {mode === 'reflect' && submitted && (
          (() => {
            const parsed = parseCoordinate(inputValue);
            if (!parsed.valid) return null;
            const { gridCol, gridRow } = mathToGrid(parsed.x, parsed.y);
            const color = answerCorrect ? '#10B981' : '#EF4444';

            return (
              <>
                <Circle
                  x={gridCol * cellSize}
                  y={gridRow * cellSize}
                  radius={cellSize * 0.3}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
                <Text
                  x={gridCol * cellSize + cellSize * 0.35}
                  y={gridRow * cellSize - cellSize * 0.5}
                  text="A'"
                  fontSize={Math.max(12, cellSize * 0.35)}
                  fontStyle="bold"
                  fill={color}
                />
              </>
            );
          })()
        )}

        {/* PLOT/WORDPROBLEM MODE: User-placed point */}
        {(mode === 'plot' || mode === 'wordproblem') && placedPoint && (
          <Circle
            x={placedPoint.col * cellSize}
            y={placedPoint.row * cellSize}
            radius={cellSize * 0.3}
            fill={!pointSubmitted ? '#3B82F6' : answerCorrect ? '#10B981' : '#EF4444'}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        )}

        {/* MULTIPLOT MODE: User-placed points */}
        {mode === 'multiplot' && Object.entries(placedPoints).map(([label, pos]) => {
          let color = '#3B82F6'; // Blue preview
          if (pointSubmitted) {
            const expected = points?.find(p => p.label === label);
            if (expected) {
              const { mathX, mathY } = gridToMath(pos.col, pos.row);
              const correct = mathX === expected.x && mathY === expected.y;
              color = correct ? '#10B981' : '#EF4444';
            }
          }

          return (
            <Group
              key={label}
              x={pos.col * cellSize}
              y={pos.row * cellSize}
              draggable={!pointSubmitted}
              onDragEnd={(e) => handleDragEnd(label, e)}
              onDragMove={handleDragMove}
            >
              <Circle
                radius={cellSize * 0.3}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Text
                x={cellSize * 0.35}
                y={-cellSize * 0.5}
                text={label}
                fontSize={Math.max(12, cellSize * 0.35)}
                fontStyle="bold"
                fill={color}
              />
            </Group>
          );
        })}
      </Layer>
    </Stage>
  );

  // ==================== RENDERING: SUBMIT BUTTON ====================

  const renderSubmitButton = () => {
    if (mode === 'verify') return null; // Verify has its own YES/NO buttons
    if (mode === 'read' || mode === 'reflect') return null; // These use panel

    const canSubmit =
      (mode === 'plot' || mode === 'wordproblem') ? !!placedPoint :
      mode === 'multiplot' ? Object.keys(placedPoints).length === points?.length :
      false;

    const buttonText =
      !pointSubmitted ? 'Submit' :
      answerCorrect ? '✓ Correct' :
      'Retry';

    const buttonColor =
      !pointSubmitted ? '#3B82F6' :
      answerCorrect ? '#10B981' :
      '#EF4444';

    return (
      <SubmitButton
        onClick={handleSubmitPlot}
        disabled={!canSubmit || (pointSubmitted && answerCorrect)}
        $color={buttonColor}
      >
        {buttonText}
      </SubmitButton>
    );
  };

  // ==================== MAIN RENDER ====================

  if (!currentProblem || !visualData.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Hint button */}
      {!isComplete && !showHint && hint && (
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

      {/* Question text */}
      <QuestionTextStyled dangerouslySetInnerHTML={{ __html: questionText }} />

      {/* Hint box */}
      {!isComplete && showHint && <HintBox>{hint}</HintBox>}

      {/* Canvas with slide animation */}
      <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
        <CanvasContainer>
          {renderGrid()}
        </CanvasContainer>

        {/* Verify mode: YES/NO buttons */}
        {mode === 'verify' && !isComplete && (
          <VerifyButtonContainer>
            <YesButton
              onClick={() => handleVerifyAnswer("Yes")}
              disabled={verifyAnswer !== null}
              $isSelected={verifyAnswer === "Yes"}
            >
              YES
            </YesButton>
            <NoButton
              onClick={() => handleVerifyAnswer("No")}
              disabled={verifyAnswer !== null}
              $isSelected={verifyAnswer === "No"}
            >
              NO
            </NoButton>
          </VerifyButtonContainer>
        )}

        {/* Read/Reflect modes: Enter Answer button */}
        {(mode === 'read' || mode === 'reflect') && !panelOpen && !isComplete && (
          <ButtonContainer>
            <EnterAnswerButton variant="static" onClick={openPanel} />
          </ButtonContainer>
        )}

        {/* Plot modes: Submit button */}
        {(mode === 'plot' || mode === 'multiplot' || mode === 'wordproblem') && !isComplete && (
          <ButtonContainer>
            {renderSubmitButton()}
          </ButtonContainer>
        )}
      </CanvasWrapper>

      {/* InputOverlayPanel for Read/Reflect modes */}
      {(mode === 'read' || mode === 'reflect') && (
        <InputOverlayPanel visible={panelOpen} onClose={closePanel} title="Enter Coordinates">
          <InputLabel>Coordinates (x, y):</InputLabel>
          <CoordinateDisplay>
            {inputValue || '( __, __ )'}
          </CoordinateDisplay>

          <UnifiedMathKeypad
            value={inputValue}
            onChange={setInputValue}
            layout="inline"
            buttonSet="basic"
            extraButtons={["(", ",", ")"]}
            showKeepOpen={true}
            keepOpen={keepOpen}
            onKeepOpenChange={setKeepOpen}
          />

          {submitted && (
            <FeedbackMessage $isCorrect={answerCorrect}>
              {answerCorrect ? '✓ Correct!' : '✗ Incorrect. Try again!'}
            </FeedbackMessage>
          )}

          <SubmitButton
            onClick={handleSubmitCoordinate}
            disabled={!inputValue || (submitted && answerCorrect)}
            $color={submitted && answerCorrect ? '#10B981' : submitted ? '#EF4444' : '#3B82F6'}
          >
            {submitted && answerCorrect ? '✓ Done' : submitted ? 'Retry' : 'Submit'}
          </SubmitButton>
        </InputOverlayPanel>
      )}

      {/* Success modal */}
      {isComplete && (
        <ExplanationModal
          isOpen={isComplete}
          onClose={() => setModalClosedWithX(true)}
          title="Correct!"
          explanation={explanation}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
};

export default PlottingPoints;

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

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 4px;
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

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 8px 0;
  max-width: 700px;

  @media (max-width: 1024px) {
    font-size: 14px;
    margin: 0 0 6px 0;
  }
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

  @media (max-width: 1024px) {
    font-size: 16px;
    margin: 4px 0 8px 0;
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
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    padding: 10px 12px;
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

const CanvasWrapper = styled.div`
  width: 100%;
  transition: transform 0.3s ease-in-out;
  transform: ${props => props.$panelOpen ? `translateX(-${props.$slideDistance}px)` : 'translateX(0)'};

  @media (max-width: 768px) {
    transform: none;
  }
`;

const CanvasContainer = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 8px;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

const VerifyButtonContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const YesButton = styled.button`
  padding: 14px 40px;
  min-height: 56px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #10B981;
  cursor: pointer;
  background-color: ${props =>
    props.$isSelected ? '#10B981' : 'transparent'
  };
  color: ${props =>
    props.$isSelected ? 'white' : '#10B981'
  };
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #10B981;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 12px 32px;
  }
`;

const NoButton = styled.button`
  padding: 14px 40px;
  min-height: 56px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #EF4444;
  cursor: pointer;
  background-color: ${props =>
    props.$isSelected ? '#EF4444' : 'transparent'
  };
  color: ${props =>
    props.$isSelected ? 'white' : '#EF4444'
  };
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #EF4444;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 12px 32px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.$color || '#3B82F6'};
  color: #FFFFFF;
  transition: opacity 0.2s;
  min-height: 56px;
  margin-top: 12px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 1024px) {
    padding: 12px 24px;
    font-size: 15px;
  }
`;

const InputLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 8px;
  text-align: center;
`;

const CoordinateDisplay = styled.div`
  width: 100%;
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.inputBackground || '#F3F4F6'};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 16px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FeedbackMessage = styled.div`
  width: 100%;
  padding: 12px;
  background-color: ${props => props.$isCorrect ? '#10B98110' : '#EF444410'};
  border: 2px solid ${props => props.$isCorrect ? '#10B981' : '#EF4444'};
  border-radius: 8px;
  color: ${props => props.$isCorrect ? '#10B981' : '#EF4444'};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-top: 12px;
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
