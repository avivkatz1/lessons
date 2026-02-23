import React, { useState, useMemo, useCallback, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Line, Arc, Circle, Text, Rect } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Find the Vertex", instruction: "Which point is where the two rays meet?" },
  2: { title: "Identify the Angle", instruction: "Which region shows the angle between the rays?" },
  3: { title: "Classify the Angle", instruction: "Is this angle acute, right, obtuse, or straight?" },
  4: { title: "Estimate the Angle", instruction: "How many degrees is this angle?" },
  5: { title: "Make the Angle", instruction: "Drag the ray to create the target angle" },
};

// Colors for L2 regions
const REGION_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"];

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

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// ==================== ANGLE DIAGRAM COMPONENT ====================

function AngleDiagram({
  level,
  angleSize,
  ray1Angle = 0,
  ray2Angle,
  points,
  regions,
  showDegreeLabel,
  konvaTheme,
  canvasWidth,
  canvasHeight,
  // L5 drag props
  dragAngle,
  onDragMove,
  targetRange,
  phase,
}) {
  const cx = canvasWidth / 2;
  const cy = canvasHeight * 0.6;
  const rayLen = Math.min(canvasWidth, canvasHeight) * 0.38;
  const arcRadius = rayLen * 0.3;

  // For L5 drag mode, use dragAngle instead of ray2Angle
  const effectiveRay2 = level === 5 ? (dragAngle || 45) : (ray2Angle || angleSize || 60);
  const effectiveAngle = level === 5 ? (dragAngle || 45) : (angleSize || 60);

  // Calculate ray endpoints
  const ray1End = {
    x: cx + rayLen * Math.cos(toRad(ray1Angle)),
    y: cy - rayLen * Math.sin(toRad(ray1Angle)),
  };
  const ray2End = {
    x: cx + rayLen * Math.cos(toRad(effectiveRay2)),
    y: cy - rayLen * Math.sin(toRad(effectiveRay2)),
  };

  // Arc color
  const baseArcColor = konvaTheme.angle || "#F59E0B";
  let arcFill = baseArcColor + "40";
  let arcStroke = baseArcColor;

  // L5: color feedback
  if (level === 5 && targetRange && dragAngle != null) {
    const inRange = dragAngle >= targetRange[0] && dragAngle <= targetRange[1];
    if (inRange) {
      arcFill = (konvaTheme.shapeHighlight || "#00BF63") + "40";
      arcStroke = konvaTheme.shapeHighlight || "#00BF63";
    }
  }

  // Konva Arc: rotation is clockwise from 3 o'clock (positive x-axis)
  // We want the arc to go from ray1Angle to effectiveRay2 (counter-clockwise in math)
  // In Konva: rotation = -effectiveRay2 (to start at ray2), angle = effectiveAngle (sweep CCW in math = CW in Konva display)
  // Actually: Konva rotation is CW from right. If we draw from ray1 to ray2 (CCW in math),
  // we set rotation = -ray1Angle (Konva CW) and sweep = effectiveAngle.
  // But Konva Arc draws CW, so to get CCW visual we need: rotation = -effectiveRay2, angle = effectiveAngle.
  // This makes the arc go from ray2 position clockwise (visually upward) to ray1.

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground || "#ffffff"} />

        {/* L2: Draw colored regions */}
        {level === 2 && regions && regions.map((r, i) => {
          const regionColor = r.color || REGION_COLORS[i % REGION_COLORS.length];
          return (
            <Arc
              key={i}
              x={cx}
              y={cy}
              innerRadius={0}
              outerRadius={arcRadius + 10 + i * 4}
              angle={r.sweepAngle}
              rotation={-r.endAngle}
              fill={regionColor + "35"}
              stroke={regionColor}
              strokeWidth={2}
            />
          );
        })}

        {/* Main angle arc (L1, L3, L4, L5) */}
        {level !== 2 && (
          <Arc
            x={cx}
            y={cy}
            innerRadius={0}
            outerRadius={arcRadius}
            angle={effectiveAngle}
            rotation={-effectiveRay2}
            fill={arcFill}
            stroke={arcStroke}
            strokeWidth={2}
          />
        )}

        {/* Ray 1 */}
        <Line
          points={[cx, cy, ray1End.x, ray1End.y]}
          stroke={konvaTheme.shapeStroke || "#000000"}
          strokeWidth={3}
          lineCap="round"
        />

        {/* Ray 2 */}
        <Line
          points={[cx, cy, ray2End.x, ray2End.y]}
          stroke={konvaTheme.shapeStroke || "#000000"}
          strokeWidth={3}
          lineCap="round"
        />

        {/* Vertex dot */}
        <Circle
          x={cx}
          y={cy}
          radius={5}
          fill={konvaTheme.point || "#ef4444"}
          stroke={konvaTheme.shapeStroke || "#000000"}
          strokeWidth={1}
        />

        {/* L1: Labeled points */}
        {level === 1 && points && points.map((p) => {
          // Scale point positions relative to canvas
          const px = (p.x / 400) * canvasWidth;
          const py = (p.y / 320) * canvasHeight;
          return (
            <React.Fragment key={p.label}>
              <Circle
                x={px}
                y={py}
                radius={8}
                fill={p.isVertex ? (konvaTheme.point || "#ef4444") : (konvaTheme.shapeStroke || "#000000")}
                stroke={konvaTheme.shapeStroke || "#000000"}
                strokeWidth={1}
              />
              <Text
                x={px + 12}
                y={py - 10}
                text={p.label}
                fill={konvaTheme.labelText || "#000000"}
                fontSize={18}
                fontStyle="bold"
              />
            </React.Fragment>
          );
        })}

        {/* L2: Region labels */}
        {level === 2 && regions && regions.map((r, i) => {
          const midAngle = r.startAngle + r.sweepAngle / 2;
          const labelR = arcRadius + 30 + i * 4;
          const lx = cx + labelR * Math.cos(toRad(midAngle));
          const ly = cy - labelR * Math.sin(toRad(midAngle));
          const regionColor = r.color || REGION_COLORS[i % REGION_COLORS.length];
          return (
            <Text
              key={`label-${i}`}
              x={lx - 25}
              y={ly - 8}
              text={r.label}
              fill={regionColor}
              fontSize={14}
              fontStyle="bold"
            />
          );
        })}

        {/* L3: Degree label */}
        {level === 3 && showDegreeLabel && (
          <Text
            x={cx + arcRadius * 0.7 * Math.cos(toRad(effectiveAngle / 2)) - 15}
            y={cy - arcRadius * 0.7 * Math.sin(toRad(effectiveAngle / 2)) - 10}
            text={`${effectiveAngle}°`}
            fill={konvaTheme.angle || "#F59E0B"}
            fontSize={20}
            fontStyle="bold"
          />
        )}

        {/* L5: Live angle readout */}
        {level === 5 && dragAngle != null && (
          <Text
            x={cx + arcRadius * 0.6 * Math.cos(toRad(dragAngle / 2)) - 15}
            y={cy - arcRadius * 0.6 * Math.sin(toRad(dragAngle / 2)) - 10}
            text={`${Math.round(dragAngle)}°`}
            fill={
              targetRange && dragAngle >= targetRange[0] && dragAngle <= targetRange[1]
                ? (konvaTheme.shapeHighlight || "#00BF63")
                : (konvaTheme.angle || "#F59E0B")
            }
            fontSize={20}
            fontStyle="bold"
          />
        )}

        {/* L5: Draggable handle on ray2 endpoint */}
        {level === 5 && phase === "drag" && (
          <Circle
            x={ray2End.x}
            y={ray2End.y}
            radius={14}
            fill={konvaTheme.point || "#ef4444"}
            stroke={konvaTheme.shapeStroke || "#000000"}
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const stage = e.target.getStage();
              const pos = stage.getPointerPosition();
              if (!pos) return;
              const dx = pos.x - cx;
              const dy = -(pos.y - cy);
              let angle = toDeg(Math.atan2(dy, dx));
              if (angle < 0) angle += 360;
              angle = Math.min(179, Math.max(1, angle));
              // Snap the circle to the arc of fixed radius
              const snapX = cx + rayLen * Math.cos(toRad(angle));
              const snapY = cy - rayLen * Math.sin(toRad(angle));
              e.target.x(snapX);
              e.target.y(snapY);
              if (onDragMove) onDragMove(angle);
            }}
          />
        )}

        {/* L5: Drag affordance ring (when not yet dragging) */}
        {level === 5 && phase === "drag" && (
          <Circle
            x={ray2End.x}
            y={ray2End.y}
            radius={20}
            stroke={konvaTheme.point || "#ef4444"}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function AnglesLesson({ triggerNewProblem }) {
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
  const [phase, setPhase] = useState("choose"); // "choose" | "drag" | "complete"
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);
  const [dragAngle, setDragAngle] = useState(45);
  const [dragFeedback, setDragFeedback] = useState("");

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    angleSize = 60,
    ray1Angle = 0,
    ray2Angle = 60,
    points: rawPoints = null,
    regions: rawRegions = null,
    showDegreeLabel = false,
    angleType = "",
    targetType = "",
    targetRange: rawTargetRange = null,
    instruction = "",
    choices: rawChoices = null,
    educationalNote = "",
  } = visualData;

  const points = rawPoints || [];
  const regions = rawRegions || [];
  const choices = rawChoices || [];
  const targetRange = rawTargetRange || [10, 80];
  const hint = currentProblem?.hint || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = Math.min(canvasWidth * 0.8, 300);

  // Reset on problem change
  const problemKey = `${angleSize}-${level}-${currentQuestionIndex}-${targetType}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase(level === 5 ? "drag" : "choose");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setDragAngle(45);
    setDragFeedback("");
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase(level === 5 ? "drag" : "choose");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setDragAngle(45);
    setDragFeedback("");
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem, level]);

  const handleChoiceClick = useCallback((choice, idx) => {
    if (phase !== "choose" || shakingIdx !== null) return;

    if (choice.correct) {
      setSelectedChoice(idx);
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 800);
    } else {
      setShakingIdx(idx);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setShakingIdx(null);
      }, 600);
    }
  }, [phase, shakingIdx, revealAnswer]);

  const handleDragMove = useCallback((angle) => {
    setDragAngle(angle);
    setDragFeedback("");
  }, []);

  const handleCheckDrag = useCallback(() => {
    if (dragAngle >= targetRange[0] && dragAngle <= targetRange[1]) {
      setPhase("complete");
      revealAnswer();
    } else {
      let type = "an acute";
      if (dragAngle >= 85 && dragAngle <= 95) type = "a right";
      else if (dragAngle > 95) type = "an obtuse";
      setDragFeedback(`That's ${Math.round(dragAngle)}° — ${type} angle. Try again!`);
      setWrongAttempts((prev) => prev + 1);
    }
  }, [dragAngle, targetRange, revealAnswer]);

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
        {level === 5 ? instruction : levelInfo.instruction}
      </InstructionText>

      {/* Konva Angle Diagram */}
      <CanvasWrapper>
        <AngleDiagram
          level={level}
          angleSize={angleSize}
          ray1Angle={ray1Angle}
          ray2Angle={ray2Angle}
          points={points}
          regions={regions}
          showDegreeLabel={showDegreeLabel}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          dragAngle={dragAngle}
          onDragMove={handleDragMove}
          targetRange={targetRange}
          phase={phase}
        />
      </CanvasWrapper>

      {/* Phase: Choose (L1-L4) */}
      {phase === "choose" && choices.length > 0 && (
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
                  {level === 2 && (
                    <ColorDot $color={regions[idx]?.color || REGION_COLORS[idx % REGION_COLORS.length]} />
                  )}
                  {choice.text}
                  {isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Phase: Drag (L5) */}
      {phase === "drag" && (
        <DragSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}

          <DragInstruction>
            Drag the red handle to form the angle
          </DragInstruction>

          {dragFeedback && (
            <FeedbackText $isWrong>{dragFeedback}</FeedbackText>
          )}

          <CheckButton onClick={handleCheckDrag}>
            Check My Angle
          </CheckButton>
        </DragSection>
      )}

      {/* Phase: Complete */}
      {phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>

          <EducationalNote>
            {educationalNote}
          </EducationalNote>

          {level === 3 && (
            <AngleDetail>
              This {angleSize}° angle is <strong>{angleType.toLowerCase()}</strong>.
            </AngleDetail>
          )}

          {level === 4 && (
            <AngleDetail>
              This angle is <strong>{angleSize}°</strong>.
            </AngleDetail>
          )}

          {level === 5 && (
            <AngleDetail>
              You made a <strong>{Math.round(dragAngle)}°</strong> angle — that's{" "}
              <strong>{targetType}</strong>!
            </AngleDetail>
          )}

          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default AnglesLesson;

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

const ColorDot = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  flex-shrink: 0;
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

const DragSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const DragInstruction = styled.p`
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

const AngleDetail = styled.p`
  font-size: 17px;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: "Georgia", serif;
  margin: 0;

  strong {
    color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }
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
