import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Halving", instruction: "Both numbers are even. Divide both by 2 to simplify!" },
  2: { title: "Common Factors", instruction: "Find a number that divides both evenly." },
  3: { title: "Find the GCD", instruction: "Find the greatest common factor of both numbers." },
  4: { title: "Already Reduced?", instruction: "Can this fraction be simplified, or is it already in simplest form?" },
  5: { title: "Word Problems", instruction: "Read the problem, find the fraction, then reduce it." },
};

// ==================== KONVA FRACTION DISPLAY ====================

function KonvaFraction({ x, y, numerator, denominator, scale, color, konvaTheme }) {
  const fontSize = Math.round(44 * scale);
  const barWidth = Math.max(
    String(numerator).length,
    String(denominator).length
  ) * fontSize * 0.65 + 20;
  const barY = y + fontSize + 8;

  return (
    <>
      <Text
        x={x - barWidth / 2}
        y={y}
        width={barWidth}
        text={String(numerator)}
        fontSize={fontSize}
        fontStyle="bold"
        fill={color || konvaTheme.labelText}
        align="center"
      />
      <Line
        points={[x - barWidth / 2, barY, x + barWidth / 2, barY]}
        stroke={color || konvaTheme.shapeStroke}
        strokeWidth={3}
      />
      <Text
        x={x - barWidth / 2}
        y={barY + 8}
        width={barWidth}
        text={String(denominator)}
        fontSize={fontSize}
        fontStyle="bold"
        fill={color || konvaTheme.labelText}
        align="center"
      />
    </>
  );
}

// ==================== MAIN COMPONENT ====================

const ReducingFractions = ({ triggerNewProblem }) => {
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
  const [showHint, setShowHint] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1, originalFraction, reducedFraction, gcd: gcdValue, isAlreadyReduced } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "Reduce the fraction";
  const isWordProblem = visualData?.wordProblem === true;

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) {
      return currentProblem.answer.map((a) => (typeof a === "object" ? a.text : String(a)));
    }
    return [String(currentProblem?.answer || "")];
  }, [currentProblem]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  // Check if user entered an equivalent fraction that isn't fully reduced
  const getIncorrectMessage = useCallback((input) => {
    if (!input || !originalFraction) return null;
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!match) return null;
    const userNum = parseInt(match[1], 10);
    const userDen = parseInt(match[2], 10);
    if (userDen === 0) return null;
    // Check if the entered fraction is equivalent to the original
    // (cross-multiply: userNum * origDen === userDen * origNum)
    const isEquivalent =
      userNum * originalFraction.denominator === userDen * originalFraction.numerator;
    if (!isEquivalent) return null;
    // It's equivalent — but is it fully reduced?
    const g = (a, b) => (b === 0 ? a : g(b, a % b));
    if (g(userNum, userDen) > 1) return "Not fully reduced";
    return null;
  }, [originalFraction]);

  // Responsive canvas sizing
  const canvasWidth = Math.min(width - 40, 500);
  const scale = canvasWidth / 500;
  const canvasHeight = Math.round(180 * scale);

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  if (!currentProblem || !originalFraction) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Canvas positions
  const fractionX = showAnswer ? canvasWidth * 0.3 : canvasWidth / 2;
  const fractionY = 20 * scale;
  const equalsX = canvasWidth * 0.52;
  const resultX = canvasWidth * 0.72;

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !showHint && hint && (
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

      {/* Question text */}
      <QuestionTextStyled>{questionText}</QuestionTextStyled>

      {/* Fraction visualization */}
      {!isWordProblem && (
        <VisualSection>
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

              {/* Original fraction */}
              <KonvaFraction
                x={fractionX}
                y={fractionY}
                numerator={originalFraction.numerator}
                denominator={originalFraction.denominator}
                scale={scale}
                konvaTheme={konvaTheme}
              />

              {/* On answer reveal: equals sign + reduced fraction */}
              {showAnswer && (
                <>
                  <Text
                    x={equalsX - 15 * scale}
                    y={fractionY + 30 * scale}
                    text="="
                    fontSize={Math.round(40 * scale)}
                    fontStyle="bold"
                    fill={konvaTheme.labelText}
                  />
                  <KonvaFraction
                    x={resultX}
                    y={fractionY}
                    numerator={reducedFraction.numerator}
                    denominator={reducedFraction.denominator}
                    scale={scale}
                    color={isAlreadyReduced ? konvaTheme.adjacent : konvaTheme.horizontal}
                    konvaTheme={konvaTheme}
                  />
                </>
              )}

              {/* GCD indicator (before answer, levels 1-2 only) */}
              {!showAnswer && level <= 2 && gcdValue > 1 && (
                <Text
                  x={fractionX + 60 * scale}
                  y={fractionY + 30 * scale}
                  text={`÷ ${gcdValue}`}
                  fontSize={Math.round(20 * scale)}
                  fill={konvaTheme.angle}
                  fontStyle="bold"
                />
              )}
            </Layer>
          </Stage>
        </VisualSection>
      )}

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

        {!showAnswer && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="e.g. 3/5"
            getIncorrectMessage={getIncorrectMessage}
          />
        )}
      </InteractionSection>

      {/* Explanation */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {isAlreadyReduced ? "Already in Simplest Form!" : "Correct!"}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
};

export default ReducingFractions;

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

const QuestionTextStyled = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 4px 0 12px 0;
  max-width: 700px;
  line-height: 1.5;

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
