import React, { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import TouchDragHandle from "../../../../shared/helpers/TouchDragHandle";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Identify the Zoom Factor", instruction: "What is the zoom factor?" },
  2: { title: "Drag to Zoom", instruction: "" },
  3: { title: "Find New Dimensions", instruction: "" },
  4: { title: "Area After Zoom", instruction: "" },
  5: { title: "Word Problem", instruction: "" },
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

// ==================== ZOOM FACTOR DIAGRAM ====================

function ZoomFactorDiagram({
  visualData,
  konvaTheme,
  canvasWidth,
  canvasHeight,
  isTouchDevice,
  phase,
  currentScale,
  onScaleChange,
  onScaleComplete,
}) {
  const {
    level,
    origW,
    origH,
    newW,
    newH,
    zoomFactor,
    origRect,
    zoomedRect,
    targetRect,
  } = visualData;

  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / 300;
  const sx = (v) => v * scaleX;
  const sy = (v) => v * scaleY;

  const origColor = konvaTheme.shapeStroke || "#3B82F6";
  const targetColor = konvaTheme.shapeHighlight || "#00BF63";
  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const labelBg = konvaTheme.labelBackground || "#ffffffcc";
  const textColor = konvaTheme.text || "#333333";
  const fontSize = 14 * Math.min(scaleX, scaleY);

  // L2: drag handler
  const handleDragMove = useCallback((e) => {
    if (!origRect || !zoomFactor) return;
    const node = e.target;
    // Handle is at bottom-right corner; origin is top-left of origRect
    const ox = sx(origRect.x);
    const oy = sy(origRect.y);
    const origDiag = Math.sqrt(sx(origRect.w) ** 2 + sy(origRect.h) ** 2);
    if (origDiag < 1) return;
    const handleX = node.x();
    const handleY = node.y();
    const newDiag = Math.sqrt((handleX - ox) ** 2 + (handleY - oy) ** 2);
    const newScale = newDiag / origDiag;
    const clamped = Math.max(0.2, Math.min(newScale, 4));
    onScaleChange(clamped);
  }, [origRect, zoomFactor, onScaleChange, scaleX, scaleY]);

  const handleDragEnd = useCallback(() => {
    if (!zoomFactor || currentScale == null) return;
    const tolerance = isTouchDevice ? 0.15 : 0.1;
    if (Math.abs(currentScale - zoomFactor) <= tolerance) {
      onScaleComplete();
    }
  }, [zoomFactor, currentScale, isTouchDevice, onScaleComplete]);

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* ===== L1: Original + Zoomed rectangles side-by-side ===== */}
        {level === 1 && origRect && zoomedRect && (
          <>
            {/* Original rectangle */}
            <Rect
              x={sx(origRect.x)} y={sy(origRect.y)}
              width={sx(origRect.w)} height={sy(origRect.h)}
              stroke={origColor} strokeWidth={3}
              listening={false}
            />
            {/* Original label */}
            <Text
              x={sx(origRect.x)} y={sy(origRect.y) - 20}
              text="Original"
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Original width label */}
            <Text
              x={sx(origRect.x) + sx(origRect.w) / 2 - 12}
              y={sy(origRect.y) + sy(origRect.h) + 6}
              text={String(origW)}
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Original height label */}
            <Text
              x={sx(origRect.x) - 24}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 7}
              text={String(origH)}
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />

            {/* Zoomed rectangle */}
            <Rect
              x={sx(zoomedRect.x)} y={sy(zoomedRect.y)}
              width={sx(zoomedRect.w)} height={sy(zoomedRect.h)}
              stroke={targetColor} strokeWidth={3}
              listening={false}
            />
            {/* Zoomed label */}
            <Text
              x={sx(zoomedRect.x)} y={sy(zoomedRect.y) - 20}
              text="Zoomed"
              fontSize={fontSize}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Zoomed width label */}
            <Text
              x={sx(zoomedRect.x) + sx(zoomedRect.w) / 2 - 12}
              y={sy(zoomedRect.y) + sy(zoomedRect.h) + 6}
              text={String(newW)}
              fontSize={fontSize}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Zoomed height label */}
            <Text
              x={sx(zoomedRect.x) - 28}
              y={sy(zoomedRect.y) + sy(zoomedRect.h) / 2 - 7}
              text={String(newH)}
              fontSize={fontSize}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
          </>
        )}

        {/* ===== L2: Original rectangle + target dashed outline + drag handle ===== */}
        {level === 2 && origRect && targetRect && (
          <>
            {/* Target outline (green dashed) */}
            <Rect
              x={sx(targetRect.x)} y={sy(targetRect.y)}
              width={sx(targetRect.w)} height={sy(targetRect.h)}
              stroke={targetColor} strokeWidth={2}
              dash={[10, 6]} opacity={0.6}
              listening={false}
            />

            {/* Current dragged rectangle */}
            <Rect
              x={sx(origRect.x)} y={sy(origRect.y)}
              width={sx(origRect.w) * (currentScale || 1)}
              height={sy(origRect.h) * (currentScale || 1)}
              stroke={origColor} strokeWidth={3}
              listening={false}
            />

            {/* Drag handle at bottom-right corner */}
            {phase === "interact" && (
              <TouchDragHandle
                x={sx(origRect.x) + sx(origRect.w) * (currentScale || 1)}
                y={sy(origRect.y) + sy(origRect.h) * (currentScale || 1)}
                radius={8}
                hitRadius={28}
                fill={origColor}
                stroke={origColor}
                strokeWidth={2}
                draggable
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                affordanceColor={origColor}
              />
            )}
          </>
        )}

        {/* ===== L3: Original rectangle with labeled dimensions + scale factor ===== */}
        {level === 3 && origRect && (
          <>
            <Rect
              x={sx(origRect.x)} y={sy(origRect.y)}
              width={sx(origRect.w)} height={sy(origRect.h)}
              stroke={origColor} strokeWidth={3}
              listening={false}
            />
            <Text
              x={sx(origRect.x)} y={sy(origRect.y) - 20}
              text="Original"
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Width label */}
            <Text
              x={sx(origRect.x) + sx(origRect.w) / 2 - 12}
              y={sy(origRect.y) + sy(origRect.h) + 6}
              text={String(origW)}
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Height label */}
            <Text
              x={sx(origRect.x) - 24}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 7}
              text={String(origH)}
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Zoom factor text */}
            <Text
              x={sx(origRect.x) + sx(origRect.w) + 30}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 10}
              text={`× ${zoomFactor}`}
              fontSize={22 * Math.min(scaleX, scaleY)}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
          </>
        )}

        {/* ===== L4: Rectangle with area label + scale factor ===== */}
        {level === 4 && origRect && (
          <>
            <Rect
              x={sx(origRect.x)} y={sy(origRect.y)}
              width={sx(origRect.w)} height={sy(origRect.h)}
              stroke={origColor} strokeWidth={3}
              listening={false}
            />
            <Text
              x={sx(origRect.x)} y={sy(origRect.y) - 20}
              text="Original"
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Width label */}
            <Text
              x={sx(origRect.x) + sx(origRect.w) / 2 - 12}
              y={sy(origRect.y) + sy(origRect.h) + 6}
              text={String(origW)}
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Height label */}
            <Text
              x={sx(origRect.x) - 24}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 7}
              text={String(origH)}
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Area in center */}
            <Text
              x={sx(origRect.x) + sx(origRect.w) / 2 - 30}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 8}
              text={`Area = ${visualData.origArea}`}
              fontSize={fontSize}
              fill={textColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Zoom factor */}
            <Text
              x={sx(origRect.x) + sx(origRect.w) + 30}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 10}
              text={`× ${zoomFactor}`}
              fontSize={22 * Math.min(scaleX, scaleY)}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
          </>
        )}

        {/* ===== L5: Reference rectangle for word problems ===== */}
        {level === 5 && origRect && (
          <>
            <Rect
              x={sx(origRect.x)} y={sy(origRect.y)}
              width={sx(origRect.w)} height={sy(origRect.h)}
              stroke={origColor} strokeWidth={3}
              listening={false}
            />
            <Text
              x={sx(origRect.x)} y={sy(origRect.y) - 20}
              text="Original"
              fontSize={fontSize}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
            {/* Arrow showing zoom */}
            <Line
              points={[
                sx(origRect.x) + sx(origRect.w) + 10, sy(origRect.y) + sy(origRect.h) / 2,
                sx(origRect.x) + sx(origRect.w) + 60, sy(origRect.y) + sy(origRect.h) / 2,
              ]}
              stroke={targetColor}
              strokeWidth={3}
              listening={false}
            />
            <Text
              x={sx(origRect.x) + sx(origRect.w) + 15}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 20}
              text={`× ${zoomFactor}`}
              fontSize={fontSize}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
            <Text
              x={sx(origRect.x) + sx(origRect.w) + 70}
              y={sy(origRect.y) + sy(origRect.h) / 2 - 8}
              text="?"
              fontSize={24 * Math.min(scaleX, scaleY)}
              fill={targetColor}
              fontStyle="bold"
              listening={false}
            />
          </>
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function ZoomFactorLesson({ triggerNewProblem }) {
  const {
    lessonProps,
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

  // L2: drag state
  const [currentScale, setCurrentScale] = useState(1);

  // L4: input state
  const [inputValue, setInputValue] = useState("");
  const [inputWrong, setInputWrong] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    educationalNote = "",
    zoomFactor,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";
  const acceptedAnswers = currentProblem?.acceptedAnswers || currentProblem?.answer || [];

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = canvasWidth * 0.75;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData.origW || 0}-${visualData.origH || 0}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setCurrentScale(1);
    setInputValue("");
    setInputWrong(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setCurrentScale(1);
    setInputValue("");
    setInputWrong(false);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // Choice click handler (L1, L3, L5)
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

  // L2: scale change from drag
  const handleScaleChange = useCallback((newScale) => {
    setCurrentScale(newScale);
  }, []);

  // L2: scale matched target
  const handleScaleComplete = useCallback(() => {
    setCurrentScale(zoomFactor);
    setPhase("complete");
    revealAnswer();
  }, [zoomFactor, revealAnswer]);

  // L4: input submit
  const handleInputSubmit = useCallback(() => {
    if (phase !== "interact") return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const isCorrect = acceptedAnswers.some((a) => String(a).trim() === trimmed);
    if (isCorrect) {
      setPhase("complete");
      revealAnswer();
    } else {
      setInputWrong(true);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => setInputWrong(false), 600);
    }
  }, [phase, inputValue, acceptedAnswers, revealAnswer]);

  const handleInputKeyDown = useCallback((e) => {
    if (e.key === "Enter") handleInputSubmit();
  }, [handleInputSubmit]);

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  const displayScale = currentScale != null ? Math.round(currentScale * 100) / 100 : 1;

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
        {level === 2 || level >= 3 ? questionText : levelInfo.instruction}
      </InstructionText>

      {/* L2: Scale Factor Display */}
      {level === 2 && phase === "interact" && (
        <ScaleDisplay>Scale: {displayScale}x</ScaleDisplay>
      )}

      {/* Konva Diagram */}
      <CanvasWrapper>
        <ZoomFactorDiagram
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          isTouchDevice={isTouchDevice}
          phase={phase}
          currentScale={level === 2 ? currentScale : null}
          onScaleChange={handleScaleChange}
          onScaleComplete={handleScaleComplete}
        />
      </CanvasWrapper>

      {/* L2: Drag instruction */}
      {level === 2 && phase === "interact" && (
        <DragInstruction>
          {isTouchDevice ? "Drag the blue handle" : "Click and drag the blue handle"} to match the green outline
        </DragInstruction>
      )}

      {/* ===== Choice Buttons (L1, L3, L5) ===== */}
      {[1, 3, 5].includes(level) && phase === "interact" && choices.length > 0 && (
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

      {/* ===== L4: Area input ===== */}
      {level === 4 && phase === "interact" && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && !inputWrong && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <InputRow>
            <AnswerLabel>New Area =</AnswerLabel>
            <AnswerInput
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              $wrong={inputWrong}
              placeholder="?"
              autoFocus
            />
            <SubmitButton onClick={handleInputSubmit}>Check</SubmitButton>
          </InputRow>
        </ChooseSection>
      )}

      {/* L2: Hint during drag */}
      {level === 2 && phase === "interact" && showHint && hint && (
        <ChooseSection>
          <HintBox>{hint}</HintBox>
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

export default ZoomFactorLesson;

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

const ScaleDisplay = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 4px 0;
  font-variant-numeric: tabular-nums;
`;

const DragInstruction = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 4px 0 12px 0;
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

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

const AnswerLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const AnswerInput = styled.input`
  width: 120px;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  border-radius: 10px;
  border: 2px solid ${(props) =>
    props.$wrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }

  ${(props) =>
    props.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
    `}
`;

const SubmitButton = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  color: white;
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
