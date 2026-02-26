import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Learn the Triples" },
  2: { title: "Identify from Two Sides" },
  3: { title: "Find the Missing Side" },
  4: { title: "Multiples of Triples" },
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

function RightTriangle({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  if (!visualData || !visualData.triangle) return null;

  const {
    triangle: { sideA, sideB, sideC, hiddenSide },
    showAllSides = false,
    vertices,
    level = 1,
    notToScale = false,
  } = visualData;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const textColor = konvaTheme.labelText || "#333333";

  // Use vertices from backend or fall back to default
  const { A, B, C } = vertices || {
    A: { x: canvasWidth / 2 + 100, y: canvasHeight / 2 - 80 },
    B: { x: canvasWidth / 2 - 100, y: canvasHeight / 2 + 80 },
    C: { x: canvasWidth / 2 + 100, y: canvasHeight / 2 + 80 },
  };

  const labelOffset = 25;
  const fontSize = Math.max(14, Math.min(18, canvasWidth / 30));

  // Calculate label positions for each side
  // Side A (connects B to C, vertical on right)
  const sideA_mid = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const sideA_angle = Math.atan2(C.y - B.y, C.x - B.x);
  const sideA_perpAngle = sideA_angle + Math.PI / 2;
  const testXA = sideA_mid.x + Math.cos(sideA_perpAngle) * labelOffset;
  const testYA = sideA_mid.y + Math.sin(sideA_perpAngle) * labelOffset;
  const distToA1 = Math.sqrt((testXA - A.x) ** 2 + (testYA - A.y) ** 2);
  const distToA2 = Math.sqrt(
    (sideA_mid.x - Math.cos(sideA_perpAngle) * labelOffset - A.x) ** 2 +
    (sideA_mid.y - Math.sin(sideA_perpAngle) * labelOffset - A.y) ** 2
  );
  const sideA_label = distToA1 > distToA2
    ? { x: testXA, y: testYA }
    : {
        x: sideA_mid.x - Math.cos(sideA_perpAngle) * labelOffset,
        y: sideA_mid.y - Math.sin(sideA_perpAngle) * labelOffset,
      };

  // Side B (connects A to C, horizontal on bottom)
  const sideB_mid = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const sideB_angle = Math.atan2(C.y - A.y, C.x - A.x);
  const sideB_perpAngle = sideB_angle + Math.PI / 2;
  const testXB = sideB_mid.x + Math.cos(sideB_perpAngle) * labelOffset;
  const testYB = sideB_mid.y + Math.sin(sideB_perpAngle) * labelOffset;
  const distToB1 = Math.sqrt((testXB - B.x) ** 2 + (testYB - B.y) ** 2);
  const distToB2 = Math.sqrt(
    (sideB_mid.x - Math.cos(sideB_perpAngle) * labelOffset - B.x) ** 2 +
    (sideB_mid.y - Math.sin(sideB_perpAngle) * labelOffset - B.y) ** 2
  );
  const sideB_label = distToB1 > distToB2
    ? { x: testXB, y: testYB }
    : {
        x: sideB_mid.x - Math.cos(sideB_perpAngle) * labelOffset,
        y: sideB_mid.y - Math.sin(sideB_perpAngle) * labelOffset,
      };

  // Side C - Hypotenuse (diagonal, connects A to B)
  const sideC_mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const sideC_angle = Math.atan2(B.y - A.y, B.x - A.x);
  const sideC_perpAngle = sideC_angle + Math.PI / 2;
  const testXC = sideC_mid.x + Math.cos(sideC_perpAngle) * labelOffset;
  const testYC = sideC_mid.y + Math.sin(sideC_perpAngle) * labelOffset;
  const distToC1 = Math.sqrt((testXC - C.x) ** 2 + (testYC - C.y) ** 2);
  const distToC2 = Math.sqrt(
    (sideC_mid.x - Math.cos(sideC_perpAngle) * labelOffset - C.x) ** 2 +
    (sideC_mid.y - Math.sin(sideC_perpAngle) * labelOffset - C.y) ** 2
  );
  const sideC_label = distToC1 > distToC2
    ? { x: testXC, y: testYC }
    : {
        x: sideC_mid.x - Math.cos(sideC_perpAngle) * labelOffset,
        y: sideC_mid.y - Math.sin(sideC_perpAngle) * labelOffset,
      };

  // Right angle indicator size
  const sz = 15;

  // Calculate unit vectors for right angle square
  const toAcuteX = A.x - C.x;
  const toAcuteY = A.y - C.y;
  const toAcuteLen = Math.sqrt(toAcuteX * toAcuteX + toAcuteY * toAcuteY);
  const toAcuteUnitX = toAcuteX / toAcuteLen;
  const toAcuteUnitY = toAcuteY / toAcuteLen;

  const toThirdX = B.x - C.x;
  const toThirdY = B.y - C.y;
  const toThirdLen = Math.sqrt(toThirdX * toThirdX + toThirdY * toThirdY);
  const toThirdUnitX = toThirdX / toThirdLen;
  const toThirdUnitY = toThirdY / toThirdLen;

  // Right angle square corners
  const corner1 = { x: C.x, y: C.y };
  const corner2 = { x: C.x + toAcuteUnitX * sz, y: C.y + toAcuteUnitY * sz };
  const corner3 = {
    x: C.x + toAcuteUnitX * sz + toThirdUnitX * sz,
    y: C.y + toAcuteUnitY * sz + toThirdUnitY * sz,
  };
  const corner4 = { x: C.x + toThirdUnitX * sz, y: C.y + toThirdUnitY * sz };

  // Colors - theme aware
  const legColor = konvaTheme.adjacent || "#3B82F6";
  const hypColor = konvaTheme.hypotenuse || "#8B5CF6";
  const hiddenColor = konvaTheme.opposite || "#EF4444";

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* CRITICAL: Background must be first */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Triangle sides */}
        <Line points={[B.x, B.y, C.x, C.y]} stroke={legColor} strokeWidth={3} listening={false} />
        <Line points={[A.x, A.y, C.x, C.y]} stroke={legColor} strokeWidth={3} listening={false} />
        <Line points={[A.x, A.y, B.x, B.y]} stroke={hypColor} strokeWidth={3} listening={false} />

        {/* Right angle indicator */}
        <Line
          points={[
            corner1.x, corner1.y,
            corner2.x, corner2.y,
            corner3.x, corner3.y,
            corner4.x, corner4.y,
            corner1.x, corner1.y,
          ]}
          stroke={textColor}
          strokeWidth={2}
          listening={false}
        />

        {/* Side labels */}
        <Text
          x={sideA_label.x}
          y={sideA_label.y}
          text={hiddenSide === "a" ? "?" : `${sideA}`}
          fontSize={fontSize}
          fontStyle="bold"
          fill={hiddenSide === "a" ? hiddenColor : textColor}
          offsetX={10}
          offsetY={fontSize / 2}
          listening={false}
        />

        <Text
          x={sideB_label.x}
          y={sideB_label.y}
          text={hiddenSide === "b" ? "?" : `${sideB}`}
          fontSize={fontSize}
          fontStyle="bold"
          fill={hiddenSide === "b" ? hiddenColor : textColor}
          offsetX={10}
          offsetY={fontSize / 2}
          listening={false}
        />

        <Text
          x={sideC_label.x}
          y={sideC_label.y}
          text={hiddenSide === "c" ? "?" : `${sideC}`}
          fontSize={fontSize}
          fontStyle="bold"
          fill={hiddenSide === "c" ? hiddenColor : hypColor}
          offsetX={10}
          offsetY={fontSize / 2}
          listening={false}
        />

        {/* Not to Scale note */}
        {notToScale && (
          <Text
            x={canvasWidth - 10}
            y={10}
            text="(Not to Scale)"
            fontSize={Math.max(10, fontSize - 4)}
            fill={konvaTheme.labelText || "#9CA3AF"}
            opacity={0.6}
            align="right"
            offsetX={0}
            width={120}
            listening={false}
          />
        )}

        {/* Reference note for Level 1 */}
        {level === 1 && (
          <Text
            x={0}
            y={canvasHeight - 16}
            width={canvasWidth}
            align="center"
            text="3-4-5  •  5-12-13  •  8-15-17  •  7-24-25  •  9-40-41"
            fontSize={Math.max(9, fontSize - 5)}
            fill={konvaTheme.labelText || "#9CA3AF"}
            opacity={0.7}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function PythagoreanTriplesLesson({ triggerNewProblem }) {
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
  const canvasHeight = 320;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData?.triple?.[0] || 0}`;
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

  if (!currentProblem?.visualData) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {!showAnswer && phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      <VisualSection>
        <RightTriangle
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
                  {isCorrectSelected && " ✓"}
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
            placeholder="Enter answer"
          />
        </InteractionSection>
      )}

      {isMCLevel && phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>Try Another</TryAnotherButton>
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

export default PythagoreanTriplesLesson;

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
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
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
  margin-bottom: 12px;
`;
