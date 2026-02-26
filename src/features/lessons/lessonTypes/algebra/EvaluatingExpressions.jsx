import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { Stage, Layer, Rect, Text, Group } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme, useIsTouchDevice } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Group Like Terms", instruction: "Drag each term into the correct group." },
  2: { title: "Three Groups", instruction: "Sort the terms into x² terms, x terms, and constants." },
  3: { title: "Combine Like Terms", instruction: "Simplify by combining like terms. Write your answer in standard form." },
  4: { title: "With x² Terms", instruction: "Combine x², x, and constant terms. Watch the signs!" },
  5: { title: "Multi-Variable", instruction: "Combine all like terms. Group x², xy, x, y, and constants." },
};

// Zone colors (translucent backgrounds)
const ZONE_COLORS = {
  x2: { fill: "#818CF820", stroke: "#818CF8", label: "#818CF8" },
  x: { fill: "#3B82F620", stroke: "#3B82F6", label: "#3B82F6" },
  xy: { fill: "#F59E0B20", stroke: "#F59E0B", label: "#F59E0B" },
  y: { fill: "#10B98120", stroke: "#10B981", label: "#10B981" },
  const: { fill: "#EF444420", stroke: "#EF4444", label: "#EF4444" },
};

// ==================== ZONE DETECTION ====================

function detectZone(px, py, zoneRects) {
  for (const zone of zoneRects) {
    if (px >= zone.x && px <= zone.x + zone.w && py >= zone.y && py <= zone.y + zone.h) {
      return zone.id;
    }
  }
  return null;
}

// ==================== MAIN COMPONENT ====================

