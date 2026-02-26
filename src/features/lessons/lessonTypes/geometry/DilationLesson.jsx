import React, { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Line, Circle, Rect, Text } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import TouchDragHandle from "../../../../shared/helpers/TouchDragHandle";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Is This a Dilation?", instruction: "Is this transformation a dilation?" },
  2: { title: "Drag to Scale", instruction: "" }, // dynamic from question
  3: { title: "Scale Factor", instruction: "What is the scale factor of this dilation?" },
  4: { title: "New Dimensions", instruction: "" }, // dynamic from question
  5: { title: "Word Problem", instruction: "" }, // dynamic from question
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

// ==================== HELPERS ====================

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// ==================== DILATION DIAGRAM ====================

function DilationDiagram({
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
    originalVertices = [],
    transformedVertices = [],
    targetVertices = [],
    dilatedVertices = [],
    centerOfDilation,
    scaleFactor,
    handleVertexIndex = 0,
    labeledSideIndex,
    originalSideLength,
    dilatedSideLength,
  } = visualData;

  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / 400;
  const s = useCallback((v) => ({ x: v.x * scaleX, y: v.y * scaleY }), [scaleX, scaleY]);

  const centerScaled = centerOfDilation ? s(centerOfDilation) : null;

  // L2: drag handler — must be declared before early return
  const handleDragMove = useCallback((e) => {
    if (!centerOfDilation || !originalVertices[handleVertexIndex]) return;
    const node = e.target;
    const groupPos = { x: node.x(), y: node.y() };
    const handleOrig = s(originalVertices[handleVertexIndex]);
    const origDist = dist(centerScaled, handleOrig);
    if (origDist < 1) return;
    const newDist = dist(centerScaled, groupPos);
    const newScale = newDist / origDist;
    const clamped = Math.max(0.2, Math.min(newScale, 4));
    onScaleChange(clamped);
  }, [centerOfDilation, originalVertices, handleVertexIndex, centerScaled, onScaleChange, s]);

  const handleDragEnd = useCallback(() => {
    if (!scaleFactor || currentScale == null) return;
    const tolerance = isTouchDevice ? 0.15 : 0.1;
    if (Math.abs(currentScale - scaleFactor) <= tolerance) {
      onScaleComplete();
    }
  }, [scaleFactor, currentScale, isTouchDevice, onScaleComplete]);

  if (!originalVertices || originalVertices.length === 0) return null;

  const origColor = konvaTheme.shapeStroke || "#3B82F6";
  const targetColor = konvaTheme.shapeHighlight || "#00BF63";
  const transformColor = konvaTheme.shapeDilated || "#8B5CF6";
  const centerColor = konvaTheme.point || "#ef4444";
  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const labelBg = konvaTheme.labelBackground || "#ffffffcc";

  // Build points arrays
  const origPoints = originalVertices.map(s);
  const origFlat = origPoints.flatMap((v) => [v.x, v.y]);

  // L1: transformed shape
  const transPoints = transformedVertices.map(s);
  const transFlat = transPoints.flatMap((v) => [v.x, v.y]);

  // L2: target outline + current dragged shape
  const targPoints = targetVertices.map(s);
  const targFlat = targPoints.flatMap((v) => [v.x, v.y]);

  // L3-L5: dilated shape
  const dilPoints = dilatedVertices.map(s);
  const dilFlat = dilPoints.flatMap((v) => [v.x, v.y]);

  // L2: compute current drag shape vertices
  let dragPoints = [];
  let dragFlat = [];
  if (level === 2 && centerOfDilation && currentScale != null) {
    const center = centerOfDilation;
    dragPoints = originalVertices.map((v) => s({
      x: center.x + (v.x - center.x) * currentScale,
      y: center.y + (v.y - center.y) * currentScale,
    }));
    dragFlat = dragPoints.flatMap((v) => [v.x, v.y]);
  }

  // L2: handle position
  let handlePos = null;
  if (level === 2 && dragPoints.length > handleVertexIndex) {
    handlePos = dragPoints[handleVertexIndex];
  }

  // Side length labels for L3
  const renderSideLabels = () => {
    if (level !== 3 || labeledSideIndex == null) return null;
    const idx = labeledSideIndex;
    const next = (idx + 1) % originalVertices.length;

    const origMid = midpoint(s(originalVertices[idx]), s(originalVertices[next]));
    const dilMid = midpoint(s(dilatedVertices[idx]), s(dilatedVertices[next]));

    return (
      <>
        {/* Original side label */}
        <Rect
          x={origMid.x - 18} y={origMid.y - 10}
          width={36} height={20} fill={labelBg}
          cornerRadius={4} listening={false}
        />
        <Text
          x={origMid.x - 18} y={origMid.y - 8}
          width={36}
          text={String(originalSideLength)}
          fontSize={13 * Math.min(scaleX, scaleY)}
          fill={origColor}
          fontStyle="bold"
          align="center"
          listening={false}
        />
        {/* Dilated side label */}
        <Rect
          x={dilMid.x - 18} y={dilMid.y - 10}
          width={36} height={20} fill={labelBg}
          cornerRadius={4} listening={false}
        />
        <Text
          x={dilMid.x - 18} y={dilMid.y - 8}
          width={36}
          text={String(dilatedSideLength)}
          fontSize={13 * Math.min(scaleX, scaleY)}
          fill={transformColor}
          fontStyle="bold"
          align="center"
          listening={false}
        />
      </>
    );
  };

  // L4: dimension labels on original shape
  const renderDimensionLabel = () => {
    if (level !== 4 || !originalSideLength) return null;
    const idx = 0;
    const next = 1;
    const mid = midpoint(s(originalVertices[idx]), s(originalVertices[next]));

    return (
      <>
        <Rect
          x={mid.x - 18} y={mid.y - 10}
          width={36} height={20} fill={labelBg}
          cornerRadius={4} listening={false}
        />
        <Text
          x={mid.x - 18} y={mid.y - 8}
          width={36}
          text={String(originalSideLength)}
          fontSize={13 * Math.min(scaleX, scaleY)}
          fill={origColor}
          fontStyle="bold"
          align="center"
          listening={false}
        />
      </>
    );
  };

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Center of dilation */}
        {centerScaled && (
          <>
            <Circle
              x={centerScaled.x} y={centerScaled.y}
              radius={5 * Math.min(scaleX, scaleY)}
              fill={centerColor}
              listening={false}
            />
            <Text
              x={centerScaled.x + 8} y={centerScaled.y - 14}
              text="C"
              fontSize={14 * Math.min(scaleX, scaleY)}
              fontStyle="bold"
              fill={centerColor}
              listening={false}
            />
          </>
        )}

        {/* ===== L1: Original + Transformed ===== */}
        {level === 1 && (
          <>
            <Line
              points={origFlat}
              closed stroke={origColor}
              strokeWidth={3} listening={false}
            />
            <Line
              points={transFlat}
              closed stroke={transformColor}
              strokeWidth={3} dash={[8, 6]}
              listening={false}
            />
            {/* Vertex dots */}
            {origPoints.map((v, i) => (
              <Circle key={`ov-${i}`} x={v.x} y={v.y} radius={3} fill={origColor} listening={false} />
            ))}
            {transPoints.map((v, i) => (
              <Circle key={`tv-${i}`} x={v.x} y={v.y} radius={3} fill={transformColor} listening={false} />
            ))}
            {/* Labels */}
            <Text
              x={origPoints[0].x - 30} y={origPoints[0].y - 20}
              text="Original"
              fontSize={12 * Math.min(scaleX, scaleY)}
              fill={origColor}
              fontStyle="bold"
              listening={false}
            />
          </>
        )}

        {/* ===== L2: Original + Target outline + Drag shape ===== */}
        {level === 2 && (
          <>
            {/* Target outline (green dashed) */}
            <Line
              points={targFlat}
              closed stroke={targetColor}
              strokeWidth={2} dash={[10, 6]}
              opacity={0.6}
              listening={false}
            />
            {/* Target vertex dots */}
            {targPoints.map((v, i) => (
              <Circle key={`targ-${i}`} x={v.x} y={v.y} radius={3} fill={targetColor} opacity={0.5} listening={false} />
            ))}

            {/* Current drag shape */}
            {dragFlat.length > 0 && (
              <Line
                points={dragFlat}
                closed stroke={origColor}
                strokeWidth={3}
                listening={false}
              />
            )}
            {dragPoints.map((v, i) => (
              <Circle key={`dv-${i}`} x={v.x} y={v.y} radius={3} fill={origColor} listening={false} />
            ))}

            {/* Drag handle */}
            {handlePos && phase === "interact" && (
              <TouchDragHandle
                x={handlePos.x}
                y={handlePos.y}
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

        {/* ===== L3: Original + Dilated with labels ===== */}
        {level === 3 && (
          <>
            <Line
              points={origFlat}
              closed stroke={origColor}
              strokeWidth={3} listening={false}
            />
            <Line
              points={dilFlat}
              closed stroke={transformColor}
              strokeWidth={3} dash={[8, 6]}
              listening={false}
            />
            {origPoints.map((v, i) => (
              <Circle key={`o3-${i}`} x={v.x} y={v.y} radius={3} fill={origColor} listening={false} />
            ))}
            {dilPoints.map((v, i) => (
              <Circle key={`d3-${i}`} x={v.x} y={v.y} radius={3} fill={transformColor} listening={false} />
            ))}
            {renderSideLabels()}
          </>
        )}

        {/* ===== L4: Original with dimensions ===== */}
        {level === 4 && (
          <>
            <Line
              points={origFlat}
              closed stroke={origColor}
              strokeWidth={3} listening={false}
            />
            {dilFlat.length > 0 && (
              <Line
                points={dilFlat}
                closed stroke={transformColor}
                strokeWidth={3} dash={[8, 6]}
                opacity={0.4}
                listening={false}
              />
            )}
            {origPoints.map((v, i) => (
              <Circle key={`o4-${i}`} x={v.x} y={v.y} radius={3} fill={origColor} listening={false} />
            ))}
            {renderDimensionLabel()}
          </>
        )}

        {/* ===== L5: Reference shape ===== */}
        {level === 5 && (
          <>
            <Line
              points={origFlat}
              closed stroke={origColor}
              strokeWidth={3} listening={false}
            />
            {dilFlat.length > 0 && (
              <Line
                points={dilFlat}
                closed stroke={transformColor}
                strokeWidth={3} dash={[8, 6]}
                listening={false}
              />
            )}
            {origPoints.map((v, i) => (
              <Circle key={`o5-${i}`} x={v.x} y={v.y} radius={3} fill={origColor} listening={false} />
            ))}
            {dilPoints.map((v, i) => (
              <Circle key={`d5-${i}`} x={v.x} y={v.y} radius={3} fill={transformColor} listening={false} />
            ))}
          </>
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function DilationLesson({ triggerNewProblem }) {
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

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    educationalNote = "",
    scaleFactor,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = canvasWidth;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData.originalVertices?.[0]?.x || 0}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setCurrentScale(1);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setCurrentScale(1);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // Choice click handler (L1, L3, L4, L5)
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
    setCurrentScale(scaleFactor);
    setPhase("complete");
    revealAnswer();
  }, [scaleFactor, revealAnswer]);

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
        {level === 2 ? questionText : (level <= 1 ? levelInfo.instruction : questionText)}
      </InstructionText>

      {/* L2: Scale Factor Display */}
      {level === 2 && phase === "interact" && (
        <ScaleDisplay>Scale: {displayScale}x</ScaleDisplay>
      )}

      {/* Konva Diagram */}
      <CanvasWrapper>
        <DilationDiagram
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

      {/* ===== L4: Scale factor info text ===== */}
      {level === 4 && phase === "interact" && scaleFactor && (
        <ScaleInfoText>Scale factor: {scaleFactor}</ScaleInfoText>
      )}

      {/* ===== Choice Buttons (L1, L3, L4, L5) ===== */}
      {[1, 3, 4, 5].includes(level) && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid $twoColumn={level === 1}>
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

export default DilationLesson;

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

const ScaleInfoText = styled.p`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.info || "#3B82F6"};
  margin: 0 0 8px 0;
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
  flex-direction: ${(props) => (props.$twoColumn ? "row" : "column")};
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;
  ${(props) => props.$twoColumn && css`
    justify-content: center;
  `}
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
