import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line, Arc } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Learn the Pattern" },
  2: { title: "Leg Given" },
  3: { title: "Find the Missing Side" },
  4: { title: "Work Backwards" },
  5: { title: "Word Problems" },
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

const SIDE_COLORS = {
  leg: "#10B981",        // green (both legs same color — they're equal)
  hypotenuse: "#8B5CF6", // purple
};

const GRAY = "#9CA3AF";

// ==================== TRIANGLE COMPONENT ====================

function IsoscelesRightTriangle({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  if (!visualData) return null;

  const {
    leg = 5,
    hypotenuse = 7.1,
    givenSide,
    missingSide,
    showAllSides = true,
    showPattern = false,
  } = visualData;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const textColor = konvaTheme.labelText || "#333333";

  const padding = 40;

  // CRITICAL: Make triangle BIG (minimum 120px per side per VISUAL_DESIGN_RULES)
  const maxW = canvasWidth - padding * 2;
  const maxH = canvasHeight - padding * 2 - 40;
  const rawScale = Math.min(maxW / leg, maxH / leg);

  // Ensure each side is at least 120px after scaling
  const minSideLength = 120;
  const scale = Math.max(rawScale, minSideLength / leg);

  // Calculate scaled dimensions
  const scaledLeg = Math.max(leg * scale, minSideLength);

  // Center the triangle on canvas
  const triangleWidth = scaledLeg;
  const triangleHeight = scaledLeg;
  const startX = (canvasWidth - triangleWidth) / 2;
  const startY = (canvasHeight + triangleHeight) / 2 - 20;

  // Vertices: bottom-left (45° angle), bottom-right (90°), top-right (45°)
  const x1 = startX;                     // bottom-left
  const y1 = startY;
  const x2 = x1 + scaledLeg;             // bottom-right (right angle)
  const y2 = y1;
  const x3 = x2;                         // top-right (45°)
  const y3 = y1 - scaledLeg;

  // Colors — both legs get the same color to reinforce equality
  const legColor = (showAllSides || givenSide === "leg") ? SIDE_COLORS.leg : (missingSide === "leg" ? SIDE_COLORS.leg : GRAY);
  const hypColor = (showAllSides || givenSide === "hypotenuse") ? SIDE_COLORS.hypotenuse : (missingSide === "hypotenuse" ? SIDE_COLORS.hypotenuse : GRAY);

  const fontSize = Math.max(14, Math.min(18, canvasWidth / 30));

  // Side labels
  const leg1Label = showAllSides
    ? `Leg (${leg})`
    : givenSide === "leg" ? String(leg)
    : missingSide === "leg" ? "?"
    : String(leg);

  const leg2Label = showAllSides
    ? `Leg (${leg})`
    : givenSide === "leg" ? String(leg)
    : missingSide === "leg" ? "?"
    : String(leg);

  const hypLabel = showAllSides
    ? `Hyp (${hypotenuse})`
    : givenSide === "hypotenuse" ? String(hypotenuse)
    : missingSide === "hypotenuse" ? "?"
    : String(hypotenuse);

  // Right angle square at (x2, y2) - bigger for visibility
  const sz = 15;

  // Dynamic angle arcs (universal atan2 pattern — DYNAMIC_ANGLE_INDICATOR_SOLUTION.md)
  // 45° angle at bottom-left vertex (x1, y1)
  const theta1_bl = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const theta2_bl = Math.atan2(y3 - y1, x3 - x1) * (180 / Math.PI);
  const sweepBL = ((theta2_bl - theta1_bl) % 360 + 360) % 360;
  const arcAngleBL = sweepBL <= 180 ? sweepBL : 360 - sweepBL;
  const arcRotationBL = sweepBL <= 180 ? theta1_bl : theta2_bl;
  const d1_bl = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const d2_bl = Math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2);
  const arcRadiusBL = Math.min(d1_bl, d2_bl) * 0.2;

  // 45° angle at top-right vertex (x3, y3)
  const theta1_tr = Math.atan2(y2 - y3, x2 - x3) * (180 / Math.PI);
  const theta2_tr = Math.atan2(y1 - y3, x1 - x3) * (180 / Math.PI);
  const sweepTR = ((theta2_tr - theta1_tr) % 360 + 360) % 360;
  const arcAngleTR = sweepTR <= 180 ? sweepTR : 360 - sweepTR;
  const arcRotationTR = sweepTR <= 180 ? theta1_tr : theta2_tr;
  const d1_tr = Math.sqrt((x2 - x3) ** 2 + (y2 - y3) ** 2);
  const d2_tr = Math.sqrt((x1 - x3) ** 2 + (y1 - y3) ** 2);
  const arcRadiusTR = Math.min(d1_tr, d2_tr) * 0.2;

  // Dynamic label positions (at midpoint of arc, offset outward)
  const midAngleBLRad = (arcRotationBL + arcAngleBL / 2) * (Math.PI / 180);
  const labelBLX = x1 + Math.cos(midAngleBLRad) * (arcRadiusBL + 16);
  const labelBLY = y1 + Math.sin(midAngleBLRad) * (arcRadiusBL + 16);

  const midAngleTRRad = (arcRotationTR + arcAngleTR / 2) * (Math.PI / 180);
  const labelTRX = x3 + Math.cos(midAngleTRRad) * (arcRadiusTR + 16);
  const labelTRY = y3 + Math.sin(midAngleTRRad) * (arcRadiusTR + 16);

  // Hypotenuse label — rotated parallel to diagonal, offset outside triangle
  const hypAngle = Math.atan2(y3 - y1, x3 - x1) * (180 / Math.PI);
  const hypMidX = (x1 + x3) / 2;
  const hypMidY = (y1 + y3) / 2;
  const hypLen = Math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2);
  const hypPerpX = -(y3 - y1) / hypLen;
  const hypPerpY = (x3 - x1) / hypLen;
  const toRight = { x: x2 - hypMidX, y: y2 - hypMidY };
  const hypDot = hypPerpX * toRight.x + hypPerpY * toRight.y;
  const hypSign = hypDot > 0 ? -1 : 1;
  const hypLabelX = hypMidX + hypSign * hypPerpX * 18;
  const hypLabelY = hypMidY + hypSign * hypPerpY * 18;

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Leg 1 (bottom, horizontal) - thicker for visibility */}
        <Line points={[x1, y1, x2, y2]} stroke={legColor} strokeWidth={5} listening={false} />
        {/* Leg 2 (right, vertical) - thicker for visibility */}
        <Line points={[x2, y2, x3, y3]} stroke={legColor} strokeWidth={5} listening={false} />
        {/* Hypotenuse (diagonal) - thicker for visibility */}
        <Line points={[x1, y1, x3, y3]} stroke={hypColor} strokeWidth={5} listening={false} />

        {/* Right angle indicator at bottom-right (inside triangle) */}
        <Line
          points={[x2 - sz, y2, x2 - sz, y2 - sz, x2, y2 - sz]}
          stroke={textColor} strokeWidth={2} listening={false}
        />

        {/* 45° angle arc at bottom-left (dynamic atan2) */}
        <Arc
          x={x1} y={y1}
          innerRadius={0} outerRadius={arcRadiusBL}
          angle={arcAngleBL} rotation={arcRotationBL}
          fill="rgba(16, 185, 129, 0.15)"
          stroke={SIDE_COLORS.leg} strokeWidth={1.5}
          listening={false}
        />
        <Text
          x={labelBLX - 12} y={labelBLY - fontSize / 2}
          text="45°" fontSize={fontSize} fontStyle="bold"
          fill={textColor} listening={false}
        />

        {/* 45° angle arc at top-right (dynamic atan2) */}
        <Arc
          x={x3} y={y3}
          innerRadius={0} outerRadius={arcRadiusTR}
          angle={arcAngleTR} rotation={arcRotationTR}
          fill="rgba(16, 185, 129, 0.15)"
          stroke={SIDE_COLORS.leg} strokeWidth={1.5}
          listening={false}
        />
        <Text
          x={labelTRX - 12} y={labelTRY - fontSize / 2}
          text="45°" fontSize={fontSize} fontStyle="bold"
          fill={textColor} listening={false}
        />

        {/* Side labels */}
        {/* Leg 1 label (bottom) */}
        <Text
          x={(x1 + x2) / 2 - 25} y={y1 + 15}
          text={leg1Label} fontSize={fontSize} fontStyle="bold"
          fill={legColor} listening={false}
        />

        {/* Leg 2 label (right side) */}
        <Text
          x={x2 + 12} y={(y2 + y3) / 2 - fontSize / 2}
          text={leg2Label} fontSize={fontSize} fontStyle="bold"
          fill={legColor} listening={false}
        />

        {/* Hypotenuse label (rotated parallel to diagonal, outside triangle) */}
        <Text
          x={hypLabelX} y={hypLabelY}
          text={hypLabel} fontSize={fontSize} fontStyle="bold"
          fill={hypColor} rotation={hypAngle}
          offsetX={hypLabel.length * fontSize * 0.3}
          offsetY={fontSize / 2}
          listening={false}
        />

        {/* Pattern reference at bottom */}
        {showPattern && (
          <Text
            x={0} y={canvasHeight - 16}
            width={canvasWidth} align="center"
            text="45-45-90 Pattern:  leg = x    leg = x    hyp = x√2"
            fontSize={Math.max(9, fontSize - 3)}
            fill={GRAY} listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}

// ==================== CLICKABLE TRIANGLE (LEVEL 1) ====================

function ClickableTriangle({ visualData, konvaTheme, canvasWidth, canvasHeight, onSideClick, selectedSide, isCorrect }) {
  // CRITICAL: Hooks must be called before any early returns
  const [hoveredSide, setHoveredSide] = React.useState(null);

  if (!visualData) return null;

  const {
    leg = 5,
    hypotenuse = 7.1,
  } = visualData;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const textColor = konvaTheme.labelText || "#333333";

  const padding = 40;

  // CRITICAL: Ensure triangle is BIG for easy clicking
  // Minimum 120px per side (well above 80px minimum from VISUAL_DESIGN_RULES)
  const maxW = canvasWidth - padding * 2;
  const maxH = canvasHeight - padding * 2 - 40;
  const rawScale = Math.min(maxW / leg, maxH / leg);

  // Ensure each side is at least 120px after scaling
  const minSideLength = 120;
  const scale = Math.max(rawScale, minSideLength / leg);

  // Calculate scaled dimensions
  const scaledLeg = Math.max(leg * scale, minSideLength);

  // Center the triangle on canvas
  const triangleWidth = scaledLeg;
  const triangleHeight = scaledLeg;
  const startX = (canvasWidth - triangleWidth) / 2;
  const startY = (canvasHeight + triangleHeight) / 2 - 20;

  // Vertices - centered and large
  const x1 = startX;                    // bottom-left
  const y1 = startY;
  const x2 = x1 + scaledLeg;            // bottom-right (right angle)
  const y2 = y1;
  const x3 = x2;                         // top-right
  const y3 = y1 - scaledLeg;

  const fontSize = Math.max(14, Math.min(18, canvasWidth / 30));
  const sz = 15;

  // Touch-friendly hit area (30px for easy touching)
  const hitStrokeWidth = 30;

  // Colors with feedback
  const getLegColor = () => {
    if (selectedSide === "leg") {
      return isCorrect ? konvaTheme.pointHighlight || "#10B981" : konvaTheme.opposite || "#EF4444";
    }
    return SIDE_COLORS.leg;
  };

  const getHypColor = () => {
    if (selectedSide === "hypotenuse") {
      return isCorrect ? konvaTheme.pointHighlight || "#10B981" : konvaTheme.opposite || "#EF4444";
    }
    return SIDE_COLORS.hypotenuse;
  };

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* CRITICAL: Background must be first */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Hover glow for leg 1 */}
        {hoveredSide === "leg1" && !selectedSide && (
          <Line
            points={[x1, y1, x2, y2]}
            stroke={SIDE_COLORS.leg}
            strokeWidth={12}
            opacity={0.2}
            listening={false}
          />
        )}

        {/* Leg 1 (bottom, horizontal) - CLICKABLE */}
        <Line
          points={[x1, y1, x2, y2]}
          stroke={getLegColor()}
          strokeWidth={hoveredSide === "leg1" ? 8 : 5}
          listening={true}
          onClick={() => onSideClick("leg")}
          onTap={() => onSideClick("leg")}
          onMouseEnter={() => setHoveredSide("leg1")}
          onMouseLeave={() => setHoveredSide(null)}
          hitStrokeWidth={hitStrokeWidth}
          perfectDrawEnabled={false}
        />

        {/* Hover glow for leg 2 */}
        {hoveredSide === "leg2" && !selectedSide && (
          <Line
            points={[x2, y2, x3, y3]}
            stroke={SIDE_COLORS.leg}
            strokeWidth={12}
            opacity={0.2}
            listening={false}
          />
        )}

        {/* Leg 2 (right, vertical) - CLICKABLE */}
        <Line
          points={[x2, y2, x3, y3]}
          stroke={getLegColor()}
          strokeWidth={hoveredSide === "leg2" ? 8 : 5}
          listening={true}
          onClick={() => onSideClick("leg")}
          onTap={() => onSideClick("leg")}
          onMouseEnter={() => setHoveredSide("leg2")}
          onMouseLeave={() => setHoveredSide(null)}
          hitStrokeWidth={hitStrokeWidth}
          perfectDrawEnabled={false}
        />

        {/* Hover glow for hypotenuse */}
        {hoveredSide === "hypotenuse" && !selectedSide && (
          <Line
            points={[x1, y1, x3, y3]}
            stroke={SIDE_COLORS.hypotenuse}
            strokeWidth={12}
            opacity={0.2}
            listening={false}
          />
        )}

        {/* Hypotenuse (diagonal) - CLICKABLE */}
        <Line
          points={[x1, y1, x3, y3]}
          stroke={getHypColor()}
          strokeWidth={hoveredSide === "hypotenuse" ? 8 : 5}
          listening={true}
          onClick={() => onSideClick("hypotenuse")}
          onTap={() => onSideClick("hypotenuse")}
          onMouseEnter={() => setHoveredSide("hypotenuse")}
          onMouseLeave={() => setHoveredSide(null)}
          hitStrokeWidth={hitStrokeWidth}
          perfectDrawEnabled={false}
        />

        {/* Right angle indicator (inside triangle) */}
        <Line
          points={[x2 - sz, y2, x2 - sz, y2 - sz, x2, y2 - sz]}
          stroke={textColor} strokeWidth={2} listening={false}
        />

        {/* Side labels - larger and clearer */}
        <Text
          x={(x1 + x2) / 2 - 20} y={y1 + 20}
          text={`${leg}`} fontSize={fontSize} fontStyle="bold"
          fill={getLegColor()} listening={false}
        />

        <Text
          x={x2 + 20} y={(y2 + y3) / 2 - fontSize / 2}
          text={`${leg}`} fontSize={fontSize} fontStyle="bold"
          fill={getLegColor()} listening={false}
        />

        <Text
          x={(x1 + x3) / 2 - 25} y={(y1 + y3) / 2 - 25}
          text={`${hypotenuse}`} fontSize={fontSize} fontStyle="bold"
          fill={getHypColor()} listening={false}
        />
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function FortyFiveFortyFiveNinetyLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);
  const [isClickCorrect, setIsClickCorrect] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    educationalNote = "",
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || "")];
  }, [currentProblem?.answer, currentProblem?.acceptedAnswers]);

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];
  const isMCLevel = level <= 2 && visualData.interactionType !== "click";
  const isClickLevel = visualData.interactionType === "click";

  const canvasWidth = Math.min(windowWidth - 40, 500);
  const canvasHeight = canvasWidth * 0.65;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData?.leg || 0}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setSelectedSide(null);
    setIsClickCorrect(null);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setSelectedSide(null);
    setIsClickCorrect(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  const handleSideClick = useCallback((clickedSide) => {
    if (phase !== "interact") return;

    const correctSide = visualData.correctSide;
    const isCorrect = clickedSide === correctSide;

    setSelectedSide(clickedSide);
    setIsClickCorrect(isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 800);
    } else {
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setSelectedSide(null);
        setIsClickCorrect(null);
      }, 1000);
    }
  }, [phase, visualData, revealAnswer]);

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

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {!showAnswer && phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      <VisualSection>
        {visualData.interactionType === "click" ? (
          <ClickableTriangle
            visualData={visualData}
            konvaTheme={konvaTheme}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onSideClick={handleSideClick}
            selectedSide={selectedSide}
            isCorrect={isClickCorrect}
          />
        ) : (
          <IsoscelesRightTriangle
            visualData={visualData}
            konvaTheme={konvaTheme}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        )}
      </VisualSection>

      {showHint && hint && <HintBox>{hint}</HintBox>}

      {visualData.interactionType === "click" && wrongAttempts > 0 && selectedSide === null && (
        <FeedbackText $isWrong>Not quite — try clicking a different side!</FeedbackText>
      )}

      {isMCLevel && phase === "interact" && choices.length > 0 && visualData.interactionType !== "click" && (
        <ChooseSection>
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

      {!isMCLevel && !showAnswer && (
        <InteractionSection>
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter answer (e.g. 7.1)"
          />
        </InteractionSection>
      )}

      {isMCLevel && phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}

      {isClickLevel && phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}

      {!isMCLevel && !isClickLevel && showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default FortyFiveFortyFiveNinetyLesson;

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
  @media (min-width: 768px) { font-size: 22px; }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 12px;
`;

const QuestionText = styled.p`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0 auto;
  max-width: 600px;
  @media (min-width: 768px) { font-size: 20px; }
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  padding: 13px 20px;
  font-size: 16px;
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

  ${(props) => props.$correct && css`
    background-color: ${props.theme.colors.buttonSuccess}20;
    border-color: ${props.theme.colors.buttonSuccess};
    color: ${props.theme.colors.buttonSuccess};
    cursor: default;
  `}

  ${(props) => props.$wrong && css`
    animation: ${shakeAnim} 0.5s ease;
    background-color: ${props.theme.colors.danger || "#E53E3E"}15;
    border-color: ${props.theme.colors.danger || "#E53E3E"};
  `}

  ${(props) => props.$fadeOut && css`
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
    transition: all 0.4s ease;
  `}

  &:disabled { cursor: default; }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.$isWrong ? (props.theme.colors.danger || "#E53E3E") : props.theme.colors.buttonSuccess};
  margin: 0;
`;

const ExplanationSection = styled.div`
  width: 100%;
  max-width: 600px;
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
  &:hover { opacity: 0.9; }
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
  &:hover { background: ${(props) => props.theme.colors.hoverBackground}; }
  @media (max-width: 1024px) { top: 12px; right: 16px; padding: 6px 12px; font-size: 13px; }
  @media (max-width: 768px) { top: 10px; right: 12px; padding: 5px 10px; font-size: 12px; }
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
  margin-bottom: 12px;
`;
