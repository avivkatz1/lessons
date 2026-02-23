import React, { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Line, Circle, Rect, Text } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Shape or Not?", instruction: "Is this a shape?" },
  2: { title: "Find the Shapes", instruction: "Tap all the shapes, then press Check." },
  3: { title: "Name This Shape", instruction: "What is the name of this shape?" },
  4: { title: "Pick the Shape", instruction: "" }, // dynamic per problem
  5: { title: "Shape Challenge", instruction: "" }, // dynamic per problem
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

// ==================== SHAPE DIAGRAM COMPONENT ====================

function ShapeDiagram({
  figures,
  mode,
  konvaTheme,
  canvasWidth,
  canvasHeight,
  isTouchDevice,
  selectedIndices,
  highlightedIndex,
  flashIndex,
  wrongIndices,
  onFigureTap,
  level,
}) {
  if (!figures || figures.length === 0) return null;

  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / 400;
  const scale = (v) => ({ x: v.x * scaleX, y: v.y * scaleY });

  const highlightColor = konvaTheme.shapeHighlight || "#00BF63";
  const defaultStroke = konvaTheme.shapeStroke || "#000000";
  const dotColor = konvaTheme.point || "#ef4444";

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect
          x={0} y={0}
          width={canvasWidth} height={canvasHeight}
          fill={konvaTheme.canvasBackground || "#ffffff"}
        />

        {/* Grid dividers for grid mode */}
        {mode === "grid" && (
          <>
            <Line
              points={[canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]}
              stroke={(defaultStroke) + "30"}
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
            <Line
              points={[0, canvasHeight / 2, canvasWidth, canvasHeight / 2]}
              stroke={(defaultStroke) + "30"}
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          </>
        )}

        {/* Render each figure */}
        {figures.map((fig, idx) => {
          const vertices = fig.vertices || [];
          if (vertices.length === 0) return null;

          let strokeColor = defaultStroke;
          let strokeWidth = 3;

          // L2: selected shapes get green border
          if (level === 2 && selectedIndices && selectedIndices.has(idx)) {
            strokeColor = highlightColor;
            strokeWidth = 5;
          }

          // L2: wrong shapes after check get red
          if (level === 2 && wrongIndices && wrongIndices.has(idx)) {
            strokeColor = "#EF4444";
            strokeWidth = 5;
          }

          // L4: correct tap highlight
          if (highlightedIndex === idx) {
            strokeColor = highlightColor;
            strokeWidth = 5;
          }

          // Flash red for wrong tap
          if (flashIndex === idx) {
            strokeColor = "#EF4444";
            strokeWidth = 5;
          }

          // Build points array for Line
          const scaledVerts = vertices.map(scale);
          const points = [];
          scaledVerts.forEach((v) => {
            points.push(v.x, v.y);
          });
          // Close path: add first vertex again
          if (fig.closePath && vertices.length > 2) {
            points.push(scaledVerts[0].x, scaledVerts[0].y);
          }

          return (
            <React.Fragment key={`figure-${idx}`}>
              <Line
                points={points}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                lineCap="round"
                lineJoin="round"
                listening={false}
              />

              {/* Vertex dots */}
              {scaledVerts.map((v, vi) => (
                <Circle
                  key={`v-${idx}-${vi}`}
                  x={v.x}
                  y={v.y}
                  radius={3}
                  fill={dotColor}
                  listening={false}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* Grid tap targets (invisible rectangles covering each quadrant) */}
        {mode === "grid" && onFigureTap && figures.map((fig, idx) => (
          <Rect
            key={`tap-${idx}`}
            x={(idx % 2) * canvasWidth / 2}
            y={Math.floor(idx / 2) * canvasHeight / 2}
            width={canvasWidth / 2}
            height={canvasHeight / 2}
            fill="transparent"
            onTap={() => onFigureTap(idx)}
            onClick={() => onFigureTap(idx)}
          />
        ))}

        {/* Selection checkmarks for L2 */}
        {level === 2 && selectedIndices && mode === "grid" && figures.map((fig, idx) => {
          if (!selectedIndices.has(idx)) return null;
          const cx = (idx % 2) * canvasWidth / 2 + canvasWidth / 4;
          const cy = Math.floor(idx / 2) * canvasHeight / 2 + 14 * scaleY;
          return (
            <Text
              key={`check-${idx}`}
              x={cx - 8}
              y={cy}
              text="Selected"
              fontSize={12}
              fill={highlightColor}
              fontStyle="bold"
              listening={false}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function ShapesLesson({ triggerNewProblem }) {
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

  // Phase state
  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  // L2: Multi-select state
  const [selectedFigures, setSelectedFigures] = useState(new Set());
  const [wrongFigures, setWrongFigures] = useState(null);

  // L4: Tap state
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [flashIndex, setFlashIndex] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    mode = "single",
    figures: rawFigures = [],
    choices: rawChoices = [],
    correctIndices = [],
    targetIndex = -1,
    targetName = "",
    educationalNote = "",
  } = visualData;

  const figures = rawFigures || [];
  const choices = rawChoices || [];
  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = canvasWidth;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${figures.length}-${figures[0]?.vertices?.[0]?.x || 0}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setSelectedFigures(new Set());
    setWrongFigures(null);
    setHighlightedIndex(null);
    setFlashIndex(null);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setSelectedFigures(new Set());
    setWrongFigures(null);
    setHighlightedIndex(null);
    setFlashIndex(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // L1, L3, L5: Choice click handler
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

  // L2: Toggle figure selection
  const handleFigureTapL2 = useCallback((idx) => {
    if (phase !== "interact") return;
    setWrongFigures(null); // Clear error highlights
    setSelectedFigures((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, [phase]);

  // L2: Check selection
  const handleCheckSelection = useCallback(() => {
    if (phase !== "interact") return;

    const correctSet = new Set(correctIndices);
    const selected = selectedFigures;

    // Check if sets match
    const isCorrect =
      correctSet.size === selected.size &&
      [...correctSet].every((i) => selected.has(i));

    if (isCorrect) {
      setPhase("complete");
      revealAnswer();
    } else {
      // Highlight wrong: selected but not correct, or correct but not selected
      const wrong = new Set();
      selected.forEach((i) => { if (!correctSet.has(i)) wrong.add(i); });
      correctSet.forEach((i) => { if (!selected.has(i)) wrong.add(i); });
      setWrongFigures(wrong);
      setWrongAttempts((prev) => prev + 1);
    }
  }, [phase, correctIndices, selectedFigures, revealAnswer]);

  // L4: Tap figure on grid
  const handleFigureTapL4 = useCallback((idx) => {
    if (phase !== "interact" || highlightedIndex !== null) return;

    if (idx === targetIndex) {
      setHighlightedIndex(idx);
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 600);
    } else {
      setFlashIndex(idx);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => setFlashIndex(null), 500);
    }
  }, [phase, targetIndex, highlightedIndex, revealAnswer]);

  // Grid tap handler
  const figureTapHandler = level === 2 ? handleFigureTapL2 : level === 4 ? handleFigureTapL4 : null;

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

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
      <InstructionText>
        {level <= 2 ? levelInfo.instruction : questionText}
      </InstructionText>

      {/* Konva Shape Diagram - Hide for Level 5 */}
      {level !== 5 && (
        <CanvasWrapper>
          <ShapeDiagram
            figures={figures}
            mode={mode}
            konvaTheme={konvaTheme}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            isTouchDevice={isTouchDevice}
            selectedIndices={level === 2 ? selectedFigures : null}
            highlightedIndex={highlightedIndex}
            flashIndex={flashIndex}
            wrongIndices={wrongFigures}
            onFigureTap={phase === "interact" ? figureTapHandler : null}
            level={level}
          />
        </CanvasWrapper>
      )}

      {/* ===== Level 1: Binary Choice ===== */}
      {level === 1 && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ButtonRow>
            {[...choices]
              .sort((a, b) => {
                const aIsNot = a.text.toLowerCase().includes("not");
                const bIsNot = b.text.toLowerCase().includes("not");
                if (aIsNot && !bIsNot) return 1;
                if (!aIsNot && bIsNot) return -1;
                return 0;
              })
              .map((choice, sortedIdx) => {
                const originalIdx = choices.indexOf(choice);
                const isGreenButton = !choice.text.toLowerCase().includes("not");
                const ButtonComponent = isGreenButton ? YesButton : NoButton;
                return (
                  <ButtonComponent
                    key={originalIdx}
                    onClick={() => handleChoiceClick(choice, originalIdx)}
                    disabled={selectedChoice !== null || shakingIdx === originalIdx}
                  >
                    {choice.text}
                  </ButtonComponent>
                );
              })}
          </ButtonRow>
        </ChooseSection>
      )}

      {/* ===== Level 2: Find the Shapes ===== */}
      {level === 2 && phase === "interact" && (
        <SelectSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && wrongFigures && (
            <FeedbackText $isWrong>Not quite — check your selections!</FeedbackText>
          )}
          <SelectCount>{selectedFigures.size} selected</SelectCount>
          <CheckButton
            onClick={handleCheckSelection}
            $dimmed={selectedFigures.size === 0}
            disabled={selectedFigures.size === 0}
          >
            Check
          </CheckButton>
        </SelectSection>
      )}

      {/* ===== Level 3: Name This Shape ===== */}
      {level === 3 && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid2x2>
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
          </ChoiceGrid2x2>
        </ChooseSection>
      )}

      {/* ===== Level 4: Tap to Pick Shape ===== */}
      {level === 4 && phase === "interact" && (
        <TapSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && flashIndex === null && (
            <FeedbackText $isWrong>That's not the {targetName}. Try again!</FeedbackText>
          )}
          <TapInstruction>Tap the correct shape above</TapInstruction>
        </TapSection>
      )}

      {/* ===== Level 5: Word Problem ===== */}
      {level === 5 && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid2x2>
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
          </ChoiceGrid2x2>
        </ChooseSection>
      )}

      {/* ===== Phase: Complete ===== */}
      {phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>

          <EducationalNote>{educationalNote}</EducationalNote>

          {explanation && (
            <ExplanationDetail>{explanation}</ExplanationDetail>
          )}

          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default ShapesLesson;

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

const CanvasWrapper = styled.div`
  margin: 8px 0 20px 0;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
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

const ChoiceGrid2x2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin-top: 4px;
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: ${(props) => (props.$isTouchDevice ? "16px 20px" : "13px 20px")};
  font-size: ${(props) => (props.$isTouchDevice ? "17px" : "16px")};
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
    border-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }

  ${(props) =>
    props.$correct &&
    css`
      background-color: ${props.theme.colors.buttonSuccess}20;
      border-color: ${props.theme.colors.buttonSuccess};
      color: ${props.theme.colors.buttonSuccess};
      cursor: default;
    `}

  ${(props) =>
    props.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
      background-color: ${props.theme.colors.danger || "#E53E3E"}15;
      border-color: ${props.theme.colors.danger || "#E53E3E"};
    `}

  ${(props) =>
    props.$fadeOut &&
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
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
  margin: 0;
`;

/* L2: Select section */

const SelectSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const SelectCount = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
`;

/* L4: Tap section */

const TapSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const TapInstruction = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
`;

const CheckButton = styled.button`
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;

  ${(props) => props.$dimmed && css`
    opacity: 0.5;
    cursor: default;
  `}

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

/* Complete section */

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInAnim} 0.4s ease;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;
`;

const EducationalNote = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
`;

const ExplanationDetail = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
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
    padding: 5px 10px;
    font-size: 12px;
  }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const YesButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #10B981;
  cursor: pointer;
  background-color: transparent;
  color: #10B981;
  transition: all 0.2s;

  &:hover {
    background-color: #10B981;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const NoButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #EF4444;
  cursor: pointer;
  background-color: transparent;
  color: #EF4444;
  transition: all 0.2s;

  &:hover {
    background-color: #EF4444;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