function EvaluatingExpressions({ triggerNewProblem }) {
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
  const [showHint, setShowHint] = useState(false);

  // Drag state
  const [itemPlacements, setItemPlacements] = useState({});
  const [checkResults, setCheckResults] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    mode = "drag",
    expression = "",
    simplified = "",
    terms = [],
    zones: rawZones = null,
  } = visualData;
  const zones = rawZones || [];

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (currentProblem?.answer) return currentProblem.answer;
    return ["0"];
  }, [currentProblem]);

  // Reset on problem change
  const problemKey = `${expression}-${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setItemPlacements({});
    setCheckResults(null);
    setIsComplete(false);
    setShowHint(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setItemPlacements({});
    setCheckResults(null);
    setIsComplete(false);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // Canvas layout
  const canvasWidth = Math.min(width - 40, 700);
  const touchScale = isTouchDevice ? 1.2 : 1;
  const chipH = 36 * touchScale;
  const chipW = 90 * touchScale;
  const chipPadding = 8 * touchScale;

  // Zone layout: horizontal zones below expression
  const zoneGap = 16;
  const zoneTopY = 60;
  const zoneW = zones.length > 0
    ? (canvasWidth - zoneGap * (zones.length + 1)) / zones.length
    : 200;
  const zoneH = 180 * touchScale;

  const zoneRects = useMemo(() => {
    return zones.map((z, i) => ({
      id: z.id,
      label: z.label,
      x: zoneGap + i * (zoneW + zoneGap),
      y: zoneTopY,
      w: zoneW,
      h: zoneH,
    }));
  }, [zones, zoneW, zoneH, zoneGap, zoneTopY]);

  // Word bank: tiles below the zones
  const wordBankY = zoneTopY + zoneH + 30;
  const tilesPerRow = Math.floor(canvasWidth / (chipW + chipPadding));
  const canvasHeight = wordBankY + Math.ceil(terms.length / Math.max(tilesPerRow, 1)) * (chipH + chipPadding) + 40;

  // Drag handling
  const handleDragEnd = useCallback(
    (termIndex, e) => {
      const x = e.target.x();
      const y = e.target.y();
      const centerX = x + chipW / 2;
      const centerY = y + chipH / 2;

      const detectedZone = detectZone(centerX, centerY, zoneRects);

      setItemPlacements((prev) => ({
        ...prev,
        [termIndex]: { x, y, detectedZone },
      }));

      // Clear wrong status on re-drag
      if (checkResults?.wrong?.includes(termIndex)) {
        setCheckResults((prev) => {
          if (!prev) return prev;
          return {
            correct: prev.correct,
            wrong: prev.wrong.filter((n) => n !== termIndex),
          };
        });
      }
    },
    [zoneRects, checkResults, chipW, chipH]
  );

  // Check answer for drag mode
  const handleCheckAnswer = useCallback(() => {
    if (!terms.length) return;
    const results = { correct: [], wrong: [] };

    terms.forEach((term, idx) => {
      const placement = itemPlacements[idx];
      if (!placement || !placement.detectedZone) {
        results.wrong.push(idx);
        return;
      }
      if (placement.detectedZone === term.correctZone) {
        results.correct.push(idx);
      } else {
        results.wrong.push(idx);
      }
    });

    setCheckResults(results);

    if (results.wrong.length === 0) {
      setIsComplete(true);
      revealAnswer();
    }
  }, [terms, itemPlacements, revealAnswer]);

  const allPlaced = mode === "drag" && terms.length > 0 &&
    terms.every((_, idx) => itemPlacements[idx]?.detectedZone);

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  if (!currentProblem || !visualData.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Answer type / placeholder for type mode
  const getPlaceholder = () => {
    if (level <= 3) return "e.g. 5x + 12";
    if (level === 4) return "e.g. 2x² + 3x + 4";
    return "e.g. x² + 8xy + 4";
  };

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !isComplete && !showHint && hint && (
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

      {/* Expression display */}
      <ExpressionDisplay>{expression}</ExpressionDisplay>

      {/* DRAG MODE (L1-L2) */}
      {mode === "drag" && (
        <>
          <VisualSection>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                {/* Background */}
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

                {/* Drop zones */}
                {zoneRects.map((zone) => {
                  const colors = ZONE_COLORS[zone.id] || ZONE_COLORS.const;
                  return (
                    <Group key={zone.id}>
                      <Rect
                        x={zone.x}
                        y={zone.y}
                        width={zone.w}
                        height={zone.h}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={2}
                        cornerRadius={10}
                        dash={[8, 4]}
                      />
                      <Text
                        x={zone.x}
                        y={zone.y + 8}
                        width={zone.w}
                        text={zone.label}
                        fontSize={16 * touchScale}
                        fontStyle="bold"
                        fill={colors.label}
                        align="center"
                      />
                    </Group>
                  );
                })}

                {/* Draggable tiles */}
                {terms.map((term, idx) => {
                  const placement = itemPlacements[idx];
                  // Default position: word bank grid
                  const row = Math.floor(idx / tilesPerRow);
                  const col = idx % tilesPerRow;
                  const defaultX = zoneGap + col * (chipW + chipPadding);
                  const defaultY = wordBankY + row * (chipH + chipPadding);

                  const x = placement?.x ?? defaultX;
                  const y = placement?.y ?? defaultY;
                  const isCorrect = checkResults?.correct?.includes(idx);
                  const isWrong = checkResults?.wrong?.includes(idx);
                  const canDrag = !isComplete && !isCorrect;

                  return (
                    <Group key={idx}>
                      <Rect
                        x={x}
                        y={y}
                        width={chipW}
                        height={chipH}
                        cornerRadius={8}
                        fill={
                          isCorrect
                            ? "#10B98130"
                            : isWrong
                            ? "#EF444430"
                            : konvaTheme.canvasBackground || "#ffffff"
                        }
                        stroke={
                          isCorrect
                            ? "#10B981"
                            : isWrong
                            ? "#EF4444"
                            : konvaTheme.shapeStroke || "#94A3B8"
                        }
                        strokeWidth={isCorrect || isWrong ? 2.5 : 1.5}
                        shadowColor={canDrag ? "black" : undefined}
                        shadowBlur={canDrag ? 4 : 0}
                        shadowOpacity={0.15}
                      />
                      <Text
                        x={x}
                        y={y + (chipH - 16 * touchScale) / 2}
                        width={chipW}
                        text={term.display}
                        fontSize={16 * touchScale}
                        fontStyle="bold"
                        fill={konvaTheme.canvasBackground !== '#ffffff' ? "#cbd5e1" : "#1E293B"}
                        align="center"
                        draggable={canDrag}
                        onDragEnd={(e) => handleDragEnd(idx, e)}
                        onDragMove={(e) => {
                          // Move chip bg with text
                          const node = e.target;
                          const parent = node.getParent();
                          if (parent) {
                            const rect = parent.findOne("Rect");
                            if (rect) {
                              rect.x(node.x());
                              rect.y(node.y() - (chipH - 16 * touchScale) / 2);
                            }
                          }
                        }}
                      />
                    </Group>
                  );
                })}
              </Layer>
            </Stage>
          </VisualSection>

          <InteractionSection>
            {!showAnswer && !isComplete && showHint && <HintBox>{hint}</HintBox>}

            {!isComplete && allPlaced && (
              <CheckButton onClick={handleCheckAnswer}>
                {checkResults ? "Check Again" : "Check Answer"}
              </CheckButton>
            )}

            {checkResults && !isComplete && (
              <FeedbackText $isWrong>
                {checkResults.correct.length} of {terms.length} correct. Move the red tiles!
              </FeedbackText>
            )}

            {isComplete && (
              <SimplifiedResult>
                Combined: <strong>{simplified}</strong>
              </SimplifiedResult>
            )}
          </InteractionSection>
        </>
      )}

      {/* TYPE MODE (L3-L5) */}
      {mode === "type" && (
        <InteractionSection>
          {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

          {!showAnswer && (
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="array"
              onCorrect={revealAnswer}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder={getPlaceholder()}
            />
          )}
        </InteractionSection>
      )}

      {/* Explanation */}
      {(showAnswer || isComplete) && (
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
}

export default EvaluatingExpressions;

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

const ExpressionDisplay = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 8px 0 16px 0;
  padding: 12px 24px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  font-family: "Georgia", serif;
  letter-spacing: 1px;

  @media (min-width: 768px) {
    font-size: 28px;
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

const SimplifiedResult = styled.div`
  font-size: 20px;
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-weight: 600;
  padding: 12px 24px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;

  strong {
    font-size: 24px;
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
