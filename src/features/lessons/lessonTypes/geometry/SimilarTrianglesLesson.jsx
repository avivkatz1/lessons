import React, { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Line, Circle, Rect, Text, Arc } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Are These Similar?", instruction: "Are these two triangles similar?" },
  2: { title: "Find the Match", instruction: "Tap the triangle that is similar to the one above." },
  3: { title: "Scale Factor", instruction: "What is the scale factor from the smaller to the larger?" },
  4: { title: "Missing Side", instruction: "" }, // dynamic from question
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

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Compute angle arc parameters for a vertex.
 * Returns { startAngle, sweepAngle } in degrees for Konva Arc.
 */
function computeArcParams(prev, curr, next) {
  const dx1 = prev.x - curr.x;
  const dy1 = prev.y - curr.y;
  const dx2 = next.x - curr.x;
  const dy2 = next.y - curr.y;
  const angle1 = Math.atan2(dy1, dx1) * (180 / Math.PI);
  const angle2 = Math.atan2(dy2, dx2) * (180 / Math.PI);

  let start = angle1;
  let end = angle2;
  // Normalize to get the interior angle arc
  let sweep = end - start;
  if (sweep < 0) sweep += 360;
  if (sweep > 180) {
    start = angle2;
    sweep = 360 - sweep;
  }
  return { startAngle: start, sweepAngle: sweep };
}

// ==================== TRIANGLE RENDERER ====================

