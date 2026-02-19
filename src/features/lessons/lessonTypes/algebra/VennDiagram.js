import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useWindowDimensions, useKonvaTheme, useIsTouchDevice } from "../../../../hooks";
import { useLessonState } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import styled from "styled-components";
import { Stage, Layer, Circle, Text, Rect, Group } from "react-konva";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Venn Diagrams", instruction: "Drag each item to the correct region, then check your answer." },
  2: { title: "Trickier Overlaps", instruction: "Drag each item to the correct region. Some zones may have multiple items." },
  3: { title: "Reading Venn Diagrams", instruction: "Look at the diagram and answer the question." },
  4: { title: "3-Circle Venn Diagrams", instruction: "Drag each item to the correct region of the 3-circle diagram." },
  5: { title: "Set Notation", instruction: "Use set notation to answer the question about the diagram." },
};

const CIRCLE_COLORS = { A: "#EF4444", B: "#3B82F6", C: "#10B981" };

// ==================== GEOMETRY HELPERS ====================

function distSq(px, py, cx, cy) {
  return (px - cx) ** 2 + (py - cy) ** 2;
}

function isInCircle(px, py, cx, cy, r, tolerance = 0) {
  return distSq(px, py, cx, cy) <= (r + tolerance) * (r + tolerance);
}

// tolerance = extra pixels added to each circle's radius for detection,
// so a chip only *mostly* inside the zone still registers correctly.
// Base value for desktop; touch devices use a larger value (set inside the component).
const ZONE_TOLERANCE_DEFAULT = 18;

function detectZone2(px, py, leftC, rightC, tolerance = ZONE_TOLERANCE_DEFAULT) {
  const inLeft = isInCircle(px, py, leftC.x, leftC.y, leftC.r, tolerance);
  const inRight = isInCircle(px, py, rightC.x, rightC.y, rightC.r, tolerance);
  if (inLeft && inRight) return "center";
  if (inLeft) return "left";
  if (inRight) return "right";
  return "outside";
}

function detectZone3(px, py, cA, cB, cC, tolerance = ZONE_TOLERANCE_DEFAULT) {
  const inA = isInCircle(px, py, cA.x, cA.y, cA.r, tolerance);
  const inB = isInCircle(px, py, cB.x, cB.y, cB.r, tolerance);
  const inC = isInCircle(px, py, cC.x, cC.y, cC.r, tolerance);
  if (inA && inB && inC) return "abc";
  if (inA && inB) return "ab";
  if (inA && inC) return "ac";
  if (inB && inC) return "bc";
  if (inA) return "a";
  if (inB) return "b";
  if (inC) return "c";
  return "outside";
}

// Get snap positions for items in a given zone (so multiple items don't overlap)
function getZoneCenter2(zone, leftC, rightC) {
  const midX = (leftC.x + rightC.x) / 2;
  switch (zone) {
    case "left": return { x: leftC.x - leftC.r * 0.35, y: leftC.y };
    case "right": return { x: rightC.x + rightC.r * 0.35, y: rightC.y };
    case "center": return { x: midX, y: leftC.y };
    case "outside": return { x: midX, y: leftC.y + leftC.r + 30 };
    default: return { x: 0, y: 0 };
  }
}

function getZoneCenter3(zone, cA, cB, cC) {
  switch (zone) {
    case "a": return { x: cA.x, y: cA.y - cA.r * 0.4 };
    case "b": return { x: cB.x - cB.r * 0.35, y: cB.y + cB.r * 0.25 };
    case "c": return { x: cC.x + cC.r * 0.35, y: cC.y + cC.r * 0.25 };
    case "ab": return { x: (cA.x + cB.x) / 2 - 15, y: (cA.y + cB.y) / 2 };
    case "ac": return { x: (cA.x + cC.x) / 2 + 15, y: (cA.y + cC.y) / 2 };
    case "bc": return { x: (cB.x + cC.x) / 2, y: (cB.y + cC.y) / 2 + 15 };
    case "abc": return { x: (cA.x + cB.x + cC.x) / 3, y: (cA.y + cB.y + cC.y) / 3 };
    case "outside": return { x: (cA.x + cB.x + cC.x) / 3, y: cB.y + cB.r + 30 };
    default: return { x: 0, y: 0 };
  }
}

