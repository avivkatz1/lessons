import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Line, Text, Group } from "react-konva";
import {
  useLessonState,
  useIsTouchDevice,
  useWindowDimensions,
  useKonvaTheme,
} from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Identify Equal Ratios" },
  2: { title: "Complete the Proportion" },
  3: { title: "Cross-Multiply Intro" },
  4: { title: "Solve Any Position" },
  5: { title: "Scale Factor Problems" },
  6: { title: "Proportion Word Problems" },
  7: { title: "Harder Proportions" },
  8: { title: "Mixed Word Problems" },
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

// ==================== COLORS ====================

const NUM_COLOR = "#3B82F6";
const CROSS_COLOR = "#EF4444";
const X_COLOR = "#10B981";

// ==================== CANVAS RENDERING ====================

function renderProportionCanvas(visualData, cw, ch, konvaTheme) {
  const { terms, xPosition, showCrossLines } = visualData;
  if (!terms || terms.length < 4) return null;

  const labels = terms.map((t, i) =>
    i === xPosition ? "?" : `${t}`
  );

  // Layout constants
  const midX = cw / 2;
  const fracSpacing = 120;
  const leftX = midX - fracSpacing;
  const rightX = midX + fracSpacing;
  const barY = ch / 2;
  const barW = 60;
  const numY = barY - 40;
  const denY = barY + 14;
  const fontSize = 32;

  const elements = [
    <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
  ];

  // Left fraction bar
  elements.push(
    <Line key="bar-l" points={[leftX - barW / 2, barY, leftX + barW / 2, barY]}
      stroke={konvaTheme.shapeStroke} strokeWidth={3} />
  );

  // Right fraction bar
  elements.push(
    <Line key="bar-r" points={[rightX - barW / 2, barY, rightX + barW / 2, barY]}
      stroke={konvaTheme.shapeStroke} strokeWidth={3} />
  );

  // Equals sign
  elements.push(
    <Line key="eq1" points={[midX - 12, barY - 6, midX + 12, barY - 6]}
      stroke={konvaTheme.shapeStroke} strokeWidth={3} />,
    <Line key="eq2" points={[midX - 12, barY + 6, midX + 12, barY + 6]}
      stroke={konvaTheme.shapeStroke} strokeWidth={3} />
  );

  // Numbers / "?"
  const positions = [
    { x: leftX, y: numY },   // a (top-left)
    { x: leftX, y: denY },   // b (bottom-left)
    { x: rightX, y: numY },  // c (top-right)
    { x: rightX, y: denY },  // d (bottom-right)
  ];

  positions.forEach((pos, i) => {
    const isX = i === xPosition;
    const txt = labels[i];
    const color = isX ? X_COLOR : NUM_COLOR;
    const fSize = isX ? fontSize + 4 : fontSize;
    elements.push(
      <Text key={`t${i}`} x={pos.x - 30} y={pos.y} width={60}
        text={txt} fontSize={fSize} fontStyle="bold"
        fill={color} align="center" />
    );
  });

  // Cross-multiplication lines (level 3)
  if (showCrossLines) {
    // Top-left to bottom-right
    elements.push(
      <Line key="cross1"
        points={[leftX, numY + 16, rightX, denY + 8]}
        stroke={CROSS_COLOR} strokeWidth={2} dash={[8, 5]} opacity={0.6} />
    );
    // Bottom-left to top-right
    elements.push(
      <Line key="cross2"
        points={[leftX, denY + 8, rightX, numY + 16]}
        stroke={CROSS_COLOR} strokeWidth={2} dash={[8, 5]} opacity={0.6} />
    );
    // "Cross-multiply!" label
    elements.push(
      <Text key="crossLabel" x={midX - 60} y={ch - 30} width={120}
        text="Cross-multiply!" fontSize={14} fontStyle="bold"
        fill={CROSS_COLOR} align="center" />
    );
  }

  return (
    <Stage width={cw} height={ch}>
      <Layer>{elements}</Layer>
    </Stage>
  );
}

// ==================== LEVEL 3 INTERACTIVE CANVAS ====================

const SNAP_DISTANCE = 40;
const TILE_W = 54;
const TILE_H = 38;
const TILE_R = 8;

