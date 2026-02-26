import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import {
  useLessonState,
  useIsTouchDevice,
  useWindowDimensions,
  useKonvaTheme,
} from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import TouchDragHandle from "../../../../shared/helpers/TouchDragHandle";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Make the Target Area" },
  2: { title: "Count the Squares" },
  3: { title: "Area of Rectangles" },
  4: { title: "Area of Triangles" },
  5: { title: "Rectangles & Triangles" },
  6: { title: "Trapezoids" },
  7: { title: "Parallelograms" },
  8: { title: "All Shapes" },
  9: { title: "Word Problems" },
};

// ==================== ANIMATIONS ====================

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
`;

const fadeInAnim = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== CONSTANTS ====================

const GRID_CELL = 40;
const GRID_ORIGIN_X = 40;
const GRID_ORIGIN_Y = 30;
const SHAPE_COLOR = "#3B82F6";
const FILL_COLOR = "#3B82F620";
const TRIANGLE_COLOR = "#10B981";
const TRIANGLE_FILL = "#10B98120";
const TRAP_COLOR = "#8B5CF6";
const TRAP_FILL = "#8B5CF620";
const PARA_COLOR = "#F59E0B";
const PARA_FILL = "#F59E0B20";

// ==================== LEVEL 1: MAKE THE TARGET AREA ====================

function ExploreLevel({ konvaTheme, canvasWidth, canvasHeight, targetArea, onTryAnother }) {
  const maxCols = Math.floor((canvasWidth - GRID_ORIGIN_X - 20) / GRID_CELL);
  const maxRows = Math.floor((canvasHeight - GRID_ORIGIN_Y - 50) / GRID_CELL);

  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [solved, setSolved] = useState(false);

  const area = cols * rows;
  const isMatch = area === targetArea;

  const handleDrag = (e) => {
    if (solved) return;
    const x = e.target.x();
    const y = e.target.y();
    const newCols = Math.max(1, Math.min(maxCols, Math.round((x - GRID_ORIGIN_X) / GRID_CELL)));
    const newRows = Math.max(1, Math.min(maxRows, Math.round((y - GRID_ORIGIN_Y) / GRID_CELL)));
    setCols(newCols);
    setRows(newRows);
    e.target.x(GRID_ORIGIN_X + newCols * GRID_CELL);
    e.target.y(GRID_ORIGIN_Y + newRows * GRID_CELL);

    if (newCols * newRows === targetArea) {
      setSolved(true);
    }
  };

  // Grid lines
  const gridLines = [];
  for (let c = 0; c <= maxCols; c++) {
    gridLines.push(
      <Line key={`vc-${c}`} points={[GRID_ORIGIN_X + c * GRID_CELL, GRID_ORIGIN_Y, GRID_ORIGIN_X + c * GRID_CELL, GRID_ORIGIN_Y + maxRows * GRID_CELL]} stroke={konvaTheme.shapeStroke} strokeWidth={0.5} opacity={0.2} />
    );
  }
  for (let r = 0; r <= maxRows; r++) {
    gridLines.push(
      <Line key={`hr-${r}`} points={[GRID_ORIGIN_X, GRID_ORIGIN_Y + r * GRID_CELL, GRID_ORIGIN_X + maxCols * GRID_CELL, GRID_ORIGIN_Y + r * GRID_CELL]} stroke={konvaTheme.shapeStroke} strokeWidth={0.5} opacity={0.2} />
    );
  }

  // Filled cells
  const filledCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      filledCells.push(
        <Rect key={`cell-${r}-${c}`} x={GRID_ORIGIN_X + c * GRID_CELL + 1} y={GRID_ORIGIN_Y + r * GRID_CELL + 1} width={GRID_CELL - 2} height={GRID_CELL - 2} fill={isMatch ? "#48BB7830" : FILL_COLOR} />
      );
    }
  }

  const rectW = cols * GRID_CELL;
  const rectH = rows * GRID_CELL;

  return (
    <>
      <CanvasWrapper>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            {gridLines}
            {filledCells}
            <Rect x={GRID_ORIGIN_X} y={GRID_ORIGIN_Y} width={rectW} height={rectH} stroke={isMatch ? "#48BB78" : SHAPE_COLOR} strokeWidth={3} />
            <Text x={GRID_ORIGIN_X} y={GRID_ORIGIN_Y - 22} width={rectW} text={`${cols}`} fontSize={18} fontStyle="bold" fill={SHAPE_COLOR} align="center" />
            <Text x={GRID_ORIGIN_X - 28} y={GRID_ORIGIN_Y + rectH / 2 - 10} text={`${rows}`} fontSize={18} fontStyle="bold" fill={SHAPE_COLOR} />
            <Text x={GRID_ORIGIN_X} y={GRID_ORIGIN_Y + rectH / 2 - 14} width={rectW} text={`${area} sq`} fontSize={22} fontStyle="bold" fill={isMatch ? "#48BB78" : SHAPE_COLOR} align="center" />
            {!solved && (
              <TouchDragHandle
                id="resize-handle"
                x={GRID_ORIGIN_X + cols * GRID_CELL}
                y={GRID_ORIGIN_Y + rows * GRID_CELL}
                radius={12}
                fill="#EF4444"
                stroke="#EF4444"
                strokeWidth={3}
                onDragMove={handleDrag}
                affordanceColor="#EF4444"
                dragBoundFunc={(pos) => ({
                  x: Math.max(GRID_ORIGIN_X + GRID_CELL, Math.min(pos.x, GRID_ORIGIN_X + maxCols * GRID_CELL)),
                  y: Math.max(GRID_ORIGIN_Y + GRID_CELL, Math.min(pos.y, GRID_ORIGIN_Y + maxRows * GRID_CELL)),
                })}
              />
            )}
          </Layer>
        </Stage>
      </CanvasWrapper>

      {/* Formula display */}
      <FormulaDisplay>
        <FormulaValue $color={SHAPE_COLOR}>{cols}</FormulaValue>
        <FormulaOp>&times;</FormulaOp>
        <FormulaValue $color={SHAPE_COLOR}>{rows}</FormulaValue>
        <FormulaOp>=</FormulaOp>
        <FormulaTotal $match={isMatch}>{area} sq units</FormulaTotal>
        <FormulaOp>&nbsp;&nbsp;Target:</FormulaOp>
        <FormulaTotal $match={false}>{targetArea}</FormulaTotal>
      </FormulaDisplay>

      {solved && (
        <CompleteSection>
          <CompleteTitle>You made it!</CompleteTitle>
          <ExplanationDetail>{cols} &times; {rows} = {area} square units</ExplanationDetail>
          <EducationalNote>Area measures the space inside a shape. We measure it in square units.</EducationalNote>
          <TryAnotherButton onClick={() => {
            setSolved(false);
            setCols(3);
            setRows(2);
            if (onTryAnother) onTryAnother();
          }}>Try Another</TryAnotherButton>
        </CompleteSection>
      )}

      {!solved && (
        <ExplanationSection>
          <ExplanationDetail>
            Drag the <strong style={{ color: "#EF4444" }}>red handle</strong> to resize the rectangle until its area equals <strong>{targetArea}</strong> square units.
          </ExplanationDetail>
        </ExplanationSection>
      )}
    </>
  );
}

// ==================== SHAPE DRAWING HELPERS ====================

/** Draw a rectangle on canvas, return positioning info */
function calcRect(length, width, canvasWidth, canvasHeight) {
  const maxW = canvasWidth - 120;
  const maxH = canvasHeight - 80;
  const scale = Math.min(maxW / length, maxH / width, 30);
  const rectW = length * scale;
  const rectH = width * scale;
  const originX = (canvasWidth - rectW) / 2;
  const originY = (canvasHeight - rectH) / 2;
  return { originX, originY, rectW, rectH };
}

/** Draw a triangle (returns vertex positions) */
function calcTriangle(base, height, canvasWidth, canvasHeight) {
  const maxW = canvasWidth - 100;
  const maxH = canvasHeight - 80;
  const scale = Math.min(maxW / base, maxH / height, 30);
  const triW = base * scale;
  const triH = height * scale;
  const originX = (canvasWidth - triW) / 2;
  const originY = (canvasHeight + triH) / 2;
  const apexX = originX + triW * 0.4;
  const apexY = originY - triH;
  return { originX, originY, triW, triH, apexX, apexY };
}

// ==================== MAIN COMPONENT ====================

function Area({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { isTouchDevice } = useIsTouchDevice();
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    width: shapeWidth,
    height: shapeHeight,
    length: shapeLength,
    base,
    base1,
    base2,
    slant,
    area,
    rectArea,
    targetArea,
    choices = [],
    educationalNote = "",
    shapeType,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  const canvasWidth = Math.min(windowWidth - 40, 600);
  const canvasHeight = level === 1 ? 320 : 280;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${area}-${targetArea}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  const handleChoiceClick = useCallback((choice, idx) => {
    if (phase !== "interact" || shakingIdx !== null) return;
    if (choice.correct) {
      setSelectedChoice(idx);
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 800);
    } else {
      setShakingIdx(idx);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => setShakingIdx(null), 600);
    }
  }, [phase, shakingIdx, revealAnswer]);

  const correctAnswer = useMemo(() => {
    if ([3, 4, 5, 6, 7, 8].includes(level)) return `${area}`;
    return "";
  }, [level, area]);

  // ==================== RENDER ====================

  // Level 1: Make the Target Area
  if (level === 1) {
    return (
      <Wrapper>
        <LevelHeader>
          <LevelBadge>Level 1</LevelBadge>
          <LevelTitle>{levelInfo.title}</LevelTitle>
        </LevelHeader>
        <InstructionText>{questionText}</InstructionText>
        <ExploreLevel
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          targetArea={targetArea || 12}
          onTryAnother={handleTryAnother}
        />
      </Wrapper>
    );
  }

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  // Grid drawing for Level 2
  const drawRectGrid = (w, h) => {
    const cellSize = Math.min(GRID_CELL, Math.floor((canvasWidth - 100) / Math.max(w, 1)), Math.floor((canvasHeight - 80) / Math.max(h, 1)));
    const originX = (canvasWidth - w * cellSize) / 2;
    const originY = (canvasHeight - h * cellSize) / 2;
    const lines = [];
    for (let c = 0; c <= w; c++) {
      lines.push(<Line key={`vc-${c}`} points={[originX + c * cellSize, originY, originX + c * cellSize, originY + h * cellSize]} stroke={konvaTheme.shapeStroke} strokeWidth={c === 0 || c === w ? 0 : 0.5} opacity={0.3} />);
    }
    for (let r = 0; r <= h; r++) {
      lines.push(<Line key={`hr-${r}`} points={[originX, originY + r * cellSize, originX + w * cellSize, originY + r * cellSize]} stroke={konvaTheme.shapeStroke} strokeWidth={r === 0 || r === h ? 0 : 0.5} opacity={0.3} />);
    }
    const cells = [];
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        cells.push(<Rect key={`cell-${r}-${c}`} x={originX + c * cellSize + 1} y={originY + r * cellSize + 1} width={cellSize - 2} height={cellSize - 2} fill={FILL_COLOR} />);
      }
    }
    return { lines, cells, originX, originY, cellSize };
  };

  // Render shape canvas for Levels 3-8
  const renderShapeCanvas = () => {
    const st = shapeType;

    if (st === "rectangle" || (!st && shapeLength)) {
      const l = shapeLength || 8;
      const w = shapeWidth || 5;
      const { originX, originY, rectW, rectH } = calcRect(l, w, canvasWidth, canvasHeight);
      const showFormula = level <= 3;
      return (
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            <Rect x={originX} y={originY} width={rectW} height={rectH} fill={FILL_COLOR} stroke={SHAPE_COLOR} strokeWidth={3} />
            <Text x={originX} y={originY + rectH + 10} width={rectW} text={`${l} cm`} fontSize={18} fontStyle="bold" fill={SHAPE_COLOR} align="center" />
            <Text x={originX + rectW + 10} y={originY + rectH / 2 - 10} text={`${w} cm`} fontSize={18} fontStyle="bold" fill={SHAPE_COLOR} />
            {showFormula && (
              <Text x={originX} y={originY + rectH / 2 - 16} width={rectW} text="? cm²" fontSize={26} fontStyle="bold" fill="#EF4444" align="center" />
            )}
          </Layer>
        </Stage>
      );
    }

    if (st === "triangle_from_rect") {
      // Level 4: rectangle cut in half
      const b = base || 8;
      const h = shapeHeight || 6;
      const { originX, originY, rectW, rectH } = calcRect(b, h, canvasWidth, canvasHeight);
      return (
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            {/* Full rectangle (dashed) */}
            <Rect x={originX} y={originY} width={rectW} height={rectH} stroke={konvaTheme.shapeStroke} strokeWidth={2} dash={[6, 4]} opacity={0.4} />
            {/* Diagonal line */}
            <Line points={[originX, originY, originX + rectW, originY + rectH]} stroke={konvaTheme.shapeStroke} strokeWidth={2} dash={[6, 4]} opacity={0.5} />
            {/* Triangle (bottom-left half) */}
            <Line points={[originX, originY, originX + rectW, originY + rectH, originX, originY + rectH]} closed fill={TRIANGLE_FILL} stroke={TRIANGLE_COLOR} strokeWidth={3} />
            {/* Labels */}
            <Text x={originX} y={originY + rectH + 10} width={rectW} text={`${b} cm`} fontSize={18} fontStyle="bold" fill={TRIANGLE_COLOR} align="center" />
            <Text x={originX - 35} y={originY + rectH / 2 - 10} text={`${h} cm`} fontSize={18} fontStyle="bold" fill={TRIANGLE_COLOR} />
            {/* "½" label on the triangle */}
            <Text x={originX + rectW * 0.15} y={originY + rectH * 0.6} text="½" fontSize={30} fontStyle="bold" fill={TRIANGLE_COLOR} opacity={0.6} />
          </Layer>
        </Stage>
      );
    }

    if (st === "triangle") {
      const b = base || 8;
      const h = shapeHeight || 6;
      const tri = calcTriangle(b, h, canvasWidth, canvasHeight);
      const showFormula = level <= 4;
      return (
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            <Line points={[tri.originX, tri.originY, tri.originX + tri.triW, tri.originY, tri.apexX, tri.apexY]} closed fill={TRIANGLE_FILL} stroke={TRIANGLE_COLOR} strokeWidth={3} />
            <Line points={[tri.apexX, tri.apexY, tri.apexX, tri.originY]} stroke="#EF4444" strokeWidth={2} dash={[6, 4]} />
            <Text x={tri.originX} y={tri.originY + 10} width={tri.triW} text={`${b} cm`} fontSize={18} fontStyle="bold" fill={TRIANGLE_COLOR} align="center" />
            <Text x={tri.apexX + 8} y={tri.apexY + tri.triH / 2 - 10} text={`${h} cm`} fontSize={18} fontStyle="bold" fill="#EF4444" />
            {showFormula && (
              <Text x={tri.originX} y={tri.originY - tri.triH * 0.45} width={tri.triW} text="? cm²" fontSize={24} fontStyle="bold" fill="#EF4444" align="center" />
            )}
          </Layer>
        </Stage>
      );
    }

    if (st === "trapezoid") {
      const b1 = base1 || 5;
      const b2 = base2 || 10;
      const h = shapeHeight || 6;
      const maxB = Math.max(b1, b2);
      const maxW = canvasWidth - 120;
      const maxH = canvasHeight - 80;
      const scale = Math.min(maxW / maxB, maxH / h, 25);
      const trapW1 = b1 * scale;
      const trapW2 = b2 * scale;
      const trapH = h * scale;
      const cx = canvasWidth / 2;
      const bottomY = (canvasHeight + trapH) / 2;
      const topY = bottomY - trapH;
      // Bottom edge centered
      const blX = cx - trapW2 / 2;
      const brX = cx + trapW2 / 2;
      // Top edge centered
      const tlX = cx - trapW1 / 2;
      const trX = cx + trapW1 / 2;

      const showSplit = level === 6;

      return (
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            {/* Trapezoid fill */}
            <Line points={[tlX, topY, trX, topY, brX, bottomY, blX, bottomY]} closed fill={TRAP_FILL} stroke={TRAP_COLOR} strokeWidth={3} />
            {/* Split diagonal (Level 6 only) */}
            {showSplit && (
              <Line points={[tlX, topY, brX, bottomY]} stroke={TRAP_COLOR} strokeWidth={2} dash={[8, 5]} opacity={0.7} />
            )}
            {/* Height dashed line */}
            <Line points={[tlX, topY, tlX, bottomY]} stroke="#EF4444" strokeWidth={2} dash={[6, 4]} />
            {/* Labels */}
            <Text x={tlX} y={topY - 22} width={trX - tlX} text={`${b1} cm`} fontSize={16} fontStyle="bold" fill={TRAP_COLOR} align="center" />
            <Text x={blX} y={bottomY + 8} width={brX - blX} text={`${b2} cm`} fontSize={16} fontStyle="bold" fill={TRAP_COLOR} align="center" />
            <Text x={tlX - 40} y={topY + trapH / 2 - 10} text={`${h} cm`} fontSize={16} fontStyle="bold" fill="#EF4444" />
          </Layer>
        </Stage>
      );
    }

    if (st === "parallelogram") {
      const b = base || 8;
      const h = shapeHeight || 6;
      const sl = slant || h + 2;
      const maxW = canvasWidth - 120;
      const maxH = canvasHeight - 80;
      const offset = Math.min(h * 0.6, 3); // visual skew in grid units
      const scale = Math.min(maxW / (b + offset), maxH / h, 25);
      const paraW = b * scale;
      const paraH = h * scale;
      const skew = offset * scale;
      const cx = canvasWidth / 2;
      const bottomY = (canvasHeight + paraH) / 2;
      const topY = bottomY - paraH;
      const blX = cx - paraW / 2;
      const brX = blX + paraW;
      const tlX = blX + skew;
      const trX = brX + skew;

      return (
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            <Line points={[tlX, topY, trX, topY, brX, bottomY, blX, bottomY]} closed fill={PARA_FILL} stroke={PARA_COLOR} strokeWidth={3} />
            {/* Height dashed line */}
            <Line points={[tlX, topY, tlX, bottomY]} stroke="#EF4444" strokeWidth={2} dash={[6, 4]} />
            {/* Base label */}
            <Text x={blX} y={bottomY + 8} width={paraW} text={`${b} cm`} fontSize={18} fontStyle="bold" fill={PARA_COLOR} align="center" />
            {/* Height label */}
            <Text x={tlX - 40} y={topY + paraH / 2 - 10} text={`${h} cm`} fontSize={16} fontStyle="bold" fill="#EF4444" />
            {/* Slant label on left side */}
            <Text x={blX - 15} y={topY + paraH / 2 - 10} text={`${sl} cm`} fontSize={14} fill={konvaTheme.labelText} opacity={0.5} />
          </Layer>
        </Stage>
      );
    }

    return null;
  };

  return (
    <Wrapper>
      {/* Hint Button */}
      {phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level Header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>
      <InstructionText>{questionText}</InstructionText>

      {/* ===== Level 2: Count the Squares (MC) ===== */}
      {level === 2 && (
        <>
          <CanvasWrapper>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
                {(() => {
                  const w = shapeWidth || 4;
                  const h = shapeHeight || 3;
                  const { lines, cells, originX, originY, cellSize } = drawRectGrid(w, h);
                  const rW = w * cellSize;
                  const rH = h * cellSize;
                  return (
                    <>
                      {cells}{lines}
                      <Rect x={originX} y={originY} width={rW} height={rH} stroke={SHAPE_COLOR} strokeWidth={3} />
                      <Text x={originX} y={originY + rH + 8} width={rW} text={`${w}`} fontSize={18} fontStyle="bold" fill={SHAPE_COLOR} align="center" />
                      <Text x={originX - 28} y={originY + rH / 2 - 10} text={`${h}`} fontSize={18} fontStyle="bold" fill={SHAPE_COLOR} />
                    </>
                  );
                })()}
              </Layer>
            </Stage>
          </CanvasWrapper>
          {phase === "interact" && choices.length > 0 && (
            <ChooseSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
              {wrongAttempts > 0 && shakingIdx === null && <FeedbackText $isWrong>Not quite — try again!</FeedbackText>}
              <ChoiceGrid>
                {choices.map((choice, idx) => {
                  const isSelected = selectedChoice === idx;
                  const isCorrectSelected = isSelected && choice.correct;
                  const isShaking = shakingIdx === idx;
                  const isFaded = selectedChoice !== null && !isSelected;
                  return (
                    <ChoiceButton key={idx} $correct={isCorrectSelected} $wrong={isShaking} $fadeOut={isFaded} $isTouchDevice={isTouchDevice} onClick={() => handleChoiceClick(choice, idx)} disabled={selectedChoice !== null || isShaking}>
                      {choice.text}{isCorrectSelected && " ✓"}
                    </ChoiceButton>
                  );
                })}
              </ChoiceGrid>
            </ChooseSection>
          )}
        </>
      )}

      {/* ===== Levels 3-8: Shape Canvas + Answer Input ===== */}
      {level >= 3 && level <= 8 && (
        <>
          <CanvasWrapper>
            {renderShapeCanvas()}
          </CanvasWrapper>

          {level === 4 && phase === "interact" && (
            <FormulaDisplay>
              <FormulaOp>Rectangle area:</FormulaOp>
              <FormulaValue $color={TRIANGLE_COLOR}>{base} &times; {shapeHeight} = {rectArea}</FormulaValue>
              <FormulaOp>&rarr; Triangle = half &rarr;</FormulaOp>
              <FormulaTotal $match={false}>?</FormulaTotal>
            </FormulaDisplay>
          )}

          {level === 6 && phase === "interact" && (
            <FormulaDisplay>
              <FormulaOp>Split into two triangles — find each area and add!</FormulaOp>
            </FormulaDisplay>
          )}

          {level === 7 && phase === "interact" && (
            <FormulaDisplay>
              <FormulaOp>Area = base &times; height (not the slanted side!)</FormulaOp>
            </FormulaDisplay>
          )}

          {phase === "interact" && (
            <AnswerSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
              <AnswerInputContainer>
                <AnswerInput
                  correctAnswer={correctAnswer}
                  answerType="number"
                  onCorrect={() => { setPhase("complete"); revealAnswer(); }}
                  onTryAnother={handleTryAnother}
                  disabled={showAnswer}
                  placeholder="Area = ?"
                />
              </AnswerInputContainer>
            </AnswerSection>
          )}
        </>
      )}

      {/* ===== Level 9: Word Problems (MC) ===== */}
      {level === 9 && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && <FeedbackText $isWrong>Not quite — try again!</FeedbackText>}
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;
              return (
                <ChoiceButton key={idx} $correct={isCorrectSelected} $wrong={isShaking} $fadeOut={isFaded} $isTouchDevice={isTouchDevice} onClick={() => handleChoiceClick(choice, idx)} disabled={selectedChoice !== null || isShaking}>
                  {choice.text}{isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* ===== Phase: Complete ===== */}
      {phase === "complete" && (
        <CompleteSection>
          <CompleteTitle>Correct!</CompleteTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>Try Another</TryAnotherButton>
        </CompleteSection>
      )}
    </Wrapper>
  );
}

export default Area;

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
  @media (min-width: 768px) { padding: 30px; }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textSecondary};
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
  background-color: ${(p) => p.theme.colors.buttonSuccess};
  color: ${(p) => p.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textPrimary};
  margin: 0;
  @media (min-width: 768px) { font-size: 22px; }
`;