// Get static item positions for pre-filled diagrams (L3/L5)
function getStaticPositions(items, circleLayout, numCircles) {
  const zoneItems = {};
  items.forEach((item) => {
    const z = item.zone;
    if (!zoneItems[z]) zoneItems[z] = [];
    zoneItems[z].push(item.name);
  });

  const positions = {};
  Object.entries(zoneItems).forEach(([zone, names]) => {
    const center =
      numCircles === 3
        ? getZoneCenter3(zone, circleLayout.a, circleLayout.b, circleLayout.c)
        : getZoneCenter2(zone, circleLayout.left, circleLayout.right);

    if (zone === "outside") {
      // Lay out horizontally in a row
      const spacing = 100;
      names.forEach((name, i) => {
        const xOffset = (i - (names.length - 1) / 2) * spacing;
        positions[name] = { x: center.x + xOffset, y: center.y };
      });
    } else {
      names.forEach((name, i) => {
        const yOffset = (i - (names.length - 1) / 2) * 28;
        positions[name] = { x: center.x, y: center.y + yOffset };
      });
    }
  });

  return positions;
}

// ==================== MAIN COMPONENT ====================

function VennDiagram({ triggerNewProblem }) {
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
  const { isTouchDevice } = useIsTouchDevice();
  const zoneTolerance = isTouchDevice ? 30 : ZONE_TOLERANCE_DEFAULT;

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level,
    mode,
    circles: numCircles,
    categoryA,
    categoryB,
    categoryC,
    items,
    questionText,
  } = visualData;
  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";

  // Interactive state (drag levels)
  const [itemPlacements, setItemPlacements] = useState({});
  const [checkResults, setCheckResults] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset on problem change
  useEffect(() => {
    setItemPlacements({});
    setCheckResults(null);
    setIsComplete(false);
    setShowHint(false);
  }, [currentProblem]);

  // Layout
  const canvasWidth = Math.min(width - 40, 800);
  const canvasHeight = numCircles === 3 ? 480 : 420;
  const scale = canvasWidth / 800;

  const circleLayout = useMemo(() => {
    if (numCircles === 3) {
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2 - 10;
      const r = 130 * scale;
      const d = 80 * scale;
      return {
        a: { x: cx, y: cy - d, r },
        b: { x: cx - d * 0.866, y: cy + d * 0.5, r },
        c: { x: cx + d * 0.866, y: cy + d * 0.5, r },
      };
    }
    return {
      left: { x: 270 * scale, y: 210 * scale, r: 150 * scale },
      right: { x: 430 * scale, y: 210 * scale, r: 150 * scale },
    };
  }, [numCircles, scale, canvasWidth, canvasHeight]);

  // Word bank position (right side of canvas)
  const wordBankX = canvasWidth - 120 * scale;
  const wordBankStartY = 30 * scale;

  // Answer checking
  const handleCheckAnswer = useCallback(() => {
    if (!items) return;
    const results = { correct: [], wrong: [] };

    items.forEach((item) => {
      const placement = itemPlacements[item.name];
      if (!placement || !placement.detectedZone) {
        results.wrong.push(item.name);
        return;
      }
      if (placement.detectedZone === item.correctZone) {
        results.correct.push(item.name);
      } else {
        results.wrong.push(item.name);
      }
    });

    setCheckResults(results);

    if (results.wrong.length === 0) {
      setIsComplete(true);
      revealAnswer();
    }
  }, [items, itemPlacements, revealAnswer]);

  // Chip dimensions (used for centering detection point)
  const touchScale = isTouchDevice ? 1.3 : 1;
  const chipW = 100 * scale * touchScale;
  const chipH = 28 * scale * touchScale;

  const handleDragEnd = useCallback(
    (itemName, e) => {
      const x = e.target.x();
      const y = e.target.y();

      // Use center of chip for zone detection, not top-left corner
      const centerX = x + chipW / 2;
      const centerY = y + chipH / 2;

      const detectedZone =
        numCircles === 3
          ? detectZone3(centerX, centerY, circleLayout.a, circleLayout.b, circleLayout.c, zoneTolerance)
          : detectZone2(centerX, centerY, circleLayout.left, circleLayout.right, zoneTolerance);

      setItemPlacements((prev) => ({
        ...prev,
        [itemName]: { x, y, detectedZone },
      }));

      // Clear wrong status if re-dragging a wrong item
      if (checkResults?.wrong?.includes(itemName)) {
        setCheckResults((prev) => {
          if (!prev) return prev;
          return {
            correct: prev.correct,
            wrong: prev.wrong.filter((n) => n !== itemName),
          };
        });
      }
    },
    [numCircles, circleLayout, checkResults, chipW, chipH, zoneTolerance]
  );

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  // Determine if all items have been placed
  const allPlaced =
    mode === "drag" &&
    items &&
    items.length > 0 &&
    items.every((item) => itemPlacements[item.name]?.detectedZone);

  // Answer arrays for L3/L5
  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return ["0"];
  }, [currentProblem]);

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];
  const isDragMode = mode === "drag";
  const isQuestionMode = mode === "questions" || mode === "notation";

  if (!currentProblem || !visualData?.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Static positions for pre-filled diagrams
  const staticPositions =
    isQuestionMode && items ? getStaticPositions(items, circleLayout, numCircles) : {};

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !isComplete && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question text for L3/L5 */}
      {isQuestionMode && questionText && <QuestionText>{questionText}</QuestionText>}

      {/* Konva canvas */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* 2-circle layout */}
            {numCircles === 2 && (
              <>
                <Circle
                  x={circleLayout.left.x}
                  y={circleLayout.left.y}
                  radius={circleLayout.left.r}
                  fill={CIRCLE_COLORS.A}
                  opacity={0.2}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2}
                />
                <Circle
                  x={circleLayout.right.x}
                  y={circleLayout.right.y}
                  radius={circleLayout.right.r}
                  fill={CIRCLE_COLORS.B}
                  opacity={0.2}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2}
                />
                {/* Category labels above each circle */}
                <Text
                  x={circleLayout.left.x - circleLayout.left.r}
                  y={circleLayout.left.y - circleLayout.left.r - 22 * scale}
                  width={circleLayout.left.r * 2}
                  text={categoryA}
                  fontSize={15 * scale}
                  fontStyle="bold"
                  fill={CIRCLE_COLORS.A}
                  align="center"
                />
                <Text
                  x={circleLayout.right.x - circleLayout.right.r}
                  y={circleLayout.right.y - circleLayout.right.r - 22 * scale}
                  width={circleLayout.right.r * 2}
                  text={categoryB}
                  fontSize={15 * scale}
                  fontStyle="bold"
                  fill={CIRCLE_COLORS.B}
                  align="center"
                />
              </>
            )}

            {/* 3-circle layout */}
            {numCircles === 3 && (
              <>
                <Circle
                  x={circleLayout.a.x}
                  y={circleLayout.a.y}
                  radius={circleLayout.a.r}
                  fill={CIRCLE_COLORS.A}
                  opacity={0.2}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2}
                />
                <Circle
                  x={circleLayout.b.x}
                  y={circleLayout.b.y}
                  radius={circleLayout.b.r}
                  fill={CIRCLE_COLORS.B}
                  opacity={0.2}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2}
                />
                <Circle
                  x={circleLayout.c.x}
                  y={circleLayout.c.y}
                  radius={circleLayout.c.r}
                  fill={CIRCLE_COLORS.C}
                  opacity={0.2}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2}
                />
                {/* Category labels: A above top circle, B left of bottom-left, C right of bottom-right */}
                <Text
                  x={circleLayout.a.x - circleLayout.a.r}
                  y={circleLayout.a.y - circleLayout.a.r - 22 * scale}
                  width={circleLayout.a.r * 2}
                  text={categoryA}
                  fontSize={14 * scale}
                  fontStyle="bold"
                  fill={CIRCLE_COLORS.A}
                  align="center"
                />
                <Text
                  x={circleLayout.b.x - circleLayout.b.r - 10 * scale}
                  y={circleLayout.b.y + circleLayout.b.r + 4 * scale}
                  width={circleLayout.b.r * 2}
                  text={categoryB}
                  fontSize={14 * scale}
                  fontStyle="bold"
                  fill={CIRCLE_COLORS.B}
                  align="center"
                />
                <Text
                  x={circleLayout.c.x - circleLayout.c.r + 10 * scale}
                  y={circleLayout.c.y + circleLayout.c.r + 4 * scale}
                  width={circleLayout.c.r * 2}
                  text={categoryC}
                  fontSize={14 * scale}
                  fontStyle="bold"
                  fill={CIRCLE_COLORS.C}
                  align="center"
                />
              </>
            )}

            {/* Draggable items (L1, L2, L4) */}
            {isDragMode &&
              items?.map((item, i) => {
                const placement = itemPlacements[item.name];
                const x = placement?.x ?? wordBankX;
                const y = placement?.y ?? wordBankStartY + i * 38 * scale * touchScale;
                const isCorrect = checkResults?.correct?.includes(item.name);
                const isWrong = checkResults?.wrong?.includes(item.name);
                const canDrag = !isComplete && !isCorrect;

                return (
                  <Group key={item.name}>
                    {/* Chip background */}
                    <Rect
                      x={x - 2}
                      y={y - 4}
                      width={chipW}
                      height={chipH}
                      cornerRadius={6}
                      fill={
                        isCorrect
                          ? "#10B98130"
                          : isWrong
                          ? "#EF444430"
                          : konvaTheme.canvasBackground
                      }
                      stroke={
                        isCorrect
                          ? "#10B981"
                          : isWrong
                          ? "#EF4444"
                          : konvaTheme.shapeStroke
                      }
                      strokeWidth={isCorrect || isWrong ? 2 : 1}
                    />
                    {/* Item text */}
                    <Text
                      x={x}
                      y={y}
                      text={item.name}
                      fontSize={14 * scale * touchScale}
                      fontStyle="bold"
                      fill={konvaTheme.labelText}
                      width={(chipW - 4)}
                      align="center"
                      draggable={canDrag}
                      onDragEnd={(e) => handleDragEnd(item.name, e)}
                      onDragMove={(e) => {
                        // Move the chip bg with the text
                        const node = e.target;
                        const parent = node.getParent();
                        if (parent) {
                          const rect = parent.findOne("Rect");
                          if (rect) {
                            rect.x(node.x() - 2);
                            rect.y(node.y() - 4);
                          }
                        }
                      }}
                      shadowColor={canDrag ? "black" : undefined}
                      shadowBlur={canDrag ? 4 : 0}
                      shadowOpacity={0.2}
                    />
                  </Group>
                );
              })}

            {/* Static items for pre-filled diagrams (L3, L5) */}
            {isQuestionMode &&
              items?.map((item) => {
                const pos = staticPositions[item.name] || { x: 0, y: 0 };
                const tileW = 90 * scale;
                const tx = pos.x - tileW / 2;
                return (
                  <Group key={item.name}>
                    <Rect
                      x={tx - 2}
                      y={pos.y - 4}
                      width={tileW}
                      height={24 * scale}
                      cornerRadius={5}
                      fill={konvaTheme.canvasBackground}
                      stroke={konvaTheme.shapeStroke}
                      strokeWidth={1}
                      opacity={0.8}
                    />
                    <Text
                      x={tx}
                      y={pos.y}
                      text={item.name}
                      fontSize={13 * scale}
                      fontStyle="bold"
                      fill={konvaTheme.labelText}
                      width={86 * scale}
                      align="center"
                    />
                  </Group>
                );
              })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && !isComplete && showHint && <HintBox>{hint}</HintBox>}

        {/* Drag mode: Check Answer button */}
        {isDragMode && !isComplete && allPlaced && (
          <CheckButton onClick={handleCheckAnswer}>
            {checkResults ? "Check Again" : "Check Answer"}
          </CheckButton>
        )}

        {/* Drag mode: wrong feedback */}
        {isDragMode && checkResults && !isComplete && (
          <FeedbackText $isWrong>
            {checkResults.correct.length} of {items.length} correct. Try moving the red items!
          </FeedbackText>
        )}

        {/* Drag mode: completion */}
        {isDragMode && isComplete && (
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        )}

        {/* Question mode: typed answer (L3, L5) */}
        {isQuestionMode && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder={level === 5 ? "Enter a number or fraction" : "Enter a number"}
          />
        )}
      </InteractionSection>

      {/* Explanation Section */}
      {(showAnswer || isComplete) && (
        <ExplanationSection>
          <ExplanationTitle>Explanation</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default VennDiagram;

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
  margin: 0 0 12px 0;
  max-width: 700px;
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 4px 0 12px 0;
  max-width: 700px;

  @media (min-width: 768px) {
    font-size: 20px;
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

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
  margin: 0;
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

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 4px;
`;

const ExplanationTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0 0 12px 0;
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
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
