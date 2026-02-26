import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line, Arc } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Pick the Inverse Function" },
  2: { title: "Set Up the Expression" },
  3: { title: "Find the Angle" },
  4: { title: "Find the Angle (Rotated)" },
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

// ==================== TRIANGLE COMPONENT ====================

function InverseTrigTriangle({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  const { sides, angle, rightAngle, orientation } = visualData;
  if (!sides) return null;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const textColor = konvaTheme.labelText || "#333333";
  const GRAY = "#9CA3AF";

  const padding = 50;
  const adjacentLength = sides?.adjacent?.length || 10;
  const oppositeLength = sides?.opposite?.length || 8;

  // Scale triangle to fit canvas
  const maxW = canvasWidth - padding * 2;
  const maxH = canvasHeight - padding * 2;
  const scaleX = maxW / adjacentLength;
  const scaleY = maxH / oppositeLength;
  const scale = Math.min(scaleX, scaleY, 20);

  // Calculate vertices based on orientation
  const pos = orientation || "bottom-left";
  let x1, y1, x2, y2, x3, y3;

  if (pos === "bottom-right") {
    x1 = canvasWidth - padding;
    y1 = canvasHeight - padding;
    x2 = x1 - adjacentLength * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 - oppositeLength * scale;
  } else if (pos === "top-left") {
    x1 = padding;
    y1 = padding;
    x2 = x1 + adjacentLength * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 + oppositeLength * scale;
  } else if (pos === "top-right") {
    x1 = canvasWidth - padding;
    y1 = padding;
    x2 = x1 - adjacentLength * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 + oppositeLength * scale;
  } else {
    // bottom-left (default)
    x1 = padding;
    y1 = canvasHeight - padding;
    x2 = x1 + adjacentLength * scale;
    y2 = y1;
    x3 = x2;
    y3 = y1 - oppositeLength * scale;
  }

  const oppColor = sides.opposite?.color || GRAY;
  const adjColor = sides.adjacent?.color || GRAY;
  const hypColor = sides.hypotenuse?.color || GRAY;

  // Calculate arc for the angle
  const arcRadius = Math.min(Math.min(adjacentLength, oppositeLength) * scale * 0.3, 40);
  let arcRotation = 0;
  let arcAngle = angle?.value || 0;
  if (pos === "bottom-left") arcRotation = -arcAngle;
  else if (pos === "bottom-right") arcRotation = 180;
  else if (pos === "top-left") arcRotation = 0;
  else if (pos === "top-right") arcRotation = 180 - arcAngle;

  const fontSize = Math.max(11, Math.min(14, canvasWidth / 38));

  // Label positions
  const oppMidX = x3 + (pos === "bottom-left" || pos === "top-left" ? 15 : -35);
  const oppMidY = (y2 + y3) / 2;
  const adjMidX = (x1 + x2) / 2;
  const adjMidY = y1 + (pos === "bottom-left" || pos === "bottom-right" ? 18 : -18);
  const hypMidX = (x1 + x3) / 2 + (pos === "bottom-left" || pos === "top-left" ? -30 : 10);
  const hypMidY = (y1 + y3) / 2;

  const sideText = (side) => {
    if (side.label && (side.label === "?" || side.label === "x" || side.label === "Opposite" || side.label === "Adjacent" || side.label === "Hypotenuse")) {
      return side.showLength ? `${side.label} (${side.length})` : side.label;
    }
    if (side.showLength) return String(side.length);
    return "";
  };

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Adjacent side (horizontal) */}
        <Line points={[x1, y1, x2, y2]} stroke={adjColor} strokeWidth={3} listening={false} />
        {/* Opposite side (vertical) */}
        <Line points={[x2, y2, x3, y3]} stroke={oppColor} strokeWidth={3} listening={false} />
        {/* Hypotenuse */}
        <Line points={[x1, y1, x3, y3]} stroke={hypColor} strokeWidth={3} listening={false} />

        {/* Right angle indicator */}
        {rightAngle && (
          <>
            {(() => {
              const sz = 12;
              const dx1 = x1 < x2 ? -sz : sz;
              const dy1 = y3 < y2 ? -sz : sz;
              return (
                <Line
                  points={[x2 + dx1, y2, x2 + dx1, y2 + dy1, x2, y2 + dy1]}
                  stroke={textColor}
                  strokeWidth={1.5}
                  listening={false}
                />
              );
            })()}
          </>
        )}

        {/* Angle arc at vertex (x1, y1) */}
        {angle?.showValue && (
          <Arc
            x={x1} y={y1}
            innerRadius={0} outerRadius={arcRadius}
            angle={arcAngle} rotation={arcRotation}
            fill={`${oppColor}20`} stroke={oppColor} strokeWidth={1.5}
            listening={false}
          />
        )}

        {/* Angle label */}
        {angle?.label && (
          <Text
            x={x1 + (pos === "bottom-left" || pos === "top-left" ? arcRadius + 8 : -arcRadius - 35)}
            y={y1 + (pos === "bottom-left" || pos === "bottom-right" ? -arcRadius - 18 : arcRadius + 4)}
            text={angle.label}
            fontSize={fontSize + 1}
            fontStyle="bold"
            fill={textColor}
            listening={false}
          />
        )}

        {/* Side labels */}
        {sideText(sides.opposite) && (
          <Text x={oppMidX} y={oppMidY - fontSize / 2} text={sideText(sides.opposite)} fontSize={fontSize} fontStyle="bold" fill={oppColor} listening={false} />
        )}
        {sideText(sides.adjacent) && (
          <Text x={adjMidX - 15} y={adjMidY} text={sideText(sides.adjacent)} fontSize={fontSize} fontStyle="bold" fill={adjColor} listening={false} />
        )}
        {sideText(sides.hypotenuse) && (
          <Text x={hypMidX} y={hypMidY - fontSize / 2} text={sideText(sides.hypotenuse)} fontSize={fontSize} fontStyle="bold" fill={hypColor} listening={false} />
        )}

        {/* Inverse trig reference */}
        <Text
          x={0} y={canvasHeight - 16}
          width={canvasWidth} align="center"
          text={"sin\u207B\u00B9 = arcsin    cos\u207B\u00B9 = arccos    tan\u207B\u00B9 = arctan"}
          fontSize={Math.max(9, fontSize - 3)}
          fill={GRAY} listening={false}
        />
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function InverseTrigLesson({ triggerNewProblem }) {
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
  const isMCLevel = level <= 2;

  const canvasWidth = Math.min(windowWidth - 40, 500);
  const canvasHeight = canvasWidth * 0.6;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData?.angle?.value || 0}`;
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
        <InverseTrigTriangle
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </VisualSection>

      {showHint && hint && <HintBox>{hint}</HintBox>}

      {isMCLevel && phase === "interact" && choices.length > 0 && (
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
            placeholder="Enter angle in degrees (e.g. 45)"
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

      {!isMCLevel && showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default InverseTrigLesson;

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