function Level3Canvas({ visualData, cw, ch, konvaTheme, isTouchDevice, crossStep, setCrossStep, crossDir, setCrossDir }) {
  const { terms } = visualData;
  if (!terms || terms.length < 4) return null;

  const [a, b, c] = terms;
  const product = b * c;

  // Layout
  const midX = cw / 2;
  const fracSpacing = 120;
  const leftX = midX - fracSpacing;
  const rightX = midX + fracSpacing;
  const barY = 80;
  const barW = 60;
  const numY = barY - 40;
  const denY = barY + 14;
  const fontSize = 30;

  // Tile positions (top-left corner of tile at each slot)
  const tilePos = [
    { x: leftX - TILE_W / 2, y: numY - 2 },   // slot 0: a (top-left)
    { x: leftX - TILE_W / 2, y: denY + 2 },    // slot 1: b (bottom-left)
    { x: rightX - TILE_W / 2, y: numY - 2 },   // slot 2: c (top-right)
    { x: rightX - TILE_W / 2, y: denY + 2 },   // slot 3: x (bottom-right)
  ];

  const snapTolerance = isTouchDevice ? SNAP_DISTANCE + 15 : SNAP_DISTANCE;

  // Compute what each slot currently displays
  let slots = [`${a}`, `${b}`, `${c}`, "x"];
  if (crossStep >= 1 && crossDir === "down") {
    // a moved to x's slot → a slot becomes 1, x slot becomes "ax"
    slots = ["1", `${b}`, `${c}`, `${a}x`];
  } else if (crossStep >= 1 && crossDir === "up") {
    // x moved to a's slot → x slot becomes 1, a slot becomes "ax"
    slots = [`${a}x`, `${b}`, `${c}`, "1"];
  }

  // Which slots are draggable?
  // Step 0: diagonal A (slots 0 and 3 — a and x)
  // Step 1: diagonal B — direction depends on crossDir
  //   dir="down" → drag c (slot 2) toward b (slot 1)
  //   dir="up"   → drag b (slot 1) toward c (slot 2)
  let draggableSlots = [];
  if (crossStep === 0) {
    draggableSlots = [0, 3];
  } else if (crossStep === 1) {
    draggableSlots = crossDir === "down" ? [2] : [1];
  }

  // Drag target is always the diagonal opposite: slot i → slot (3-i)
  const handleDragEnd = (slot) => (e) => {
    const node = e.target;
    const target = tilePos[3 - slot];
    const dx = node.x() - target.x;
    const dy = node.y() - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < snapTolerance) {
      if (crossStep === 0) {
        setCrossDir(slot === 0 ? "down" : "up");
      }
      setCrossStep(crossStep + 1);
    } else {
      // Spring back
      node.position(tilePos[slot]);
      node.getLayer().batchDraw();
    }
  };

  const handleTap = (slot) => () => {
    if (crossStep === 0) {
      setCrossDir(slot === 0 ? "down" : "up");
    }
    setCrossStep(crossStep + 1);
  };

  const done = crossStep >= 2;

  const elements = [
    <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
  ];

  if (!done) {
    // ---- Show proportion with fraction bars ----

    // Fraction bars
    elements.push(
      <Line key="bar-l" points={[leftX - barW / 2, barY, leftX + barW / 2, barY]}
        stroke={konvaTheme.shapeStroke} strokeWidth={3} />,
      <Line key="bar-r" points={[rightX - barW / 2, barY, rightX + barW / 2, barY]}
        stroke={konvaTheme.shapeStroke} strokeWidth={3} />
    );

    // Equals sign
    elements.push(
      <Line key="eq1" points={[midX - 12, barY - 6, midX + 12, barY - 6]}
        stroke={konvaTheme.shapeStroke} strokeWidth={3} />,
      <Line key="eq2" points={[midX - 12, barY + 6, midX + 12, barY + 6]}
        stroke={konvaTheme.shapeStroke} strokeWidth={3} />
    );

    // Cross-multiplication dashed diagonal guides
    if (crossStep === 0) {
      // Diagonal A: top-left ↔ bottom-right
      elements.push(
        <Line key="diag-a"
          points={[leftX, numY + 16, rightX, denY + 8]}
          stroke={CROSS_COLOR} strokeWidth={2} dash={[8, 5]} opacity={0.5} />
      );
    } else if (crossStep === 1 && crossDir === "down") {
      // Diagonal B: top-right → bottom-left (c toward b)
      elements.push(
        <Line key="diag-b"
          points={[rightX, numY + 16, leftX, denY + 8]}
          stroke={CROSS_COLOR} strokeWidth={2} dash={[8, 5]} opacity={0.6} />
      );
    } else if (crossStep === 1 && crossDir === "up") {
      // Diagonal B: bottom-left → top-right (b toward c)
      elements.push(
        <Line key="diag-b"
          points={[leftX, denY + 8, rightX, numY + 16]}
          stroke={CROSS_COLOR} strokeWidth={2} dash={[8, 5]} opacity={0.6} />
      );
    }

    // Render each slot — draggable tiles or static text
    for (let i = 0; i < 4; i++) {
      const display = slots[i];
      const isDraggable = draggableSlots.includes(i);
      const isOne = display === "1";
      const hasX = display.includes("x");

      if (isDraggable) {
        // Draggable colored tile
        const bgColor = hasX ? X_COLOR : NUM_COLOR;
        elements.push(
          <Group key={`slot-${i}`}
            x={tilePos[i].x} y={tilePos[i].y}
            draggable
            onDragEnd={handleDragEnd(i)}
            onTap={handleTap(i)}
            onClick={handleTap(i)}
          >
            <Rect width={TILE_W} height={TILE_H} cornerRadius={TILE_R}
              fill={bgColor} opacity={0.9} shadowBlur={4} shadowOpacity={0.3} shadowOffsetY={2} />
            <Text x={0} y={7} width={TILE_W} height={TILE_H - 7}
              text={display} fontSize={fontSize - 6} fontStyle="bold" fill="#fff" align="center" />
          </Group>
        );
      } else {
        // Static text
        const color = isOne ? konvaTheme.shapeStroke : (hasX ? X_COLOR : NUM_COLOR);
        const opacity = isOne ? 0.4 : 1;
        const size = hasX ? fontSize + 2 : fontSize;
        elements.push(
          <Text key={`slot-${i}`} x={tilePos[i].x} y={tilePos[i].y + 7} width={TILE_W}
            text={display} fontSize={size} fontStyle="bold"
            fill={color} align="center" opacity={opacity} />
        );
      }
    }

    // Instruction label
    if (crossStep === 0) {
      elements.push(
        <Text key="inst" x={midX - 140} y={ch - 45} width={280}
          text="Drag a number to the opposite corner" fontSize={14} fontStyle="bold"
          fill={CROSS_COLOR} align="center" />
      );
    } else if (crossStep === 1) {
      const label = crossDir === "down" ? `${c}` : `${b}`;
      elements.push(
        <Text key="inst" x={midX - 140} y={ch - 45} width={280}
          text={`Now drag ${label} across`} fontSize={14} fontStyle="bold"
          fill={CROSS_COLOR} align="center" />
      );
    }
  } else {
    // ---- Fractions gone — show the equation ----
    const eqY = ch / 2 - 20;
    const eqText = crossDir === "down"
      ? `${product} = ${a}x`
      : `${a}x = ${product}`;
    elements.push(
      <Text key="eq-result" x={midX - 140} y={eqY} width={280}
        text={eqText} fontSize={36} fontStyle="bold"
        fill={konvaTheme.shapeStroke} align="center" />
    );
    elements.push(
      <Text key="eq-hint" x={midX - 100} y={eqY + 48} width={200}
        text="Now solve for x!" fontSize={15} fontStyle="bold"
        fill={X_COLOR} align="center" />
    );
  }

  return (
    <Stage width={cw} height={ch}>
      <Layer>{elements}</Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function ProportionsLesson({ triggerNewProblem }) {
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
  const [crossStep, setCrossStep] = useState(0);
  const [crossDir, setCrossDir] = useState(null); // "down" (a→x) or "up" (x→a)

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    xValue,
    wordProblem,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const educationalNote = currentProblem?.educationalNote || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  const canvasWidth = Math.min(windowWidth - 40, 500);
  const canvasHeight = level === 3 ? 280 : 180;

  // Reset on problem change
  const area = visualData.terms ? visualData.terms.join("-") : "";
  const problemKey = `${level}-${currentQuestionIndex}-${area}-${xValue}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setCrossStep(0);
    setCrossDir(null);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setCrossStep(0);
    setCrossDir(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  const handleChoiceClick = useCallback(
    (choice, idx) => {
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
    },
    [phase, shakingIdx, revealAnswer]
  );

  // Correct answer for AnswerInput levels
  const correctAnswer = useMemo(() => {
    if (level === 7 || level === 4) return `${xValue}`;
    if ([2, 3].includes(level)) return `${xValue}`;
    // Levels 5-6: answer from backend
    const ans = currentProblem?.answer;
    if (Array.isArray(ans)) return ans[0];
    return `${ans}`;
  }, [level, xValue, currentProblem]);

  if (!currentProblem?.visualData) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // ==================== RENDER ====================

  const isMCLevel = level === 1 || level === 8;
  const isInputLevel = level >= 2 && level <= 7;
  const hasCanvas = level >= 1 && level <= 4 && !wordProblem && visualData.terms;

  return (
    <Wrapper>
      {/* Hint Button */}
      {phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      {/* Level Header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>
      <InstructionText>{questionText}</InstructionText>

      {/* Canvas for levels 1-4 */}
      {hasCanvas && level === 3 && phase === "interact" && (
        <CanvasWrapper>
          <Level3Canvas
            visualData={visualData}
            cw={canvasWidth}
            ch={canvasHeight}
            konvaTheme={konvaTheme}
            isTouchDevice={isTouchDevice}
            crossStep={crossStep}
            setCrossStep={setCrossStep}
            crossDir={crossDir}
            setCrossDir={setCrossDir}
          />
        </CanvasWrapper>
      )}
      {hasCanvas && level !== 3 && (
        <CanvasWrapper>
          {renderProportionCanvas(visualData, canvasWidth, canvasHeight, konvaTheme)}
        </CanvasWrapper>
      )}

      {/* Level-specific formula hints */}
      {level === 2 && phase === "interact" && (
        <FormulaDisplay>
          <FormulaOp>Multiply top and bottom by the same number!</FormulaOp>
        </FormulaDisplay>
      )}

      {level === 3 && phase === "interact" && crossStep >= 2 && (
        <FormulaDisplay>
          <FormulaOp>a/b = c/d &rarr; a &times; d = b &times; c</FormulaOp>
        </FormulaDisplay>
      )}

      {/* MC levels (1 and 8) */}
      {isMCLevel && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;
              return (
                <ChoiceButton
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  $fadeOut={isFaded}
                  $isTouchDevice={isTouchDevice}
                  onClick={() => handleChoiceClick(choice, idx)}
                  disabled={selectedChoice !== null || isShaking}
                >
                  {choice.text}
                  {isCorrectSelected && " \u2713"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Input levels (2-7) — Level 3 only shows input after cross-multiply steps */}
      {isInputLevel && phase === "interact" && (level !== 3 || crossStep >= 2) && (
        <AnswerSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="number"
              onCorrect={() => {
                setPhase("complete");
                revealAnswer();
              }}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="x = ?"
            />
          </AnswerInputContainer>
        </AnswerSection>
      )}

      {/* Phase: Complete */}
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

export default ProportionsLesson;

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
  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const InstructionText = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 12px 0;
  max-width: 700px;
  line-height: 1.5;
  @media (min-width: 768px) {
    font-size: 18px;
  }
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

const FormulaOp = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
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

  ${(p) =>
    p.$correct &&
    css`
      background-color: ${p.theme.colors.buttonSuccess}20;
      border-color: ${p.theme.colors.buttonSuccess};
      color: ${p.theme.colors.buttonSuccess};
      cursor: default;
    `}

  ${(p) =>
    p.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
      background-color: ${p.theme.colors.danger || "#E53E3E"}15;
      border-color: ${p.theme.colors.danger || "#E53E3E"};
    `}

  ${(p) =>
    p.$fadeOut &&
    css`
      opacity: 0;
      transform: scale(0.95);
      pointer-events: none;
      transition: all 0.4s ease;
    `}

  &:disabled {
    cursor: default;
  }
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) =>
    p.$isWrong
      ? p.theme.colors.danger || "#E53E3E"
      : p.theme.colors.buttonSuccess};
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
  &:hover {
    opacity: 0.9;
  }
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
  &:hover {
    background: ${(p) => p.theme.colors.hoverBackground};
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
    padding: 5px 10px;
    font-size: 12px;
  }
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