const InstructionText = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 12px 0;
  max-width: 700px;
  line-height: 1.5;
  @media (min-width: 768px) { font-size: 18px; }
`;

const CanvasWrapper = styled.div`
  margin: 8px 0 20px 0;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
`;

const FormulaDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const FormulaValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${(p) => p.$color};
  font-family: "Georgia", serif;
`;

const FormulaOp = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const FormulaTotal = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: ${(p) => p.$match ? "#48BB78" : p.theme.colors.textPrimary};
  font-family: "Georgia", serif;
`;

const ChooseSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: ${(p) => (p.$isTouchDevice ? "16px 20px" : "13px 20px")};
  font-size: ${(p) => (p.$isTouchDevice ? "17px" : "16px")};
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(p) => p.theme.colors.border};
  background-color: ${(p) => p.theme.colors.cardBackground};
  color: ${(p) => p.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: ${(p) => p.theme.colors.hoverBackground};
    border-color: ${(p) => p.theme.colors.info || "#3B82F6"};
  }

  ${(p) => p.$correct && css`
    background-color: ${p.theme.colors.buttonSuccess}20;
    border-color: ${p.theme.colors.buttonSuccess};
    color: ${p.theme.colors.buttonSuccess};
    cursor: default;
  `}

  ${(p) => p.$wrong && css`
    animation: ${shakeAnim} 0.5s ease;
    background-color: ${p.theme.colors.danger || "#E53E3E"}15;
    border-color: ${p.theme.colors.danger || "#E53E3E"};
  `}

  ${(p) => p.$fadeOut && css`
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
    transition: all 0.4s ease;
  `}

  &:disabled { cursor: default; }
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.$isWrong ? (p.theme.colors.danger || "#E53E3E") : p.theme.colors.buttonSuccess};
  margin: 0;
`;

const AnswerSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const AnswerInputContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const CompleteSection = styled.div`
  width: 100%;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInAnim} 0.4s ease;
`;

const CompleteTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.buttonSuccess};
  margin: 0;
`;

const EducationalNote = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textPrimary};
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
`;

const ExplanationDetail = styled.p`
  font-size: 15px;
  color: ${(p) => p.theme.colors.textSecondary};
  text-align: center;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
`;

const TryAnotherButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(p) => p.theme.colors.buttonSuccess};
  color: ${(p) => p.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;
  &:hover { opacity: 0.9; }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border-left: 4px solid ${(p) => p.theme.colors.buttonSuccess};
  border-radius: 8px;
  padding: 20px;
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  &:hover { background: ${(p) => p.theme.colors.hoverBackground}; }
  @media (max-width: 1024px) { top: 12px; right: 16px; padding: 6px 12px; font-size: 13px; }
  @media (max-width: 768px) { top: 10px; right: 12px; padding: 5px 10px; font-size: 12px; }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border-left: 4px solid ${(p) => p.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(p) => p.theme.colors.textPrimary};
`;