function renderTriangle({
  vertices, angles, konvaTheme, scaleX, scaleY, s,
  strokeColor, strokeWidth = 3, dashed = false,
  showAngles = false, angleRadius = 20,
  keyPrefix = "tri",
}) {
  if (!vertices || vertices.length < 3) return null;

  const scaled = vertices.map(s);
  const flat = scaled.flatMap((v) => [v.x, v.y]);
  const dotColor = konvaTheme.point || "#ef4444";

  return (
    <React.Fragment key={keyPrefix}>
      {/* Triangle shape */}
      <Line
        points={flat}
        closed
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={dashed ? [8, 6] : undefined}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />

      {/* Vertex dots */}
      {scaled.map((v, i) => (
        <Circle
          key={`${keyPrefix}-v-${i}`}
          x={v.x} y={v.y}
          radius={3}
          fill={dotColor}
          listening={false}
        />
      ))}

      {/* Angle arcs */}
      {showAngles && angles && scaled.map((v, i) => {
        const prev = scaled[(i + 2) % 3];
        const next = scaled[(i + 1) % 3];
        const { startAngle, sweepAngle } = computeArcParams(prev, v, next);
        const r = angleRadius * Math.min(scaleX, scaleY);
        return (
          <React.Fragment key={`${keyPrefix}-arc-${i}`}>
            <Arc
              x={v.x} y={v.y}
              innerRadius={r}
              outerRadius={r}
              angle={sweepAngle}
              rotation={startAngle}
              stroke={strokeColor}
              strokeWidth={1.5}
              opacity={0.6}
              listening={false}
            />
            {/* Angle label */}
            {angles[i] && (
              <Text
                x={v.x + (r + 8) * Math.cos(((startAngle + sweepAngle / 2) * Math.PI) / 180) - 10}
                y={v.y + (r + 8) * Math.sin(((startAngle + sweepAngle / 2) * Math.PI) / 180) - 6}
                text={`${angles[i]}°`}
                fontSize={10 * Math.min(scaleX, scaleY)}
                fill={strokeColor}
                opacity={0.8}
                listening={false}
              />
            )}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

// ==================== DIAGRAM COMPONENT ====================

function SimilarTrianglesDiagram({
  visualData,
  konvaTheme,
  canvasWidth,
  canvasHeight,
  phase,
  highlightedIndex,
  flashIndex,
  onCandidateTap,
}) {
  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / 400;
  const s = useCallback((v) => ({ x: v.x * scaleX, y: v.y * scaleY }), [scaleX, scaleY]);

  const {
    level,
    triangleA,
    triangleB,
    candidates,
    labeledSideIndex,
    sideA,
    sideB,
    knownSideIndex,
    missingSideIndex,
    knownSideA,
    knownSideB,
    missingSideA,
  } = visualData;

  const origColor = konvaTheme.shapeStroke || "#3B82F6";
  const secondColor = konvaTheme.shapeDilated || "#8B5CF6";
  const highlightColor = konvaTheme.shapeHighlight || "#00BF63";
  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const labelBg = konvaTheme.labelBackground || "#ffffffcc";

  // Side label helper
  const renderSideLabel = (v1, v2, text, color, keyPfx) => {
    const mid = midpoint(v1, v2);
    const w = Math.max(30, String(text).length * 9);
    return (
      <React.Fragment key={`${keyPfx}-lbl`}>
        <Rect
          x={mid.x - w / 2} y={mid.y - 10}
          width={w} height={20} fill={labelBg}
          cornerRadius={4} listening={false}
        />
        <Text
          x={mid.x - w / 2} y={mid.y - 8}
          width={w}
          text={String(text)}
          fontSize={13 * Math.min(scaleX, scaleY)}
          fill={color}
          fontStyle="bold"
          align="center"
          listening={false}
        />
      </React.Fragment>
    );
  };

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* ===== L1: Two triangles side by side ===== */}
        {level === 1 && triangleA && triangleB && (
          <>
            {renderTriangle({
              vertices: triangleA.vertices, angles: triangleA.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: origColor, showAngles: true, keyPrefix: "triA",
            })}
            {renderTriangle({
              vertices: triangleB.vertices, angles: triangleB.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: secondColor, showAngles: true, keyPrefix: "triB",
            })}
            {/* Labels */}
            <Text
              x={80 * scaleX} y={80 * scaleY}
              text="A" fontSize={16 * Math.min(scaleX, scaleY)}
              fill={origColor} fontStyle="bold" listening={false}
            />
            <Text
              x={240 * scaleX} y={80 * scaleY}
              text="B" fontSize={16 * Math.min(scaleX, scaleY)}
              fill={secondColor} fontStyle="bold" listening={false}
            />
          </>
        )}

        {/* ===== L2: Reference + 4 candidate grid ===== */}
        {level === 2 && triangleA && candidates && (
          <>
            {/* Reference triangle at top */}
            {renderTriangle({
              vertices: triangleA.vertices, angles: triangleA.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: origColor, showAngles: true, keyPrefix: "ref",
            })}
            <Text
              x={160 * scaleX} y={30 * scaleY}
              text="Reference" fontSize={13 * Math.min(scaleX, scaleY)}
              fill={origColor} fontStyle="bold" listening={false}
            />

            {/* Divider line */}
            <Line
              points={[0, 170 * scaleY, canvasWidth, 170 * scaleY]}
              stroke={origColor + "30"}
              strokeWidth={1} dash={[4, 4]} listening={false}
            />

            {/* 4 candidates in grid */}
            {candidates.map((cand, idx) => {
              let color = secondColor;
              if (highlightedIndex === idx) color = highlightColor;
              if (flashIndex === idx) color = "#EF4444";

              return (
                <React.Fragment key={`cand-${idx}`}>
                  {renderTriangle({
                    vertices: cand.vertices, angles: cand.angles,
                    konvaTheme, scaleX, scaleY, s,
                    strokeColor: color,
                    strokeWidth: (highlightedIndex === idx || flashIndex === idx) ? 4 : 3,
                    showAngles: true, angleRadius: 14,
                    keyPrefix: `cand-${idx}`,
                  })}
                </React.Fragment>
              );
            })}

            {/* Tap targets for candidates (invisible rects over each quadrant of bottom area) */}
            {phase === "interact" && onCandidateTap && candidates.map((_, idx) => {
              const col = idx % 2;
              const row = Math.floor(idx / 2);
              return (
                <Rect
                  key={`tap-${idx}`}
                  x={col * canvasWidth / 2}
                  y={170 * scaleY + row * ((canvasHeight - 170 * scaleY) / 2)}
                  width={canvasWidth / 2}
                  height={(canvasHeight - 170 * scaleY) / 2}
                  fill="transparent"
                  onTap={() => onCandidateTap(idx)}
                  onClick={() => onCandidateTap(idx)}
                />
              );
            })}
          </>
        )}

        {/* ===== L3: Two similar triangles with side labels ===== */}
        {level === 3 && triangleA && triangleB && (
          <>
            {renderTriangle({
              vertices: triangleA.vertices, angles: triangleA.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: origColor, showAngles: true, keyPrefix: "triA3",
            })}
            {renderTriangle({
              vertices: triangleB.vertices, angles: triangleB.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: secondColor, showAngles: true, keyPrefix: "triB3",
            })}
            {/* Side length labels */}
            {labeledSideIndex != null && sideA != null && sideB != null && (() => {
              const idx = labeledSideIndex;
              const nextIdx = (idx + 1) % 3;
              const sA1 = s(triangleA.vertices[idx]);
              const sA2 = s(triangleA.vertices[nextIdx]);
              const sB1 = s(triangleB.vertices[idx]);
              const sB2 = s(triangleB.vertices[nextIdx]);
              return (
                <>
                  {renderSideLabel(sA1, sA2, sideA, origColor, "sideA3")}
                  {renderSideLabel(sB1, sB2, sideB, secondColor, "sideB3")}
                </>
              );
            })()}
          </>
        )}

        {/* ===== L4: Two triangles with known sides + missing side ===== */}
        {level === 4 && triangleA && triangleB && (
          <>
            {renderTriangle({
              vertices: triangleA.vertices, angles: triangleA.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: origColor, showAngles: true, keyPrefix: "triA4",
            })}
            {renderTriangle({
              vertices: triangleB.vertices, angles: triangleB.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: secondColor, showAngles: true, keyPrefix: "triB4",
            })}
            {/* Known corresponding sides */}
            {knownSideIndex != null && (() => {
              const idx = knownSideIndex;
              const nextIdx = (idx + 1) % 3;
              return (
                <>
                  {renderSideLabel(s(triangleA.vertices[idx]), s(triangleA.vertices[nextIdx]), knownSideA, origColor, "knA4")}
                  {renderSideLabel(s(triangleB.vertices[idx]), s(triangleB.vertices[nextIdx]), knownSideB, secondColor, "knB4")}
                </>
              );
            })()}
            {/* Missing side: labeled on A, "?" on B */}
            {missingSideIndex != null && (() => {
              const idx = missingSideIndex;
              const nextIdx = (idx + 1) % 3;
              return (
                <>
                  {renderSideLabel(s(triangleA.vertices[idx]), s(triangleA.vertices[nextIdx]), missingSideA, origColor, "msA4")}
                  {renderSideLabel(s(triangleB.vertices[idx]), s(triangleB.vertices[nextIdx]), "?", secondColor, "msB4")}
                </>
              );
            })()}
          </>
        )}

        {/* ===== L5: Reference triangles ===== */}
        {level === 5 && triangleA && triangleB && (
          <>
            {renderTriangle({
              vertices: triangleA.vertices, angles: triangleA.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: origColor, showAngles: false, keyPrefix: "triA5",
            })}
            {renderTriangle({
              vertices: triangleB.vertices, angles: triangleB.angles,
              konvaTheme, scaleX, scaleY, s,
              strokeColor: secondColor, showAngles: false, keyPrefix: "triB5",
            })}
          </>
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function SimilarTrianglesLesson({ triggerNewProblem }) {
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

  // L2: tap state
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [flashIndex, setFlashIndex] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    educationalNote = "",
    correctIndex,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = level === 2 ? Math.min(windowWidth - 40, 460) : canvasWidth;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData.triangleA?.vertices?.[0]?.x || 0}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setHighlightedIndex(null);
    setFlashIndex(null);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setHighlightedIndex(null);
    setFlashIndex(null);
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

  // L2: Tap candidate
  const handleCandidateTap = useCallback((idx) => {
    if (phase !== "interact" || highlightedIndex !== null) return;

    if (idx === correctIndex) {
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
  }, [phase, correctIndex, highlightedIndex, revealAnswer]);

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

      {/* Konva Diagram */}
      <CanvasWrapper>
        <SimilarTrianglesDiagram
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          phase={phase}
          highlightedIndex={highlightedIndex}
          flashIndex={flashIndex}
          onCandidateTap={handleCandidateTap}
        />
      </CanvasWrapper>

      {/* L2: Tap instruction during interact */}
      {level === 2 && phase === "interact" && (
        <TapSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && flashIndex === null && (
            <FeedbackText $isWrong>Not that one — try again!</FeedbackText>
          )}
          <TapInstruction>Tap the similar triangle above</TapInstruction>
        </TapSection>
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

export default SimilarTrianglesLesson;

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
